import { db } from "@/lib/db";
import { posts, pages, postCtas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";

// One-off migration: a handful of posts published via the external
// /api/publish agent integration authored "further reading" links with a
// generic /blog/<slug> prefix instead of this site's real
// /<category-slug>/<slug> URL — /blog isn't a real category here. The
// redirect guard added to [category]/[slug]/page.tsx makes these harmless
// (they 308 to the right page now), but the stored content itself still
// has the wrong href. This rewrites it in place wherever the target slug
// resolves to a real, published post; anything that doesn't resolve is
// left untouched and logged for manual review rather than guessed at.
//
// Usage: npx tsx scripts/fix-blog-prefix-links.ts        (dry run)
//        npx tsx scripts/fix-blog-prefix-links.ts --apply  (writes)

const BLOG_PREFIX = /^\/blog\/([^/?#]+)(.*)$/;

// Shared by both the Tiptap tree-walker below (post/page body content) and
// the flat postCtas.buttonUrl field — same bad-prefix shape, just stored
// differently. Returns the corrected href, or null if `href` doesn't match
// the bad prefix (nothing to do) or its target slug doesn't resolve to a
// real published post (added to `unresolved` instead of guessed at).
function rewriteBlogUrl(href: string, slugToUrl: Map<string, string>, unresolved: Set<string>): string | null {
  const match = href.match(BLOG_PREFIX);
  if (!match) return null;
  const [, targetSlug, rest] = match;
  const realUrl = slugToUrl.get(targetSlug);
  if (!realUrl) {
    unresolved.add(href);
    return null;
  }
  return realUrl + rest;
}

function rewriteBlogLinks(
  node: JSONContent,
  slugToUrl: Map<string, string>,
  unresolved: Set<string>,
  stats: { changed: number },
): void {
  node.marks?.forEach((mark) => {
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      const rewritten = rewriteBlogUrl(mark.attrs.href as string, slugToUrl, unresolved);
      if (rewritten) {
        mark.attrs.href = rewritten;
        stats.changed++;
      }
    }
  });
  node.content?.forEach((n) => rewriteBlogLinks(n, slugToUrl, unresolved, stats));
}

async function main() {
  const APPLY = process.argv.includes("--apply");

  const [allPosts, allCategories] = await Promise.all([
    db.query.posts.findMany(),
    db.query.categories.findMany(),
  ]);
  const categorySlugById = new Map(allCategories.map((c) => [c.id, c.slug]));

  // Only published, non-deleted, categorized posts have a real canonical
  // URL to redirect a bad /blog/ link onto — same rule the [category]/[slug]
  // route itself uses.
  const slugToUrl = new Map<string, string>();
  for (const post of allPosts) {
    if (post.status !== "published" || post.deletedAt || !post.categoryId) continue;
    const categorySlug = categorySlugById.get(post.categoryId);
    if (categorySlug) slugToUrl.set(post.slug, `/${categorySlug}/${post.slug}`);
  }

  const stats = { changed: 0 };
  const unresolved = new Set<string>();

  for (const post of allPosts) {
    if (!post.content) continue;
    const content = post.content as JSONContent;
    const before = JSON.stringify(content);
    rewriteBlogLinks(content, slugToUrl, unresolved, stats);
    if (JSON.stringify(content) !== before) {
      console.log(`Post "${post.title}" (${post.slug}): links updated`);
      if (APPLY) await db.update(posts).set({ content }).where(eq(posts.id, post.id));
    }
  }

  const allPages = await db.query.pages.findMany();
  for (const page of allPages) {
    if (!page.content) continue;
    const content = page.content as JSONContent;
    const before = JSON.stringify(content);
    rewriteBlogLinks(content, slugToUrl, unresolved, stats);
    if (JSON.stringify(content) !== before) {
      console.log(`Page "${page.title}" (${page.slug}): links updated`);
      if (APPLY) await db.update(pages).set({ content }).where(eq(pages.id, page.id));
    }
  }

  // post_ctas.buttonUrl is a separate table from posts.content — it's
  // never covered by the walk above, but it renders as a real crawlable
  // <a href> (components/article/cta-block.tsx), so a bad /blog/ link
  // here is just as broken and just as invisible to that walk.
  const allCtas = await db.query.postCtas.findMany();
  for (const cta of allCtas) {
    const rewritten = rewriteBlogUrl(cta.buttonUrl, slugToUrl, unresolved);
    if (rewritten) {
      console.log(`CTA "${cta.heading}" (post ${cta.postId}): link updated`);
      stats.changed++;
      if (APPLY) await db.update(postCtas).set({ buttonUrl: rewritten }).where(eq(postCtas.id, cta.id));
    }
  }

  console.log("---");
  console.log(`Links rewritten: ${stats.changed}`);
  if (unresolved.size > 0) {
    console.log(`Unresolved /blog/ links (no matching published post — left untouched, needs manual review):`);
    unresolved.forEach((href) => console.log(`  ${href}`));
  }
  console.log(APPLY ? "Applied." : "Dry run only — pass --apply to write.");
  process.exit(0);
}
main();
