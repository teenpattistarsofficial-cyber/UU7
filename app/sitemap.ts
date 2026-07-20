import type { MetadataRoute } from "next";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, authors, pages } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";

// The four pages with their own literal route file — kept live in the
// sitemap even before an editor publishes a matching `pages` row (they
// still render placeholder copy, see app/(site)/about-uu7/page.tsx etc.).
// Any other published page renders through the [category] route's generic
// fallback and is added to the sitemap dynamically below.
const CANONICAL_PAGE_SLUGS = new Set(["about-uu7", "contact", "editorial-policy", "responsible-gaming", "faq"]);

// Single sitemap for now — Google's per-file cap is 50k URLs, and this site
// is nowhere near that. Shard via `generateSitemaps` if it ever gets there
// (~20-30k URLs is the documented trigger point).
//
// This route has no params, so without `force-dynamic` Next would try to
// statically prerender it — including at `next build` time, which would
// both require a live DATABASE_URL during the Docker build AND freeze the
// sitemap to whatever existed at that build forever. `force-dynamic`
// computes it fresh on every request instead (cheap: a few indexed
// selects), same as every other DB-backed public route in this app.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // `deletedAt` is separate from `status` — a trashed post/page keeps its
  // prior status, so both must be excluded explicitly or a trashed page's
  // now-404ing URL stays listed here, telling Google to crawl a dead link.
  // Categories and authors have no `status` at all, just `deletedAt`.
  const [publishedPosts, allCategories, allAuthors, publishedPages] = await Promise.all([
    db.select().from(posts).where(and(eq(posts.status, "published"), isNull(posts.deletedAt))),
    db.select().from(categories).where(isNull(categories.deletedAt)),
    db.select().from(authors).where(isNull(authors.deletedAt)),
    db.select().from(pages).where(and(eq(pages.status, "published"), isNull(pages.deletedAt))),
  ]);

  const categorySlugById = new Map(allCategories.map((c) => [c.id, c.slug]));
  const publishedPageBySlug = new Map(publishedPages.map((p) => [p.slug, p]));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/authors`, changeFrequency: "monthly", priority: 0.5 },
    ...[...CANONICAL_PAGE_SLUGS].map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: publishedPageBySlug.get(slug)?.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  // Any published page beyond the four canonical ones, reachable through
  // the [category] route's generic page fallback.
  const customPageRoutes: MetadataRoute.Sitemap = publishedPages
    .filter((p) => !CANONICAL_PAGE_SLUGS.has(p.slug))
    .map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "yearly",
      priority: 0.3,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = allCategories.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const authorRoutes: MetadataRoute.Sitemap = allAuthors.map((a) => ({
    url: `${SITE_URL}/authors/${a.slug}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  // Only posts with a valid category are linkable — same constraint the
  // Posts list's View icon already enforces (a post's public URL is
  // /category/slug, so one without a category has nowhere to resolve to).
  const postRoutes: MetadataRoute.Sitemap = publishedPosts
    .filter((p) => p.categoryId && categorySlugById.has(p.categoryId))
    .map((p) => ({
      url: `${SITE_URL}/${categorySlugById.get(p.categoryId!)}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [...staticRoutes, ...customPageRoutes, ...categoryRoutes, ...authorRoutes, ...postRoutes];
}
