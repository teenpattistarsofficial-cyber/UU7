import type { JSONContent } from "@tiptap/core";

export type Citation = { text: string; url: string };

/** Sources are never stored either — derived from the external links
 * already in the article body (same "external" classification
 * lib/seo/score.ts uses for the internal/external link checks), so citing
 * a source is just... linking to it while writing. Dedupes by URL, keeping
 * the first anchor text used for it. */
export function extractCitations(doc: JSONContent | null | undefined, siteHost: string): Citation[] {
  const citations: Citation[] = [];
  const seenUrls = new Set<string>();
  if (!doc) return citations;

  function walk(node: JSONContent) {
    const linkMark = node.marks?.find((m) => m.type === "link" && typeof m.attrs?.href === "string");
    if (linkMark && node.text) {
      const href = linkMark.attrs!.href as string;
      if (isExternal(href, siteHost) && !seenUrls.has(href)) {
        seenUrls.add(href);
        citations.push({ text: node.text, url: href });
      }
    }
    node.content?.forEach(walk);
  }

  walk(doc);
  return citations;
}

function isExternal(href: string, siteHost: string): boolean {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("/")) {
    return false;
  }
  try {
    return new URL(href).host !== siteHost;
  } catch {
    return false;
  }
}
