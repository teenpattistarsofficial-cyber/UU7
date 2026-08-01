import type { JSONContent } from "@tiptap/core";
import { collectLinkHrefs } from "@/lib/editor/links";

export type LinkValidationContext = {
  /** Valid single-segment paths: category listing pages, CMS pages, and
   * other static top-level routes (`authors`, `faq`). */
  validPrefixes: Set<string>;
  /** Valid two-segment canonical paths: real post URLs (`/<category>/<slug>`)
   * and real author URLs (`/authors/<slug>`) — full paths, not just prefixes,
   * so a link to a nonexistent slug under an otherwise-real category (e.g.
   * `/game-guides/a-guide-that-was-never-published`) is still caught. */
  validFullPaths: Set<string>;
};

/** True for an absolute-internal-path href (`/...`, not `//`) that looks
 * like it should point at a real category/page/post/author but doesn't.
 * External links, anchors, mailto:/tel:, and protocol-relative URLs are
 * never this check's concern. Takes both sets as parameters rather than
 * hardcoding against `SITE_CATEGORIES` — that list is explicitly a fixed
 * set of five nav categories, not the live `categories`/`pages`/`posts`/
 * `authors` tables (an editor-created category, or any real post/author,
 * wouldn't be in it), so the caller must build both from the DB to avoid
 * rejecting perfectly valid links. */
export function isInvalidInternalLink(href: string, ctx: LinkValidationContext): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  const match = href.match(/^\/([^/?#]+)(?:\/([^/?#]+))?/);
  if (!match) return false;
  const [, seg1, seg2] = match;
  if (!seg2) return !ctx.validPrefixes.has(seg1);
  return !ctx.validFullPaths.has(`/${seg1}/${seg2}`);
}

/** Same check applied to every link mark in a Tiptap doc. */
export function findInvalidInternalLinks(doc: JSONContent | null | undefined, ctx: LinkValidationContext): string[] {
  return collectLinkHrefs(doc).filter((href) => isInvalidInternalLink(href, ctx));
}
