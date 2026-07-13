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

async function main() {
  const data = JSON.parse(fs.readFileSync("scripts/data/todays-content-sync.json", "utf-8"));
  const APPLY = process.argv.includes("--apply");

  for (const entry of data.posts) {
    const post = await db.query.posts.findFirst({ where: eq(posts.slug, entry.slug) });
    if (!post) {
      console.log(`SKIP post (not found): ${entry.slug}`);
      continue;
    }
    console.log(`Post "${post.title}" (${entry.slug})`);

    if (APPLY) {
      await db.update(posts).set({ content: entry.content, featuredImageUrl: entry.featuredImageUrl, updatedAt: new Date() }).where(eq(posts.id, post.id));
      await db
        .insert(seoMeta)
        .values({ entityType: "post", entityId: post.id, focusKeyword: entry.focusKeyword, seoTitle: entry.seoTitle })
        .onConflictDoUpdate({
          target: [seoMeta.entityType, seoMeta.entityId],
          set: { focusKeyword: entry.focusKeyword, ...(entry.seoTitle ? { seoTitle: entry.seoTitle } : {}) },
        });
    }

    if (entry.quickAnswer !== undefined) {
      console.log("  + Quick Answer, AI Summary, Key Takeaways, FAQs, Stats Tables, CTAs");
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

  for (const entry of data.categories) {
    const cat = await db.query.categories.findFirst({ where: eq(categories.slug, entry.slug) });
    if (!cat) {
      console.log(`SKIP category (not found): ${entry.slug}`);
      continue;
    }
    console.log(`Category "${cat.name}" (${entry.slug})`);
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
  console.log(APPLY ? "Applied." : "Dry run only — pass --apply to write.");
  process.exit(0);
}
main();
