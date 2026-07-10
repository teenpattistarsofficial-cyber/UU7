import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { POST_SUMMARY_COLUMNS, toPostSummary, type PostSummary } from "@/lib/posts/post-summary";

const STOPWORDS = new Set([
  "this",
  "that",
  "with",
  "from",
  "your",
  "have",
  "what",
  "when",
  "where",
  "which",
  "about",
  "into",
  "their",
  "them",
  "then",
  "than",
  "will",
  "would",
  "could",
  "should",
  "does",
  "doing",
  "how",
  "why",
  "who",
  "the",
  "and",
  "for",
  "are",
  "you",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * In-process keyword-overlap scoring — the same precedent already used by
 * lib/ai/retrieve.ts (Ask-AI) and lib/seo/related.ts (related posts), not a
 * Postgres full-text/trigram search. Scores against title (weighted
 * highest), excerpt, and category name, since that's the full text already
 * loaded for every card on the site — matching against full post body would
 * mean parsing every published post's Tiptap JSON on every search request,
 * for content that isn't shown in the result card anyway.
 */
export async function searchPosts(query: string, limit = 24): Promise<PostSummary[]> {
  const queryWords = tokenize(query);
  if (queryWords.length === 0) return [];

  const queryCounts = new Map<string, number>();
  for (const word of queryWords) queryCounts.set(word, (queryCounts.get(word) ?? 0) + 1);

  const rows = await db
    .select(POST_SUMMARY_COLUMNS)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    // `deletedAt` is separate from `status` — a trashed post keeps its
    // prior status, so it must be excluded explicitly here too.
    .where(and(eq(posts.status, "published"), isNull(posts.deletedAt)));

  return rows
    .filter((r): r is typeof r & { categorySlug: string; categoryName: string } => Boolean(r.categorySlug))
    .map((r) => {
      let score = 0;
      for (const word of tokenize(r.title)) score += (queryCounts.get(word) ?? 0) * 3;
      for (const word of tokenize(r.excerpt ?? "")) score += queryCounts.get(word) ?? 0;
      for (const word of tokenize(r.categoryName)) score += queryCounts.get(word) ?? 0;
      return { row: r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => toPostSummary(x.row));
}
