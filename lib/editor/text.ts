import type { JSONContent } from "@tiptap/core";

/** Walks a Tiptap JSON document and concatenates every text node's content. */
export function extractText(doc: JSONContent | null | undefined): string {
  if (!doc) return "";
  const parts: string[] = [];

  function walk(node: JSONContent) {
    if (node.text) parts.push(node.text);
    node.content?.forEach(walk);
  }

  walk(doc);
  return parts.join(" ");
}

export function isEmptyDoc(doc: JSONContent | null | undefined): boolean {
  return extractText(doc).trim().length === 0;
}
