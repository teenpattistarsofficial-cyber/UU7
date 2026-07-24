import { db } from "@/lib/db";
import { posts, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { JSONContent } from "@tiptap/core";
import { isExternalUrl } from "@/lib/seo/safe-url";

// One-off migration, re-run twice now. First pass (see git history) fixed
// Tiptap's Link extension hardcoding target="_blank" as its own default
// HTMLAttributes (lib/editor/extensions.ts) — but that alone only fixed
// links already in the DB at the time; it didn't stop the editor from
// creating new links with no target/rel at all going forward (every link
// created via the toolbar's Link button or the Internal Linking Assistant
// — components/editor/tiptap-editor.tsx — never set target/rel on the
// mark), which happened to render correctly for internal links (schema
// default = same tab) but silently left external links opening in the
// same tab too. That gap is now closed at the editor level; this second
// pass fixes whatever was authored while it was open. Uses the same
// isExternalUrl() the editor now uses — hostname comparison against
// SITE_URL, not the old substring check (`href.includes("uu7.io")`), which
// would have wrongly called a lookalike domain like fake-uu7.io.evil.com
// "internal".
//
// Usage: npx tsx scripts/fix-link-targets.ts        (dry run)
//        npx tsx scripts/fix-link-targets.ts --apply  (writes)

function fixLinks(node: JSONContent, stats: { internal: number; external: number; changed: number }): void {
  node.marks?.forEach((mark) => {
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      const href = mark.attrs.href as string;
      const external = isExternalUrl(href);
      const desiredTarget = external ? "_blank" : null;
      // "nofollow" preserved for external links — every one has carried it
      // since day one via Tiptap's own former default (see
      // lib/editor/extensions.ts); only internal links losing it here is
      // the actual fix, since nofollow-ing your own site's internal links
      // has never been intentional.
      const desiredRel = external ? "noopener noreferrer nofollow" : null;
      // `?? null` normalizes "field never set" (undefined) against "field
      // explicitly cleared" (null) before comparing — otherwise every mark
      // missing a `rel` key at all (i.e. everything from before this pass
      // added the field) would count as "changed" even when target was
      // already correct, since undefined !== null in JS.
      const currentTarget = mark.attrs.target ?? null;
      const currentRel = mark.attrs.rel ?? null;
      if (currentTarget !== desiredTarget || currentRel !== desiredRel) {
        mark.attrs.target = desiredTarget;
        mark.attrs.rel = desiredRel;
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
