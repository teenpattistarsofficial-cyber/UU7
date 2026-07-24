import { db } from "@/lib/db";
import { posts, pages } from "@/lib/db/schema";
import type { JSONContent } from "@tiptap/core";
import { isExternalUrl } from "@/lib/seo/safe-url";

// Read-only verification companion to fix-link-targets.ts — makes no
// writes. Walks every post/page's stored content and flags any link mark
// that doesn't match the intended policy: internal links must have no
// target and no nofollow (rel: null); external links must open in a new
// tab (target: "_blank") with rel containing nofollow. Run this any time
// there's a reason to double-check the sweep actually took effect, rather
// than re-reading raw HTML by hand.
//
// Usage: npx tsx scripts/audit-link-targets.ts

type Violation = { location: string; href: string; kind: "internal" | "external"; problem: string };

function walk(node: JSONContent, location: string, violations: Violation[]): void {
  node.marks?.forEach((mark) => {
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      const href = mark.attrs.href as string;
      const external = isExternalUrl(href);
      const target = mark.attrs.target ?? null;
      const rel = (mark.attrs.rel ?? null) as string | null;

      if (!external) {
        if (target !== null) {
          violations.push({ location, href, kind: "internal", problem: `has target=${JSON.stringify(target)} (should be same-tab, no target)` });
        }
        if (rel && rel.includes("nofollow")) {
          violations.push({ location, href, kind: "internal", problem: `has rel="${rel}" (internal links must not be nofollow)` });
        }
      } else {
        if (target !== "_blank") {
          violations.push({ location, href, kind: "external", problem: `has target=${JSON.stringify(target)} (external links must open in a new tab)` });
        }
        if (!rel || !rel.includes("noopener") || !rel.includes("noreferrer")) {
          violations.push({ location, href, kind: "external", problem: `has rel="${rel}" (missing noopener/noreferrer — window.opener security risk)` });
        }
      }
    }
  });
  node.content?.forEach((n) => walk(n, location, violations));
}

async function main() {
  const violations: Violation[] = [];
  let internalCount = 0;
  let externalCount = 0;

  function count(node: JSONContent) {
    node.marks?.forEach((mark) => {
      if (mark.type === "link" && typeof mark.attrs?.href === "string") {
        isExternalUrl(mark.attrs.href as string) ? externalCount++ : internalCount++;
      }
    });
    node.content?.forEach(count);
  }

  const allPosts = await db.query.posts.findMany();
  for (const post of allPosts) {
    if (!post.content) continue;
    const content = post.content as JSONContent;
    count(content);
    walk(content, `Post "${post.title}"`, violations);
  }

  const allPages = await db.query.pages.findMany();
  for (const page of allPages) {
    if (!page.content) continue;
    const content = page.content as JSONContent;
    count(content);
    walk(content, `Page "${page.title}"`, violations);
  }

  console.log(`Checked ${internalCount} internal links, ${externalCount} external links.`);
  console.log("---");
  if (violations.length === 0) {
    console.log("✔ All clear — every internal link is same-tab/no-nofollow, every external link opens in a new tab with noopener/noreferrer.");
  } else {
    console.log(`✘ ${violations.length} violation(s) found:`);
    violations.forEach((v) => console.log(`  [${v.kind}] ${v.location} | ${v.href} | ${v.problem}`));
  }
  process.exit(violations.length === 0 ? 0 : 1);
}
main();
