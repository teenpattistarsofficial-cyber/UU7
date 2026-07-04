"use server";

import { requireRole } from "@/lib/auth/guards";
import { getPublishedPostCandidates } from "@/lib/seo/related-candidates";
import { scoreRelatedPosts } from "@/lib/seo/related";

export type LinkSuggestion = { id: string; title: string; url: string };

/** Manual mode for the Internal Linking Assistant and the Related Posts
 * picker — search published posts by title or tag. */
export async function searchPosts(query: string, excludePostId?: string): Promise<LinkSuggestion[]> {
  await requireRole("author");
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const candidates = await getPublishedPostCandidates(excludePostId);
  return candidates
    .filter((c) => c.title.toLowerCase().includes(needle) || c.tagNames.some((t) => t.toLowerCase().includes(needle)))
    .slice(0, 8)
    .map((c) => ({ id: c.id, title: c.title, url: `/${c.categorySlug}/${c.slug}` }));
}

/** Auto mode — suggestions scored from the post's own title/tags/category,
 * used both as the Internal Linking Assistant's default list and to seed
 * the Related Posts picker. */
export async function suggestRelatedForPost(input: {
  excludePostId?: string;
  title: string;
  tagNames: string[];
  categoryId: string | null;
}): Promise<LinkSuggestion[]> {
  await requireRole("author");
  const candidates = await getPublishedPostCandidates(input.excludePostId);
  const scored = scoreRelatedPosts(
    { id: input.excludePostId ?? "", title: input.title, categoryId: input.categoryId, tagNames: input.tagNames },
    candidates,
    8,
  );
  return scored.map((c) => ({ id: c.id, title: c.title, url: `/${c.categorySlug}/${c.slug}` }));
}
