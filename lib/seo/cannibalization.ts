const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "your", "with", "this",
  "that", "from", "have", "has", "how", "what", "when", "where", "which",
  "will", "can", "does", "into", "onto", "about", "best", "top", "guide",
  "guides",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));
}

export type KeywordTarget = { slug: string; title: string; focusKeyword: string | null };
export type ScoredKeywordTarget = KeywordTarget & { score: number };

// Same in-process keyword-overlap approach already used by lib/seo/related.ts,
// lib/posts/search.ts, and lib/ai/retrieve.ts (no embeddings/pgvector
// anywhere in this codebase) — a convenience signal for surfacing likely
// keyword-cannibalization candidates, not the final judgment call. Semantic
// overlap a tokenizer can't see (e.g. "fastest withdrawals" vs "how long do
// payouts take") matters more here than raw word overlap, so this is meant
// to narrow down candidates for a human/agent to actually read, not to
// auto-block a publish.
export function scoreKeywordOverlap(
  keyword: string,
  targets: KeywordTarget[],
  limit = 10,
): ScoredKeywordTarget[] {
  const queryWords = new Set(tokenize(keyword));
  if (queryWords.size === 0) return [];

  return targets
    .map((target) => {
      const words = tokenize(`${target.focusKeyword ?? ""} ${target.title}`);
      const score = words.reduce((sum, word) => sum + (queryWords.has(word) ? 1 : 0), 0);
      return { ...target, score };
    })
    .filter((target) => target.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
