import type { JSONContent } from "@tiptap/core";
import { collectLinkHrefs } from "@/lib/editor/links";

/** True for an absolute-internal-path href (`/...`, not `//`) whose first
 * path segment isn't in `validPrefixes`. External links, anchors,
 * mailto:/tel:, and protocol-relative URLs are never this check's concern
 * — only same-site paths that look like they should point at a real
 * category/page/post but don't. Takes the valid set as a parameter rather
 * than hardcoding it against `SITE_CATEGORIES` — that list is explicitly a
 * fixed set of five nav categories, not the live `categories`/`pages`
 * tables (an editor-created category or CMS page wouldn't be in it), so
 * the caller must build `validPrefixes` from the DB to avoid rejecting
 * perfectly valid links. */
export function isInvalidInternalLink(href: string, validPrefixes: Set<string>): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  const segment = href.match(/^\/([^/?#]+)/)?.[1];
  return Boolean(segment && !validPrefixes.has(segment));
}

/** Same check applied to every link mark in a Tiptap doc. */
export function findInvalidInternalLinks(doc: JSONContent | null | undefined, validPrefixes: Set<string>): string[] {
  return collectLinkHrefs(doc).filter((href) => isInvalidInternalLink(href, validPrefixes));
}
