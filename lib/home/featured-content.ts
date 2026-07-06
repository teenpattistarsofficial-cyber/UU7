import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, postFaqs } from "@/lib/db/schema";

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

export type FeaturedPost = {
  id: string;
  title: string;
  excerpt: string | null;
  url: string;
};

async function loadPublishedPillars(slugs: string[]) {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      slug: posts.slug,
      categorySlug: categories.slug,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(inArray(posts.slug, slugs), eq(posts.status, "published")));

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  // Preserve curated order; drop anything not yet published or uncategorized
  // (same "no valid public URL" constraint the article page and sitemap
  // already apply to posts without a category).
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((r): r is NonNullable<typeof r> & { categorySlug: string } => Boolean(r?.categorySlug));
}

export async function getFeaturedGuides(): Promise<FeaturedPost[]> {
  const rows = await loadPublishedPillars(FEATURED_PILLAR_SLUGS);
  return rows.map((r) => ({ id: r.id, title: r.title, excerpt: r.excerpt, url: `/${r.categorySlug}/${r.slug}` }));
}

export async function getPopularGames(): Promise<FeaturedPost[]> {
  const rows = await loadPublishedPillars(POPULAR_GAME_SLUGS);
  return rows.map((r) => ({ id: r.id, title: r.title, excerpt: r.excerpt, url: `/${r.categorySlug}/${r.slug}` }));
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
