import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs } from "@/lib/db/schema";
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
  const published = await db.query.posts.findMany({ where: eq(posts.status, "published") });

  const chunksByPost = await Promise.all(
    published.map(async (post) => {
      if (!post.categoryId) return [];
      const category = await db.query.categories.findFirst({ where: eq(categories.id, post.categoryId) });
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
