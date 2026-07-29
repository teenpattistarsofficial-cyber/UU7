import type { JSONContent } from "@tiptap/core";

/** Every link-mark href in a Tiptap doc, in document order, duplicates
 * included — the shared tree-walk previously copy-pasted across
 * lib/seo/score.ts, lib/editor/citations.ts, and scripts/fix-blog-prefix-links.ts. */
export function collectLinkHrefs(doc: JSONContent | null | undefined): string[] {
  const hrefs: string[] = [];
  if (!doc) return hrefs;
  function walk(node: JSONContent) {
    node.marks?.forEach((mark) => {
      if (mark.type === "link" && typeof mark.attrs?.href === "string") {
        hrefs.push(mark.attrs.href);
      }
    });
    node.content?.forEach(walk);
  }
  walk(doc);
  return hrefs;
}
