import { extractText } from "@/lib/editor/text";
import { slugify } from "@/lib/seo/slugify";
import type { JSONContent } from "@tiptap/core";

type SeoMetaRow = {
  seoTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
} | null | undefined;

const MIN_WORD_COUNT = 300;

// Single source of truth for the "good" character ranges — reused by the
// score checklist below and by the live character counters in the editor
// (SeoFieldsPanel, SerpPreview) so both agree on when a field is actually
// in good shape.
export const SEO_TITLE_MIN = 30;
export const SEO_TITLE_MAX = 60;
export const META_DESCRIPTION_MIN = 120;
export const META_DESCRIPTION_MAX = 160;

export type SeoCheck = { key: string; label: string; passed: boolean };

type ChecklistArgs = {
  title: string;
  slug?: string;
  // `undefined` means "this entity type has no body-content concept at
  // all" (categories, currently — just a title/slug/short description, not
  // a full article) — every content-structure check below (headings, word
  // count, internal/external links, focus-keyword-in-content) is omitted
  // for those entities rather than shown as a permanent, unfixable
  // failure, the same reasoning as `featuredImageUrl` below. `null` means
  // the entity does have that concept but the content is genuinely empty.
  content: JSONContent | null | undefined;
  seo: SeoMetaRow;
  // `undefined` means "this entity type has no featured-image field at
  // all" (pages, currently) — the check is omitted rather than shown as a
  // permanent, unfixable failure. `null`/`""` means the field exists but is
  // genuinely empty.
  featuredImageUrl?: string | null;
};

/**
 * The full, itemized SEO checklist — every signal `computeSeoScore` rolls
 * up into a single number, exposed individually so the editor can show
 * exactly what's passing/failing instead of an opaque score.
 */
export function getSeoChecklist({ title, slug, content, seo, featuredImageUrl }: ChecklistArgs): SeoCheck[] {
  const hasBodyContent = content !== undefined;
  const text = extractText(content);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const seoTitle = seo?.seoTitle?.trim() || title;
  const metaDescription = seo?.metaDescription?.trim() ?? "";
  const focusKeyword = seo?.focusKeyword?.trim().toLowerCase();
  const { internal, external } = countLinksByAudience(content);

  const checks: SeoCheck[] = [
    { key: "seoTitlePresent", label: "SEO title is set", passed: Boolean(seo?.seoTitle?.trim()) },
    {
      key: "seoTitleLength",
      label: `SEO title is ${SEO_TITLE_MIN}–${SEO_TITLE_MAX} characters`,
      passed: seoTitle.length >= SEO_TITLE_MIN && seoTitle.length <= SEO_TITLE_MAX,
    },
    { key: "metaDescPresent", label: "Meta description is set", passed: Boolean(metaDescription) },
    {
      key: "metaDescLength",
      label: `Meta description is ${META_DESCRIPTION_MIN}–${META_DESCRIPTION_MAX} characters`,
      passed: metaDescription.length >= META_DESCRIPTION_MIN && metaDescription.length <= META_DESCRIPTION_MAX,
    },
    { key: "focusKeywordSet", label: "Focus keyword is set", passed: Boolean(focusKeyword) },
    {
      key: "focusKeywordInTitle",
      label: "Focus keyword appears in the SEO title",
      passed: Boolean(focusKeyword && seoTitle.toLowerCase().includes(focusKeyword)),
    },
    {
      key: "focusKeywordInSlug",
      // Slugs use hyphens where the keyword has spaces ("famous food" vs.
      // "famous-food") — slugify both sides so the comparison is apples to
      // apples instead of failing on punctuation alone.
      label: "Focus keyword appears in the URL slug",
      passed: (() => {
        const slugifiedKeyword = focusKeyword ? slugify(focusKeyword) : "";
        return Boolean(slugifiedKeyword && slug?.toLowerCase().includes(slugifiedKeyword));
      })(),
    },
  ];

  if (hasBodyContent) {
    checks.push(
      {
        key: "focusKeywordInContent",
        label: "Focus keyword appears in the content",
        passed: Boolean(focusKeyword && text.toLowerCase().includes(focusKeyword)),
      },
      { key: "hasHeading", label: "Content has at least one heading", passed: hasHeading(content) },
      {
        key: "singleH1",
        label: "Only one H1 on the page (the post title) — no H1s in the body",
        passed: hasNoH1InBody(content),
      },
      {
        key: "headingHierarchy",
        label: "Headings follow a proper H2 → H3 → H4 hierarchy (no skipped levels)",
        passed: hasProperHeadingHierarchy(content),
      },
      {
        key: "wordCount",
        label: `Content is at least ${MIN_WORD_COUNT} words (currently ${wordCount})`,
        passed: wordCount >= MIN_WORD_COUNT,
      },
      {
        key: "hasInternalLink",
        label: `Content has at least one internal link (${internal} found)`,
        passed: internal > 0,
      },
      {
        key: "hasExternalLink",
        label: `Content has at least one external link (${external} found)`,
        passed: external > 0,
      },
    );
  }

  if (featuredImageUrl !== undefined) {
    checks.push({ key: "featuredImageSet", label: "Featured image is set", passed: Boolean(featuredImageUrl) });
  }

  return checks;
}

