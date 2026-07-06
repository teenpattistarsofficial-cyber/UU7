import type { AiChunk } from "@/lib/ai/chunk";

export type ScoredChunk = AiChunk & { score: number };

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
 * Keyword-overlap retrieval — the same in-process-scoring precedent as
 * lib/seo/related.ts, not a pgvector/embeddings pipeline (see lib/ai/chunk.ts
 * and the Phase 6 notes: no first-party Anthropic embeddings endpoint, and
 * this avoids introducing a second external provider just for retrieval).
 * Sufficient at this site's content volume; every chunk is rescored fresh
 * per question rather than precomputed, so new posts are searchable the
 * moment they're published with no ingestion step to keep in sync.
 */
export function retrieveChunks(question: string, chunks: AiChunk[], limit = 6): ScoredChunk[] {
  const questionWords = tokenize(question);
  if (questionWords.length === 0) return [];

  const questionCounts = new Map<string, number>();
  for (const word of questionWords) questionCounts.set(word, (questionCounts.get(word) ?? 0) + 1);

  return chunks
    .map((chunk) => {
      const chunkWords = tokenize(`${chunk.title} ${chunk.section} ${chunk.text}`);
      let score = 0;
      for (const word of chunkWords) score += questionCounts.get(word) ?? 0;
      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
