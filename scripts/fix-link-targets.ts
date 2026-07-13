import { db } from "@/lib/db";
import { posts, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";

// One-off migration: Tiptap's Link extension hardcodes target="_blank" as
// its own default HTMLAttributes, which silently overrode the `target:
// null` every link mark in this codebase actually stores (see the fix in
// lib/editor/extensions.ts) — every link, internal or external, was
// opening in a new tab regardless of what was authored. This sweeps
// existing content so the stored data matches what should have been there
// all along: internal links (href starting with "/") get target: null
// (same tab), genuinely external links get target: "_blank" explicitly
// set on the mark itself, since they no longer get it for free from the
// extension default.
//
// Usage: npx tsx scripts/fix-link-targets.ts        (dry run)
//        npx tsx scripts/fix-link-targets.ts --apply  (writes)

function fixLinks(node: JSONContent, stats: { internal: number; external: number; changed: number }): void {
  node.marks?.forEach((mark) => {
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      const href = mark.attrs.href as string;
      const external = /^https?:\/\//i.test(href) && !href.includes("uu7.io");
      const desiredTarget = external ? "_blank" : null;
      if (mark.attrs.target !== desiredTarget) {
        mark.attrs.target = desiredTarget;
        stats.changed++;
      }
      external ? stats.external++ : stats.internal++;
    }
  });
  node.content?.forEach((n) => fixLinks(n, stats));
}

async function main() {
  const stats = { internal: 0, external: 0, changed: 0 };
  const APPLY = process.argv.includes("--apply");

  const allPosts = await db.query.posts.findMany();
  for (const post of allPosts) {
    if (!post.content) continue;
    const content = post.content as JSONContent;
    const before = JSON.stringify(content);
    fixLinks(content, stats);
    if (JSON.stringify(content) !== before) {
      console.log(`Post "${post.title}": links updated`);
      if (APPLY) await db.update(posts).set({ content }).where(eq(posts.id, post.id));
    }
  }

  const allPages = await db.query.pages.findMany();
  for (const page of allPages) {
    if (!page.content) continue;
    const content = page.content as JSONContent;
    const before = JSON.stringify(content);
    fixLinks(content, stats);
    if (JSON.stringify(content) !== before) {
      console.log(`Page "${page.title}": links updated`);
      if (APPLY) await db.update(pages).set({ content }).where(eq(pages.id, page.id));
    }
  }

  console.log("---");
  console.log(`Internal links seen: ${stats.internal}, external: ${stats.external}, attrs changed: ${stats.changed}`);
  console.log(APPLY ? "Applied." : "Dry run only — pass --apply to write.");
  process.exit(0);
}
main();
