import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";

// Low-cost, low-priority per the project plan — current evidence shows no
// measurable ranking/citation effect from llms.txt, so this is a simple
// auto-generated index (informal llmstxt.org format) rather than a
// hand-curated one with its own admin UI.
export async function GET() {
  // `deletedAt` is separate from `status` — a trashed post keeps its prior
  // status, so it must be excluded explicitly here too.
  const [publishedPosts, allCategories] = await Promise.all([
    db.select().from(posts).where(and(eq(posts.status, "published"), isNull(posts.deletedAt))),
    db.select().from(categories),
  ]);
  const categorySlugById = new Map(allCategories.map((c) => [c.id, c.slug]));

  const postsByCategory = new Map<string, typeof publishedPosts>();
  for (const post of publishedPosts) {
    if (!post.categoryId || !categorySlugById.has(post.categoryId)) continue;
    const list = postsByCategory.get(post.categoryId) ?? [];
    list.push(post);
    postsByCategory.set(post.categoryId, list);
  }

  const lines = [
    "# UU7",
    "",
    "> Game guides, betting guides, bonus breakdowns, tutorials, and gaming statistics.",
    "",
  ];

  for (const category of allCategories) {
    const categoryPosts = postsByCategory.get(category.id) ?? [];
    if (categoryPosts.length === 0) continue;
    lines.push(`## ${category.name}`, "");
    for (const post of categoryPosts) {
      const url = `${SITE_URL}/${category.slug}/${post.slug}`;
      lines.push(`- [${post.title}](${url})${post.excerpt ? `: ${post.excerpt}` : ""}`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
