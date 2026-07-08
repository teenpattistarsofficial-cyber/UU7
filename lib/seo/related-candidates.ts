import "server-only";
import { eq, ne, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, tags, postTags } from "@/lib/db/schema";
import type { CandidatePost } from "@/lib/seo/related";

/**
 * Every published post that has a valid public URL (i.e. has a category —
 * see the posts list's "Assign a category to view on site" gap), shaped
 * for the related-posts scorer and the internal-link search. Shared by the
 * public article page (auto related-posts fallback) and the admin
 * suggestion actions (internal link assistant, related-posts picker) so
 * both draw from the exact same candidate set.
 */
export async function getPublishedPostCandidates(excludePostId?: string): Promise<CandidatePost[]> {
  const [allPosts, allCategories, tagRows] = await Promise.all([
    db
      .select({ id: posts.id, title: posts.title, slug: posts.slug, categoryId: posts.categoryId })
      .from(posts)
      // `deletedAt` is separate from `status` — a trashed post keeps its
      // prior status, so both the public related-posts fallback and the
      // admin's internal-link suggestions need this excluded explicitly.
      .where(
        excludePostId
          ? and(eq(posts.status, "published"), isNull(posts.deletedAt), ne(posts.id, excludePostId))
          : and(eq(posts.status, "published"), isNull(posts.deletedAt)),
      ),
    db.select().from(categories),
    db.select({ postId: postTags.postId, name: tags.name }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)),
  ]);

  const categoryById = new Map(allCategories.map((c) => [c.id, c]));
  const tagsByPostId = new Map<string, string[]>();
  for (const row of tagRows) {
    const list = tagsByPostId.get(row.postId) ?? [];
    list.push(row.name);
    tagsByPostId.set(row.postId, list);
  }

  return allPosts
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      categoryId: p.categoryId,
      categorySlug: p.categoryId ? (categoryById.get(p.categoryId)?.slug ?? null) : null,
      tagNames: tagsByPostId.get(p.id) ?? [],
    }))
    .filter((c): c is CandidatePost => Boolean(c.categorySlug));
}
