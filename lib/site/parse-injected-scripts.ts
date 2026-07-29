import "server-only";
import { Window } from "happy-dom";

export type ParsedExternalScript = { attrs: Record<string, string> };
export type ParsedInlineScript = { attrs: Record<string, string>; content: string };

export type ParsedInjectedHtml = {
  externalScripts: ParsedExternalScript[];
  inlineScripts: ParsedInlineScript[];
  /** Whatever's left after pulling `<script>` tags out — e.g. a `<noscript>`
   * GTM fallback — still rendered as raw HTML, unchanged from before. */
  rest: string;
};

/** Splits an admin's raw pasted HTML (see components/admin/custom-scripts-settings.tsx
 * — a plain textarea, deliberately unsanitized and unconstrained in shape)
 * into individual `<script>` tags so each can be handed to next/script
 * instead of executing inertly inside a dangerouslySetInnerHTML div. Uses
 * happy-dom (already an installed dependency via @tiptap/html/server) for a
 * real parse rather than a regex — admin-pasted HTML can contain nested
 * quotes, comments, or arbitrary attribute ordering that a regex split
 * would mishandle. */
export function parseInjectedHtml(html: string): ParsedInjectedHtml {
  const window = new Window();
  const document = window.document;
  document.body.innerHTML = html;

  const externalScripts: ParsedExternalScript[] = [];
  const inlineScripts: ParsedInlineScript[] = [];

  for (const el of Array.from(document.querySelectorAll("script"))) {
    const attrs = Object.fromEntries(Array.from(el.attributes).map((a) => [a.name, a.value ?? ""]));
    if (el.getAttribute("src")) {
      externalScripts.push({ attrs });
    } else {
      inlineScripts.push({ attrs, content: el.textContent ?? "" });
    }
    el.remove();
  }

  return { externalScripts, inlineScripts, rest: document.body.innerHTML };
}
