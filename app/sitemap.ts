import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, authors } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";

// Single sitemap for now — Google's per-file cap is 50k URLs, and this site
// is nowhere near that. Shard via `generateSitemaps` if it ever gets there
// (~20-30k URLs is the documented trigger point).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedPosts, allCategories, allAuthors] = await Promise.all([
    db.select().from(posts).where(eq(posts.status, "published")),
    db.select().from(categories),
    db.select().from(authors),
  ]);

  const categorySlugById = new Map(allCategories.map((c) => [c.id, c.slug]));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/authors`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/editorial-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/responsible-gaming`, changeFrequency: "yearly", priority: 0.3 },
  ];

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

  return [...staticRoutes, ...categoryRoutes, ...authorRoutes, ...postRoutes];
}
