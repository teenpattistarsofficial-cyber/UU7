import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories, postFaqs } from "@/lib/db/schema";
import { getCategoryMeta } from "@/lib/site-categories";

export type FaqEntry = {
  question: string;
  answer: string;
  sourceTitle: string;
  sourceUrl: string;
};

export type FaqGroup = {
  categorySlug: string;
  categoryLabel: string;
  faqs: FaqEntry[];
};

/** Every FAQ from every published, categorized post, grouped by category —
 * unlike the homepage's `getHomepageFaqs` (lib/home/featured-content.ts),
 * which only pulls from a small hand-curated pillar-post list for internal
 * linking. This is the full set, for the standalone /faq page. Groups
 * with zero FAQs are simply absent rather than rendered empty. */
export async function getAllFaqsByCategory(): Promise<FaqGroup[]> {
  const rows = await db
    .select({
      question: postFaqs.question,
      answer: postFaqs.answer,
      postTitle: posts.title,
      postSlug: posts.slug,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(postFaqs)
    .innerJoin(posts, eq(postFaqs.postId, posts.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    // `deletedAt` is separate from `status` — a trashed post keeps its
    // prior status, so this must be checked explicitly or a trashed post's
    // FAQs keep showing up here.
    .where(and(eq(posts.status, "published"), isNull(posts.deletedAt)))
    .orderBy(postFaqs.position);

  const groups = new Map<string, FaqGroup>();
  for (const row of rows) {
    if (!row.categorySlug || !row.categoryName) continue; // same "no valid public URL" rule as elsewhere
    const meta = getCategoryMeta(row.categorySlug, row.categoryName);
    const existing = groups.get(row.categorySlug);
    const entry: FaqEntry = {
      question: row.question,
      answer: row.answer,
      sourceTitle: row.postTitle,
      sourceUrl: `/${row.categorySlug}/${row.postSlug}`,
    };
    if (existing) {
      existing.faqs.push(entry);
    } else {
      groups.set(row.categorySlug, { categorySlug: row.categorySlug, categoryLabel: meta.label, faqs: [entry] });
    }
  }

  // Stable order matching the site's own category nav rather than
  // whatever order categories happened to come back from the DB in.
  return [...groups.values()].sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel));
}
