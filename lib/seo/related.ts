export type CandidatePost = {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  categorySlug: string | null;
  tagNames: string[];
};

export type ScoredPost = CandidatePost & { score: number };

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
  "guide",
  "best",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));
}

/**
 * A pragmatic, in-process relevance score for "posts related to this one" —
 * shared tags weigh most, same category next, overlapping title words
 * least. No Postgres full-text/trigram search or nightly precomputation
 * (per the plan's Module 8 design) — at this site's scale, scoring the
 * published set in memory on read is simple, fast enough, and has no
 * infrastructure to keep in sync.
 */
export function scoreRelatedPosts(
  current: { id: string; title: string; categoryId: string | null; tagNames: string[] },
  candidates: CandidatePost[],
  limit = 5,
): ScoredPost[] {
  const currentTitleWords = new Set(tokenize(current.title));
  const currentTags = new Set(current.tagNames.map((t) => t.toLowerCase()));

  return candidates
    .filter((c) => c.id !== current.id)
    .map((c) => {
      const sharedTags = c.tagNames.filter((t) => currentTags.has(t.toLowerCase())).length;
      const sameCategory = current.categoryId != null && c.categoryId === current.categoryId;
      const sharedTitleWords = tokenize(c.title).filter((w) => currentTitleWords.has(w)).length;
      const score = sharedTags * 3 + (sameCategory ? 2 : 0) + sharedTitleWords;
      return { ...c, score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
