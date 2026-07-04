import type { JSONContent } from "@tiptap/core";

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * Normalizes whatever is in the `content` jsonb column into a Tiptap
 * document. Phase 1 stored plain strings in that column (before the editor
 * existed); this migrates those on the fly into a single-paragraph doc
 * instead of requiring a backfill migration.
 */
export function toTiptapDoc(content: unknown): JSONContent {
  if (content && typeof content === "object" && "type" in content) {
    return content as JSONContent;
  }
  if (typeof content === "string" && content.trim().length > 0) {
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] };
  }
  return EMPTY_DOC;
}
