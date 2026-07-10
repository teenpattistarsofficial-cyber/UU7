import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, pages } from "@/lib/db/schema";
import { toTiptapDoc } from "@/lib/editor/doc";
import { SITE_URL } from "@/lib/site";
import { chunkPost, type AiChunk } from "@/lib/ai/chunk";

/**
 * Rebuilt fresh on every question rather than cached/precomputed — no
 * ingestion pipeline to keep in sync, and every published post is
 * searchable immediately (see lib/ai/retrieve.ts for why this doesn't use
 * pgvector/embeddings).
 */
export async function loadAllChunks(): Promise<AiChunk[]> {
  const [postChunks, pageChunks] = await Promise.all([loadPostChunks(), loadPageChunks()]);
  return [...postChunks, ...pageChunks];
}

async function loadPostChunks(): Promise<AiChunk[]> {
  // `deletedAt` is separate from `status` — a trashed post keeps its prior
  // status, so it must be excluded explicitly or Ask-AI keeps citing a
  // post that's supposed to be gone.
  const published = await db.query.posts.findMany({
    where: and(eq(posts.status, "published"), isNull(posts.deletedAt)),
  });

  const chunksByPost = await Promise.all(
    published.map(async (post) => {
      if (!post.categoryId) return [];
      // A trashed category (deletedAt set) fails this lookup the same as a
      // missing one — the post is skipped below rather than Ask-AI citing
      // a URL that now 404s (see app/(site)/[category]/page.tsx).
      const category = await db.query.categories.findFirst({
        where: and(eq(categories.id, post.categoryId), isNull(categories.deletedAt)),
      });
      if (!category) return [];

      const [quickAnswer, aiSummary, takeaways, faqRows] = await Promise.all([
        db.query.postQuickAnswer.findFirst({ where: eq(postQuickAnswer.postId, post.id) }),
        db.query.postAiSummary.findFirst({ where: eq(postAiSummary.postId, post.id) }),
        db.query.postKeyTakeaways.findMany({ where: eq(postKeyTakeaways.postId, post.id) }),
        db.query.postFaqs.findMany({ where: eq(postFaqs.postId, post.id) }),
      ]);

      return chunkPost({
        id: post.id,
        title: post.title,
        url: `${SITE_URL}/${category.slug}/${post.slug}`,
        quickAnswer: quickAnswer?.text,
        aiSummary: aiSummary?.summary,
        keyTakeaways: takeaways.map((t) => t.text),
        faqs: faqRows.map((f) => ({ question: f.question, answer: f.answer })),
        content: toTiptapDoc(post.content),
      });
    }),
  );

  return chunksByPost.flat();
}

// CMS pages (About, Editorial Policy, Responsible Gaming, Contact, and any
// custom page created through the admin) were entirely invisible to Ask-AI
// before this — loadAllChunks() only ever queried `posts`. That meant a
// visitor asking about this site's own editorial process, methodology, or
// policies (all published content, just on a `pages` row instead of a
// `posts` row) got a false "I don't have that information" decline no
// matter how directly the Editorial Policy page already answered it.
// Reuses chunkPost() as-is — pages have no quick-answer/AI-summary/FAQ
// modules (those are post-specific), but its signature already treats those
// as optional, so passing just id/title/url/content chunks the body the
// same way.
async function loadPageChunks(): Promise<AiChunk[]> {
  const published = await db.query.pages.findMany({
    where: and(eq(pages.status, "published"), isNull(pages.deletedAt)),
  });

  return published
    .filter((page) => page.content)
    .flatMap((page) =>
      chunkPost({
        id: page.id,
        title: page.title,
        url: `${SITE_URL}/${page.slug}`,
        content: toTiptapDoc(page.content),
        // The About page is the only sensible answer to a generic
        // "what is this site/platform" question — see the `priority` field
        // comment on AiChunk for why retrieveChunks() treats this specially.
        priority: page.template === "about",
      }),
    );
}
