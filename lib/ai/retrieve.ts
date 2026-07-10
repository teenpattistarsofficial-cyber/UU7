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

// Deliberately crude (no real morphology) — just enough so "platforms"/
// "guides"/"playing" match the singular/base form already used in most
// content ("platform"/"guide"/"play") without a stemming dependency. Only
// strips when the result stays a reasonable word (>= 3 chars) so short
// words like "as"/"is" never get mangled.
function stem(word: string): string {
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .map(stem);
}

// Below this, the "best match" is really just noise (a couple of
// incidental shared words) rather than a real topical hit — that's when a
// generic/meta question ("what is your platform") gets a priority chunk
// injected instead of standing on its own weak score.
const WEAK_MATCH_THRESHOLD = 2;

/**
 * Keyword-overlap retrieval — the same in-process-scoring precedent as
 * lib/seo/related.ts, not a pgvector/embeddings pipeline (see lib/ai/chunk.ts
 * and the Phase 6 notes: embedding every chunk, storing/indexing it, and
 * keeping it in sync on every publish is real infra this site's content
 * volume doesn't need yet). Every chunk is rescored fresh per question
 * rather than precomputed, so new posts are searchable the moment they're
 * published with no ingestion step to keep in sync.
 */
export function retrieveChunks(question: string, chunks: AiChunk[], limit = 6): ScoredChunk[] {
  const questionWords = tokenize(question);
  if (questionWords.length === 0) return [];

  const questionCounts = new Map<string, number>();
  for (const word of questionWords) questionCounts.set(word, (questionCounts.get(word) ?? 0) + 1);

  const scored = chunks
    .map((chunk) => {
      const chunkWords = tokenize(`${chunk.title} ${chunk.section} ${chunk.text}`);
      let score = 0;
      for (const word of chunkWords) score += questionCounts.get(word) ?? 0;
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score);

  const result = scored.filter((c) => c.score > 0).slice(0, limit);

  // Generic "what is this site/platform" questions have weak keyword
  // overlap with any specific guide — guarantee the About page (the only
  // chunks marked `priority`, see lib/ai/chunk.ts) is still included as
  // baseline context rather than declining a question it can answer.
  const topScore = result[0]?.score ?? 0;
  if (topScore < WEAK_MATCH_THRESHOLD) {
    const bestPriority = scored.find((c) => c.priority);
    if (bestPriority && !result.some((c) => c.priority)) {
      if (result.length < limit) result.push(bestPriority);
      else result[result.length - 1] = bestPriority;
    }
  }

  return result;
}
