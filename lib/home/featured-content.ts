import "server-only";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, postFaqs } from "@/lib/db/schema";
import { POST_SUMMARY_COLUMNS, toPostSummary, type PostSummary } from "@/lib/posts/post-summary";
import { SITE_CATEGORIES } from "@/lib/site-categories";

// Curated pillar posts for the homepage's Featured Guides / Popular Games
// sections — a plain hardcoded list of slugs rather than a `featured` DB
// column and an admin toggle, matching this codebase's existing precedent
// (see CANONICAL_PAGE_SLUGS in app/sitemap.ts) of not building an
// abstraction until there's real pressure to change it. These are the
// canonical pillar slugs from docs/seo-content-strategy-plan.md §3/§11 —
// each one appears here automatically the day it's published, with zero
// further code changes.
// NOTE: keep in sync with whatever slug a new pillar guide actually
// publishes under — these lists silently render nothing for any slug that
// doesn't match a real published post (see loadPublishedPillars below), so
// a renamed or newly-shipped pillar needs its real slug added here, not
// just published.
const FEATURED_PILLAR_SLUGS = [
  "the-ultimate-uu7game-guide",
  "online-rummy-guide-rules-formats-and-strategy",
  "uu7game-slots-guide",
  "uu7game-casino-games-guide",
];

const POPULAR_GAME_SLUGS = [
  "online-rummy-guide-rules-formats-and-strategy",
  "uu7game-slots-guide",
  "uu7game-casino-games-guide",
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
    // `deletedAt` is separate from `status` (a trashed post keeps its prior
    // status) — without this, a soft-deleted post stays visible everywhere
    // this query feeds (Featured Guides, Popular Games, homepage FAQs).
    .where(and(inArray(posts.slug, slugs), eq(posts.status, "published"), isNull(posts.deletedAt)));

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
    .where(and(eq(posts.status, "published"), isNull(posts.deletedAt)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return rows.filter((r): r is typeof r & { categorySlug: string; categoryName: string } => Boolean(r.categorySlug)).map(toPostSummary);
}

/** Real published-post counts per top-level category, for the homepage's
 * traffic-independent "Browse by Category" section — unlike Featured
 * Guides/Popular Games above, this needs no curated slug list and can't go
 * stale the same way: it just reflects whatever's actually published
 * against `SITE_CATEGORIES` (lib/site-categories.ts), the same shared list
 * the header nav uses. */
export async function getCategoryOverview() {
  const rows = await db
    .select({ categoryId: posts.categoryId, count: sql<number>`count(*)::int` })
    .from(posts)
    .where(and(eq(posts.status, "published"), isNull(posts.deletedAt)))
    .groupBy(posts.categoryId);

  const allCategories = await db.select({ id: categories.id, slug: categories.slug }).from(categories).where(isNull(categories.deletedAt));
  const slugById = new Map(allCategories.map((c) => [c.id, c.slug]));
  const countBySlug = new Map<string, number>();
  for (const row of rows) {
    const slug = row.categoryId ? slugById.get(row.categoryId) : undefined;
    if (slug) countBySlug.set(slug, row.count);
  }

  return SITE_CATEGORIES.map((c) => ({ ...c, count: countBySlug.get(c.slug) ?? 0 }));
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