/**
 * A lightweight, transparent SEO score (0-100) computed from real signals
 * already stored on the post — not a black box. Every check is something
 * an editor can act on directly from the fields already in the editor.
 */
export function computeSeoScore(args: ChecklistArgs): number {
  const checks = getSeoChecklist(args);
  const passed = checks.filter((c) => c.passed).length;
  return Math.round((passed / checks.length) * 100);
}

function hasHeading(doc: JSONContent | null | undefined): boolean {
  return collectHeadingLevels(doc).length > 0;
}

function collectHeadingLevels(doc: JSONContent | null | undefined): number[] {
  const levels: number[] = [];
  if (!doc) return levels;
  function walk(node: JSONContent) {
    if (node.type === "heading" && typeof node.attrs?.level === "number") levels.push(node.attrs.level);
    node.content?.forEach(walk);
  }
  walk(doc);
  return levels;
}

// Guards against a heading landing at H1 despite the editor's H2-H4 cap
// (e.g. imported/legacy content) — the post title is the page's only H1,
// so any H1 inside the body would create a second one. Exported so the
// publish gate (lib/actions/posts.ts) can hard-block on it, not just show
// it as a checklist item.
export function hasNoH1InBody(doc: JSONContent | null | undefined): boolean {
  return !collectHeadingLevels(doc).some((level) => level === 1);
}

// Module 7 (Heading Structure Validator) — checks the body's headings never
// skip a level on the way down. The page's title is the implicit H1 "root"
// (level 1) that the first body heading nests under, so a body that opens
// with an H3 (skipping H2) is flagged exactly like an H2 followed directly
// by an H4 later on. Going back up to a shallower level is always fine —
// only skipping deeper is a violation.
export function hasProperHeadingHierarchy(doc: JSONContent | null | undefined): boolean {
  let previous = 1;
  for (const level of collectHeadingLevels(doc)) {
    if (level > previous + 1) return false;
    previous = level;
  }
  return true;
}

// The site's own host, used to tell an internal link (to uu7.io) apart from
// an external one. `window.location` is the accurate source in the editor
// (client-side); the env var covers the server-rendered list pages, where
// `computeSeoScore` also runs.
function siteHost(): string {
  if (typeof window !== "undefined") return window.location.host;
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").host;
  } catch {
    return "";
  }
}

function collectLinkHrefs(doc: JSONContent | null | undefined): string[] {
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

function countLinksByAudience(doc: JSONContent | null | undefined): { internal: number; external: number } {
  const host = siteHost();
  let internal = 0;
  let external = 0;

  for (const href of collectLinkHrefs(doc)) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (href.startsWith("/")) {
      internal++;
      continue;
    }
    try {
      const url = new URL(href);
      if (host && url.host === host) internal++;
      else external++;
    } catch {
      // Not a recognizable link (e.g. a malformed href) — ignore rather
      // than miscounting it either way.
    }
  }

  return { internal, external };
}
