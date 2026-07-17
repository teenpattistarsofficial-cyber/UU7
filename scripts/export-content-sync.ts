import { db } from "@/lib/db";
import { posts, categories, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postStatsTables, postCtas } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import fs from "node:fs";

const POST_SLUGS = [
  "uu7game-games-overview",
  "the-ultimate-uu7game-guide",
  "uu7game-login-guide",
  "uu7game-apk-download-guide",
  "uu7game-registration-guide",
  "online-rummy-guide-rules-formats-and-strategy",
  "uu7game-review-2026-is-it-legit",
  // Created via their own dedicated scripts (create-deposit-guide.ts,
  // create-official-site-guide.ts) rather than this export/apply pair —
  // listed here too so any *future* edit to either gets picked up by the
  // ongoing sync once they exist on whichever database this runs against.
  "uu7game-deposit-and-withdrawal-guide",
  "uu7game-official-site-guide",
  "uu7game-casino-games-guide",
  "uu7game-slots-guide",
  "uu7game-rummy-guide",
  "uu7game-mobile-app",
  "uu7game-aviator-guide",
  "best-real-money-gaming-apps-in-india-2026",
  "uu7game-vs-other-gaming-apps",
  "aviator-betting-strategy-and-risk-management",
  "fastest-withdrawal-gaming-apps",
  "bankroll-management-gaming-guide",
  "uu7game-bonus-guide",
];

const CATEGORY_SLUGS = ["betting-guides", "statistics-reports", "app-tutorials", "bonuses"];

async function main() {
  const output: any = { posts: [], categories: [] };

  for (const slug of POST_SLUGS) {
    const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
    if (!post) {
      console.log(`MISSING post: ${slug}`);
      continue;
    }
    const seo = await db.query.seoMeta.findFirst({ where: and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, post.id)) });
    const entry: any = {
      slug,
      content: post.content,
      featuredImageUrl: post.featuredImageUrl,
      focusKeyword: seo?.focusKeyword ?? null,
      seoTitle: seo?.seoTitle ?? null,
    };

    if (slug === "uu7game-review-2026-is-it-legit") {
      entry.quickAnswer = (await db.query.postQuickAnswer.findFirst({ where: eq(postQuickAnswer.postId, post.id) }))?.text ?? null;
      entry.aiSummary = (await db.query.postAiSummary.findFirst({ where: eq(postAiSummary.postId, post.id) }))?.summary ?? null;
      entry.keyTakeaways = (
        await db.query.postKeyTakeaways.findMany({ where: eq(postKeyTakeaways.postId, post.id), orderBy: (t, { asc }) => asc(t.position) })
      ).map((t) => t.text);
      entry.faqs = (
        await db.query.postFaqs.findMany({ where: eq(postFaqs.postId, post.id), orderBy: (f, { asc }) => asc(f.position) })
      ).map((f) => ({ question: f.question, answer: f.answer }));
      entry.statsTables = (
        await db.query.postStatsTables.findMany({ where: eq(postStatsTables.postId, post.id), orderBy: (t, { asc }) => asc(t.position) })
      ).map((t) => ({ title: t.title, columns: t.columns, rows: t.rows }));
      entry.ctas = (
        await db.query.postCtas.findMany({ where: eq(postCtas.postId, post.id), orderBy: (c, { asc }) => asc(c.position) })
      ).map((c) => ({ heading: c.heading, description: c.description, buttonText: c.buttonText, buttonUrl: c.buttonUrl }));
    }

    output.posts.push(entry);
  }

  for (const slug of CATEGORY_SLUGS) {
    const cat = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
    if (!cat) {
      console.log(`MISSING category: ${slug}`);
      continue;
    }
    const seo = await db.query.seoMeta.findFirst({ where: and(eq(seoMeta.entityType, "category"), eq(seoMeta.entityId, cat.id)) });
    output.categories.push({
      slug,
      focusKeyword: seo?.focusKeyword ?? null,
      seoTitle: seo?.seoTitle ?? null,
    });
  }

  fs.writeFileSync("scripts/data/todays-content-sync.json", JSON.stringify(output, null, 2));
  console.log(`Exported ${output.posts.length} posts, ${output.categories.length} categories.`);
  process.exit(0);
}
main();
