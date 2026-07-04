import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "./extensions";

/** Renders a Tiptap JSON document to HTML for public-site display. Requires
 * happy-dom (peer dep of @tiptap/html/server) since this runs server-side
 * with no real browser DOM. */
export function renderContentHtml(doc: JSONContent | null | undefined): string {
  if (!doc || !doc.type) return "";
  return generateHTML(doc, editorExtensions);
}
