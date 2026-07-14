import fs from "node:fs";
import { db } from "@/lib/db";
import {
  posts,
  categories,
  seoMeta,
  postQuickAnswer,
  postAiSummary,
  postKeyTakeaways,
  postFaqs,
  postStatsTables,
  postCtas,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Applies scripts/data/todays-content-sync.json (built by
// export-content-sync.ts against local dev) to whatever DATABASE_URL this
// runs against — looked up by slug, not id, since local dev and production
// are separate databases with independently generated UUIDs for the same
// content. Safe to re-run: every write is a full overwrite of the target
// row(s) keyed by slug, not an insert, so running it twice produces the
// same end state rather than duplicating anything.
//
// Every write is also skip-if-unchanged: `posts.updatedAt` feeds
// app/sitemap.ts's per-URL `lastmod`, so touching a post whose content is
// already identical would report a false "changed" date to Google on
// every deploy, not just the ones that actually changed something. This
// diffs against the current row first and only writes (and only bumps
// updatedAt) when something in this specific entry actually differs.

async function main() {
  const data = JSON.parse(fs.readFileSync("scripts/data/todays-content-sync.json", "utf-8"));
  const APPLY = process.argv.includes("--apply");
  let changedCount = 0;
  let unchangedCount = 0;

  for (const entry of data.posts) {
    const post = await db.query.posts.findFirst({ where: eq(posts.slug, entry.slug) });
    if (!post) {
      console.log(`SKIP post (not found): ${entry.slug}`);
      continue;
    }

    const contentChanged = JSON.stringify(post.content) !== JSON.stringify(entry.content);
    const imageChanged = (post.featuredImageUrl ?? null) !== (entry.featuredImageUrl ?? null);
    const postRowChanged = contentChanged || imageChanged;

    const seo = await db.query.seoMeta.findFirst({ where: and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, post.id)) });
    const seoChanged = (seo?.focusKeyword ?? null) !== (entry.focusKeyword ?? null) || (entry.seoTitle && seo?.seoTitle !== entry.seoTitle);

    if (!postRowChanged && !seoChanged) {
      console.log(`Post "${post.title}" (${entry.slug}) — unchanged, skipped`);
      unchangedCount++;
    } else {
      console.log(`Post "${post.title}" (${entry.slug}) — ${[contentChanged && "content", imageChanged && "image", seoChanged && "seo"].filter(Boolean).join(", ")} changed`);
      changedCount++;
      if (APPLY) {
        if (postRowChanged) {
          await db.update(posts).set({ content: entry.content, featuredImageUrl: entry.featuredImageUrl, updatedAt: new Date() }).where(eq(posts.id, post.id));
        }
        if (seoChanged) {
          await db
            .insert(seoMeta)
            .values({ entityType: "post", entityId: post.id, focusKeyword: entry.focusKeyword, seoTitle: entry.seoTitle })
            .onConflictDoUpdate({
              target: [seoMeta.entityType, seoMeta.entityId],
              set: { focusKeyword: entry.focusKeyword, ...(entry.seoTitle ? { seoTitle: entry.seoTitle } : {}) },
            });
        }
      }
    }

    if (entry.quickAnswer !== undefined) {
      const currentQuickAnswer = await db.query.postQuickAnswer.findFirst({ where: eq(postQuickAnswer.postId, post.id) });
      const currentAiSummary = await db.query.postAiSummary.findFirst({ where: eq(postAiSummary.postId, post.id) });
      const currentTakeaways = await db.query.postKeyTakeaways.findMany({ where: eq(postKeyTakeaways.postId, post.id), orderBy: (t, { asc }) => asc(t.position) });
      const currentFaqs = await db.query.postFaqs.findMany({ where: eq(postFaqs.postId, post.id), orderBy: (f, { asc }) => asc(f.position) });
      const currentStatsTables = await db.query.postStatsTables.findMany({ where: eq(postStatsTables.postId, post.id), orderBy: (t, { asc }) => asc(t.position) });
      const currentCtas = await db.query.postCtas.findMany({ where: eq(postCtas.postId, post.id), orderBy: (c, { asc }) => asc(c.position) });

      const blocksChanged =
        currentQuickAnswer?.text !== entry.quickAnswer ||
        currentAiSummary?.summary !== entry.aiSummary ||
        JSON.stringify(currentTakeaways.map((t) => t.text)) !== JSON.stringify(entry.keyTakeaways) ||
        JSON.stringify(currentFaqs.map((f) => ({ question: f.question, answer: f.answer }))) !== JSON.stringify(entry.faqs) ||
        JSON.stringify(currentStatsTables.map((t) => ({ title: t.title, columns: t.columns, rows: t.rows }))) !== JSON.stringify(entry.statsTables) ||
        JSON.stringify(currentCtas.map((c) => ({ heading: c.heading, description: c.description, buttonText: c.buttonText, buttonUrl: c.buttonUrl }))) !== JSON.stringify(entry.ctas);

      if (!blocksChanged) {
        console.log("  Quick Answer / AI Summary / Key Takeaways / FAQs / Stats Tables / CTAs — unchanged, skipped");
      } else {
        console.log("  + Quick Answer, AI Summary, Key Takeaways, FAQs, Stats Tables, CTAs changed");
        if (APPLY) {
          await db
            .insert(postQuickAnswer)
            .values({ postId: post.id, text: entry.quickAnswer })
            .onConflictDoUpdate({ target: postQuickAnswer.postId, set: { text: entry.quickAnswer } });

          await db
            .insert(postAiSummary)
            .values({ postId: post.id, summary: entry.aiSummary })
            .onConflictDoUpdate({ target: postAiSummary.postId, set: { summary: entry.aiSummary } });

          await db.delete(postKeyTakeaways).where(eq(postKeyTakeaways.postId, post.id));
          await db.insert(postKeyTakeaways).values(entry.keyTakeaways.map((text: string, position: number) => ({ postId: post.id, text, position })));

          await db.delete(postFaqs).where(eq(postFaqs.postId, post.id));
          await db.insert(postFaqs).values(entry.faqs.map((f: any, position: number) => ({ postId: post.id, ...f, position })));

          await db.delete(postStatsTables).where(eq(postStatsTables.postId, post.id));
          await db.insert(postStatsTables).values(entry.statsTables.map((t: any, position: number) => ({ postId: post.id, ...t, position })));

          await db.delete(postCtas).where(eq(postCtas.postId, post.id));
          await db.insert(postCtas).values(entry.ctas.map((c: any, position: number) => ({ postId: post.id, ...c, position })));
        }
      }
    }
  }

  for (const entry of data.categories) {
    const cat = await db.query.categories.findFirst({ where: eq(categories.slug, entry.slug) });
    if (!cat) {
      console.log(`SKIP category (not found): ${entry.slug}`);
      continue;
    }
    const seo = await db.query.seoMeta.findFirst({ where: and(eq(seoMeta.entityType, "category"), eq(seoMeta.entityId, cat.id)) });
    const categoryChanged = (seo?.focusKeyword ?? null) !== (entry.focusKeyword ?? null) || (seo?.seoTitle ?? null) !== (entry.seoTitle ?? null);

    if (!categoryChanged) {
      console.log(`Category "${cat.name}" (${entry.slug}) — unchanged, skipped`);
      unchangedCount++;
      continue;
    }
    console.log(`Category "${cat.name}" (${entry.slug}) — changed`);
    changedCount++;
    if (APPLY) {
      await db
        .insert(seoMeta)
        .values({ entityType: "category", entityId: cat.id, focusKeyword: entry.focusKeyword, seoTitle: entry.seoTitle })
        .onConflictDoUpdate({
          target: [seoMeta.entityType, seoMeta.entityId],
          set: { focusKeyword: entry.focusKeyword, seoTitle: entry.seoTitle },
        });
    }
  }

  console.log("---");
  console.log(`${changedCount} changed, ${unchangedCount} unchanged/skipped.`);
  console.log(APPLY ? "Applied." : "Dry run only — pass --apply to write.");
  process.exit(0);
}
main();
