import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";

export type TocHeading = { id: string; text: string; level: number };

/** Table of Contents is never stored — derived from the same Tiptap JSON
 * used to render the article, in document order, so it can never drift
 * out of sync with the actual headings. IDs are deduped (two headings
 * titled "Overview" become "overview" and "overview-2") since they have
 * to be unique to work as in-page anchors. */
export function extractHeadings(doc: JSONContent | null | undefined): TocHeading[] {
  const headings: TocHeading[] = [];
  if (!doc) return headings;

  const seenSlugs = new Map<string, number>();

  function headingText(node: JSONContent): string {
    const parts: string[] = [];
    function walk(n: JSONContent) {
      if (n.text) parts.push(n.text);
      n.content?.forEach(walk);
    }
    node.content?.forEach(walk);
    return parts.join("");
  }

  function walk(node: JSONContent) {
    if (node.type === "heading" && typeof node.attrs?.level === "number") {
      const text = headingText(node).trim();
      if (text) {
        const base = slugify(text) || "section";
        const count = seenSlugs.get(base) ?? 0;
        seenSlugs.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count + 1}`;
        headings.push({ id, text, level: node.attrs.level });
      }
    }
    node.content?.forEach(walk);
  }

  walk(doc);
  return headings;
}

/** Stamps the `id="..."` from `extractHeadings` onto each rendered `<h2/3/4>`
 * tag, in the same document order both were derived from — no schema
 * changes to the Tiptap Heading node needed. */
export function injectHeadingIds(html: string, headings: TocHeading[]): string {
  let i = 0;
  return html.replace(/<h([234])([^>]*)>/g, (match, level, attrs) => {
    const heading = headings[i];
    i++;
    if (!heading) return match;
    return `<h${level} id="${heading.id}"${attrs}>`;
  });
}
