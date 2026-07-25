import "server-only";
import { unstable_cache } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, posts, seoMeta, media } from "@/lib/db/schema";

/** Everything app/(site)/[category]/page.tsx needs for a real category
 * (its own row, SEO meta for generateMetadata, and its published posts) in
 * one cached call — both generateMetadata and the page component call this
 * with the same slug, so wrapping the whole bundle once avoids duplicating
 * the "is this actually a category" lookup and its own uncached-DB-call
 * problem (see the note in lib/home/featured-content.ts) in two places.
 * Returns null for anything that isn't a real category — including the
 * four hardcoded page slugs, which own their own literal routes and never
 * reach this dynamic one, and any CMS Page slug, which the caller falls
 * back to lib/pages/get-page.ts for. Tagged "posts" (its post list) and
 * "categories" (its own name/description/existence) — invalidated by
 * lib/actions/posts.ts and lib/actions/categories.ts on every mutation. */
export const getCategoryPageData = unstable_cache(
  async (slug: string) => {
    const category = await db.query.categories.findFirst({
      where: and(eq(categories.slug, slug), isNull(categories.deletedAt)),
    });
    if (!category) return null;

    const [seo, categoryPosts] = await Promise.all([
      db.query.seoMeta.findFirst({
        where: and(eq(seoMeta.entityType, "category"), eq(seoMeta.entityId, category.id)),
      }),
      db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          featuredImageUrl: posts.featuredImageUrl,
          featuredImageAlt: media.alt,
          readingTimeMinutes: posts.readingTimeMinutes,
        })
        .from(posts)
        .leftJoin(media, eq(media.url, posts.featuredImageUrl))
        // `deletedAt` is separate from `status` — a trashed post keeps its
        // prior status, so it must be excluded explicitly here too.
        .where(and(eq(posts.categoryId, category.id), eq(posts.status, "published"), isNull(posts.deletedAt)))
        .orderBy(desc(posts.publishedAt)),
    ]);

    return { category, seo, categoryPosts };
  },
  ["category-page-data"],
  { tags: ["posts", "categories"], revalidate: 3600 },
);
