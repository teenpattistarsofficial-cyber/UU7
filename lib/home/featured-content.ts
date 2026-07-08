import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, postFaqs } from "@/lib/db/schema";
import { POST_SUMMARY_COLUMNS, toPostSummary, type PostSummary } from "@/lib/posts/post-summary";

// Curated pillar posts for the homepage's Featured Guides / Popular Games
// sections — a plain hardcoded list of slugs rather than a `featured` DB
// column and an admin toggle, matching this codebase's existing precedent
// (see CANONICAL_PAGE_SLUGS in app/sitemap.ts) of not building an
// abstraction until there's real pressure to change it. These are the
// canonical pillar slugs from docs/seo-content-strategy-plan.md §3/§11 —
// each one appears here automatically the day it's published, with zero
// further code changes.
const FEATURED_PILLAR_SLUGS = [
  "the-ultimate-uu7game-guide",
  "uu7game-bonus-guide",
  "online-rummy-guide",
  "teen-patti-guide",
  "online-slots-guide",
  "aviator-game-guide",
  "live-casino-guide",
];

const POPULAR_GAME_SLUGS = [
  "online-rummy-guide",
  "teen-patti-guide",
  "online-slots-guide",
  "aviator-game-guide",
  "live-casino-guide",
];

// Re-exported under this homepage-specific name since every home/*
// component already imports `FeaturedPost` from here — the underlying
// shape (lib/posts/post-summary.ts) is shared more broadly now (category
// listing, related posts, author articles), but renaming every existing
// import for a cosmetic reason isn't worth the churn.
export type { PostSummary as FeaturedPost } from "@/lib/posts/post-summary";

async function loadPublishedPillars(slugs: string[]) {
  const rows = await db
    .select(POST_SUMMARY_COLUMNS)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(inArray(posts.slug, slugs), eq(posts.status, "published")));

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  // Preserve curated order; drop anything not yet published or uncategorized
  // (same "no valid public URL" constraint the article page and sitemap
  // already apply to posts without a category).
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((r): r is NonNullable<typeof r> & { categorySlug: string; categoryName: string } =>
      Boolean(r?.categorySlug),
    );
}

export async function getFeaturedGuides(): Promise<PostSummary[]> {
  const rows = await loadPublishedPillars(FEATURED_PILLAR_SLUGS);
  return rows.map(toPostSummary);
}

export async function getPopularGames(): Promise<PostSummary[]> {
  const rows = await loadPublishedPillars(POPULAR_GAME_SLUGS);
  return rows.map(toPostSummary);
}

/** Most-recently-published posts site-wide, regardless of pillar-curation
 * status — unlike the two functions above, this isn't limited to the
 * hand-picked slug lists, so it's what actually reflects "we just shipped
 * this" on the homepage. */
export async function getLatestPosts(limit = 6): Promise<PostSummary[]> {
  const rows = await db
    .select(POST_SUMMARY_COLUMNS)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return rows.filter((r): r is typeof r & { categorySlug: string; categoryName: string } => Boolean(r.categorySlug)).map(toPostSummary);
}

/** Pulls FAQ entries straight from whichever featured pillars are actually
 * published (reuses post_faqs — no new table), so this fills out
 * automatically as more pillars ship, same as the sections above. */
export async function getHomepageFaqs(limit = 6): Promise<{ question: string; answer: string }[]> {
  const rows = await loadPublishedPillars(FEATURED_PILLAR_SLUGS);
  if (rows.length === 0) return [];

  const faqRows = await db
    .select({ question: postFaqs.question, answer: postFaqs.answer })
    .from(postFaqs)
    .where(inArray(postFaqs.postId, rows.map((r) => r.id)))
    .limit(limit);

  return faqRows;
}
