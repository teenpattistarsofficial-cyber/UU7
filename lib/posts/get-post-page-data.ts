import "server-only";
import { unstable_cache } from "next/cache";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  posts,
  authors,
  categories,
  seoMeta,
  postFaqs,
  postAiSummary,
  postKeyTakeaways,
  postRelated,
  postQuickAnswer,
  postCtas,
  postStatsTables,
  tags,
  postTags,
  comments,
  media,
} from "@/lib/db/schema";
import { getPublishedPostCandidates } from "@/lib/seo/related-candidates";
import { scoreRelatedPosts } from "@/lib/seo/related";
import { getPostSummariesByIds } from "@/lib/posts/post-summary";

/** Every DB read app/(site)/[category]/[slug]/page.tsx needs — both
 * generateMetadata (post + seo only) and the main render (everything) call
 * this same function with the same slug, so it's one cached bundle rather
 * than two separately-cached, overlapping "look up the post" queries that
 * could drift out of sync. Returns null for anything that isn't a live
 * published post (missing, draft, or trashed), matching the page's own
 * `!post || post.status !== "published" || post.deletedAt` check.
 *
 * Wrapped in unstable_cache — this Next.js version's (non-Cache-Components)
 * caching model only makes `export const revalidate` effective for
 * `fetch`-based reads; direct drizzle/postgres.js calls need explicit
 * wrapping or the whole route reverts to fully dynamic (see the note in
 * lib/home/featured-content.ts). Tagged "posts" (broad, not per-slug) —
 * invalidated by lib/actions/posts.ts, comments.ts, and media.ts, all of
 * which can change something rendered on this page (the post itself, its
 * comments, or a media row's alt text it joins against by URL).
 *
 * `getPublishedPostCandidates` is intentionally NOT wrapped at its own
 * definition (lib/seo/related-candidates.ts) — it's shared with
 * lib/actions/internal-links.ts, an admin feature that needs live data, not
 * a cached snapshot. It's called plainly here, inside this cache scope,
 * so only ITS result for THIS post page gets cached, not the shared
 * function itself for every caller. */
export const getPostPageData = unstable_cache(
  async (slug: string) => {
    const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
    if (!post || post.status !== "published" || post.deletedAt) return null;

    const seo = await db.query.seoMeta.findFirst({
      where: and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, post.id)),
    });

    const [
      author,
      category,
      faqRows,
      aiSummaryRow,
      keyTakeawayRows,
      relatedPins,
      currentTagRows,
      quickAnswerRow,
      ctaRows,
      statsTableRows,
      approvedComments,
      featuredMedia,
    ] = await Promise.all([
      // `deletedAt` is separate from a status field authors/categories don't
      // have — a trashed author just drops the byline and a trashed
      // category just drops the badge/breadcrumb entry, the same graceful
      // fallback already used when a post simply has no author/category set.
      post.authorId
        ? db.query.authors.findFirst({ where: and(eq(authors.id, post.authorId), isNull(authors.deletedAt)) })
        : Promise.resolve(null),
      post.categoryId
        ? db.query.categories.findFirst({ where: and(eq(categories.id, post.categoryId), isNull(categories.deletedAt)) })
        : Promise.resolve(null),
      db.query.postFaqs.findMany({ where: eq(postFaqs.postId, post.id), orderBy: (f, { asc }) => asc(f.position) }),
      db.query.postAiSummary.findFirst({ where: eq(postAiSummary.postId, post.id) }),
      db.query.postKeyTakeaways.findMany({
        where: eq(postKeyTakeaways.postId, post.id),
        orderBy: (k, { asc }) => asc(k.position),
      }),
      db
        .select({ relatedPostId: postRelated.relatedPostId })
        .from(postRelated)
        .where(eq(postRelated.postId, post.id))
        .orderBy(postRelated.position),
      db.select({ name: tags.name }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(eq(postTags.postId, post.id)),
      db.query.postQuickAnswer.findFirst({ where: eq(postQuickAnswer.postId, post.id) }),
      db.query.postCtas.findMany({ where: eq(postCtas.postId, post.id), orderBy: (c, { asc }) => asc(c.position) }),
      db.query.postStatsTables.findMany({ where: eq(postStatsTables.postId, post.id), orderBy: (t, { asc }) => asc(t.position) }),
      db.query.comments.findMany({
        where: and(eq(comments.postId, post.id), eq(comments.status, "approved")),
        orderBy: (c, { asc }) => asc(c.createdAt),
      }),
      post.featuredImageUrl
        ? db.query.media.findFirst({ where: eq(media.url, post.featuredImageUrl) })
        : Promise.resolve(null),
    ]);

    // Manual pins if the editor set any; otherwise the same scoring
    // heuristic the Internal Linking Assistant uses, computed live off the
    // published set rather than a precomputed table.
    const candidates = await getPublishedPostCandidates(post.id);
    const relatedPostIds =
      relatedPins.length > 0
        ? relatedPins.map((pin) => pin.relatedPostId).filter((id) => candidates.some((c) => c.id === id))
        : scoreRelatedPosts(
            { id: post.id, title: post.title, categoryId: post.categoryId, tagNames: currentTagRows.map((t) => t.name) },
            candidates,
            4,
          ).map((c) => c.id);
    const relatedPosts = await getPostSummariesByIds(relatedPostIds);

    return {
      post,
      seo,
      author,
      category,
      faqRows,
      aiSummaryRow,
      keyTakeawayRows,
      quickAnswerRow,
      ctaRows,
      statsTableRows,
      approvedComments,
      featuredMedia,
      currentTagRows,
      relatedPosts,
    };
  },
  ["post-page-data"],
  { tags: ["posts"], revalidate: 3600 },
);
