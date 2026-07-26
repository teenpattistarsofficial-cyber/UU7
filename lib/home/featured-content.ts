import "server-only";
import { unstable_cache } from "next/cache";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, postFaqs, media } from "@/lib/db/schema";
import { POST_SUMMARY_COLUMNS, toPostSummary, type PostSummary } from "@/lib/posts/post-summary";
import { SITE_CATEGORIES } from "@/lib/site-categories";

// Every exported function below is wrapped in unstable_cache — this app
// reads exclusively via direct drizzle/postgres.js queries, never `fetch`,
// and in this Next.js version's (non-Cache-Components) model, `export const
// revalidate` on a page only governs `fetch`-based caching; it does nothing
// for direct DB calls. Confirmed empirically: a bare page with `revalidate
// = 3600` and one uncached `db.query` call still served
// `Cache-Control: no-store` on every request. unstable_cache is the
// documented mechanism for caching non-fetch data sources under this model.
// Tagged "posts"/"categories" (broad, not per-slug) so a single edit
// anywhere in that collection safely invalidates everything derived from
// it — coarser than strictly necessary, but correctness (never stale) matters
// more than cache-hit-ratio precision for this first rollout. The matching
// `revalidateTag` calls live in lib/actions/posts.ts and categories.ts.

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
  "uu7game-games-overview",
  "uu7game-mobile-app",
  "uu7game-aviator-guide",
  "uu7game-casino-games-guide",
  "uu7game-slots-guide",
];

const POPULAR_GAME_SLUGS = [
  "online-rummy-guide-rules-formats-and-strategy",
  "uu7game-slots-guide",
  "uu7game-casino-games-guide",
  "uu7game-aviator-guide",
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
    .leftJoin(media, eq(media.url, posts.featuredImageUrl))
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

export const getFeaturedGuides = unstable_cache(
  async (): Promise<PostSummary[]> => {
    const rows = await loadPublishedPillars(FEATURED_PILLAR_SLUGS);
    return rows.map(toPostSummary);
  },
  ["featured-guides"],
  { tags: ["posts"], revalidate: 3600 },
);

export const getPopularGames = unstable_cache(
  async (): Promise<PostSummary[]> => {
    const rows = await loadPublishedPillars(POPULAR_GAME_SLUGS);
    return rows.map(toPostSummary);
  },
  ["popular-games"],
  { tags: ["posts"], revalidate: 3600 },
);

/** Most-recently-published posts site-wide, regardless of pillar-curation
 * status — unlike the two functions above, this isn't limited to the
 * hand-picked slug lists, so it's what actually reflects "we just shipped
 * this" on the homepage. */
export const getLatestPosts = unstable_cache(
  async (limit = 6): Promise<PostSummary[]> => {
    const rows = await db
      .select(POST_SUMMARY_COLUMNS)
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(media, eq(media.url, posts.featuredImageUrl))
      .where(and(eq(posts.status, "published"), isNull(posts.deletedAt)))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);

    return rows.filter((r): r is typeof r & { categorySlug: string; categoryName: string } => Boolean(r.categorySlug)).map(toPostSummary);
  },
  ["latest-posts"],
  { tags: ["posts"], revalidate: 3600 },
);

/** Real published-post counts per top-level category, for the homepage's
 * traffic-independent "Browse by Category" section — unlike Featured
 * Guides/Popular Games above, this needs no curated slug list and can't go
 * stale the same way: it just reflects whatever's actually published
 * against `SITE_CATEGORIES` (lib/site-categories.ts), the same shared list
 * the header nav uses. */
export const getCategoryOverview = unstable_cache(
  async () => {
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

    // Deliberately NOT `{ ...c, count }` — SITE_CATEGORIES entries carry a
    // real Lucide icon component reference (a function), and unstable_cache
    // persists its return value through a serialization boundary that
    // silently mangles function references into a dead, non-callable
    // object. Rendering that as <Icon /> threw "Element type is invalid:
    // ...but got: object" in production — confirmed live, not theoretical.
    // Only plain, JSON-safe fields cross this cache boundary; callers look
    // the icon back up from SITE_CATEGORIES/getCategoryMeta by slug at
    // render time instead (components/home/browse-categories.tsx).
    return SITE_CATEGORIES.map((c) => ({ slug: c.slug, label: c.label, href: c.href, count: countBySlug.get(c.slug) ?? 0 }));
  },
  ["category-overview"],
  { tags: ["posts", "categories"], revalidate: 3600 },
);

/** Pulls FAQ entries straight from whichever featured pillars are actually
 * published (reuses post_faqs — no new table), so this fills out
 * automatically as more pillars ship, same as the sections above. */
export const getHomepageFaqs = unstable_cache(
  async (limit = 6): Promise<{ question: string; answer: string }[]> => {
    const rows = await loadPublishedPillars(FEATURED_PILLAR_SLUGS);
    if (rows.length === 0) return [];

    const faqRows = await db
      .select({ question: postFaqs.question, answer: postFaqs.answer })
      .from(postFaqs)
      .where(inArray(postFaqs.postId, rows.map((r) => r.id)))
      .limit(limit);

    return faqRows;
  },
  ["homepage-faqs"],
  { tags: ["posts"], revalidate: 3600 },
);
