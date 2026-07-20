import "server-only";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, media } from "@/lib/db/schema";

/** The "post preview card" shape shared by every place on the site that
 * shows a grid/list of posts — homepage sections (lib/home/featured-content.ts
 * re-exports this as `FeaturedPost` for its own call sites), the category
 * listing page, an article's Related Posts, and an author's article list.
 * Centralized here so all four render through the same `PostCard`
 * component (components/home/post-card.tsx) instead of each inventing its
 * own plainer markup. */
export type PostSummary = {
  id: string;
  title: string;
  excerpt: string | null;
  url: string;
  categorySlug: string;
  categoryName: string;
  featuredImageUrl: string | null;
  // Looked up from the media table by URL match (featuredImageUrl is a
  // plain string, not an FK — see the "Phase 3" comment on posts.featuredImageUrl)
  // since a post's cover is meaningful content, not decorative, and needs
  // real alt text rather than the empty string decorative images use.
  featuredImageAlt: string | null;
  readingTimeMinutes: number | null;
};

export const POST_SUMMARY_COLUMNS = {
  id: posts.id,
  title: posts.title,
  excerpt: posts.excerpt,
  slug: posts.slug,
  categorySlug: categories.slug,
  categoryName: categories.name,
  featuredImageUrl: posts.featuredImageUrl,
  featuredImageAlt: media.alt,
  readingTimeMinutes: posts.readingTimeMinutes,
} as const;

type PostSummaryRow = {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  categorySlug: string | null;
  categoryName: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  readingTimeMinutes: number | null;
};

export function toPostSummary(r: PostSummaryRow & { categorySlug: string; categoryName: string }): PostSummary {
  return {
    id: r.id,
    title: r.title,
    excerpt: r.excerpt,
    url: `/${r.categorySlug}/${r.slug}`,
    categorySlug: r.categorySlug,
    categoryName: r.categoryName,
    featuredImageUrl: r.featuredImageUrl,
    featuredImageAlt: r.featuredImageAlt,
    readingTimeMinutes: r.readingTimeMinutes,
  };
}

/** Fetches full card data for a known, already-decided set of post ids
 * (e.g. the 3 related-post ids a scoring pass already picked) — a second,
 * cheap query rather than teaching the scorer itself to carry image/excerpt
 * payloads it doesn't need for scoring. Preserves the input order, since
 * callers have usually already ranked these ids (by relevance score or
 * manual pin order) and a plain `WHERE id IN (...)` doesn't. */
export async function getPostSummariesByIds(ids: string[]): Promise<PostSummary[]> {
  if (ids.length === 0) return [];

  const rows = await db
    .select(POST_SUMMARY_COLUMNS)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(media, eq(media.url, posts.featuredImageUrl))
    // Defensive, not just relying on callers to have already filtered
    // trashed posts out of `ids` — a manually pinned related-post id could
    // point at a post that's since been trashed.
    .where(and(inArray(posts.id, ids), isNull(posts.deletedAt)));

  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> & { categorySlug: string; categoryName: string } => Boolean(r?.categorySlug))
    .map(toPostSummary);
}
