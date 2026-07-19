import { z } from "zod";
import { Window } from "happy-dom";
import { siteUrl, publishToken } from "../config.js";
import { fetchAndMeasure, pool, isHealthy, DEFAULT_CONCURRENCY } from "../lib/http.js";

export const runSiteHealthCheckSchema = {
  baseUrl: z.string().optional().describe("Site origin to crawl; defaults to the configured UU7_SITE_URL."),
  maxLinksToCheck: z
    .number()
    .int()
    .min(1)
    .max(2000)
    .optional()
    .describe("Cap on unique internal links/images checked beyond the sitemap pages themselves (default 300)."),
  slowThresholdMs: z
    .number()
    .int()
    .min(100)
    .optional()
    .describe("Response time in ms above which a URL is flagged as slow (default 1500)."),
  checkExternalLinks: z
    .boolean()
    .optional()
    .describe(
      "Also fetch off-site links to verify they resolve (default false) — reported separately at lower severity since third-party sites are outside our control and can be slow or block bots.",
    ),
};

const DEFAULT_MAX_LINKS = 300;
const DEFAULT_SLOW_MS = 1500;
// app/(site)/faq/page.tsx is a real route not included in app/sitemap.ts and
// not disallowed in robots.ts either — a genuine gap worth surfacing, not
// silently working around.
const EXTRA_ROUTES = ["/faq"];

function classifyUrl(raw: string, pageUrl: string, baseOrigin: string): { url: string; internal: boolean } | null {
  const trimmed = raw.trim();
  if (!trimmed || /^(#|mailto:|tel:|javascript:)/i.test(trimmed)) return null;
  try {
    const resolved = new URL(trimmed, pageUrl);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return { url: resolved.toString(), internal: resolved.origin === baseOrigin };
  } catch {
    return null;
  }
}

export async function runSiteHealthCheck(args: {
  baseUrl?: string;
  maxLinksToCheck?: number;
  slowThresholdMs?: number;
  checkExternalLinks?: boolean;
}) {
  const base = (args.baseUrl ?? siteUrl()).replace(/\/$/, "");
  const baseOrigin = new URL(base).origin;
  const maxLinks = args.maxLinksToCheck ?? DEFAULT_MAX_LINKS;
  const slowMs = args.slowThresholdMs ?? DEFAULT_SLOW_MS;
  const checkExternal = args.checkExternalLinks ?? false;

  // 1. Seed pages: sitemap + known gaps.
  const sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text();
  const seedUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const sitemapGaps: string[] = [];
  for (const extra of EXTRA_ROUTES) {
    const full = `${base}${extra}`;
    if (!seedUrls.includes(full)) {
      seedUrls.push(full);
      sitemapGaps.push(extra);
    }
  }
  const seedSet = new Set(seedUrls);

  // 2. Redirects, for cross-referencing broken links (best-effort — a failure
  // here shouldn't block the crawl itself, just skips that one enrichment).
  let redirectFromPaths = new Set<string>();
  try {
    const res = await fetch(`${base}/api/ops/redirects`, { headers: { Authorization: `Bearer ${publishToken()}` } });
    if (res.ok) {
      const body = (await res.json()) as { redirects?: { fromPath: string }[] };
      redirectFromPaths = new Set((body.redirects ?? []).map((r) => r.fromPath));
    }
  } catch {
    // non-fatal
  }

  // 3. Crawl seed pages, extracting links/images from each HTML response.
  const brokenPages: { url: string; status: number | null; error?: string }[] = [];
  const slowResponses: { url: string; ms: number }[] = [];
  const internalLinks = new Map<string, string>(); // url -> one page it was found on
  const externalLinks = new Map<string, string>();
  const images = new Map<string, { alt: string; foundOn: string }>();

  await pool(seedUrls, DEFAULT_CONCURRENCY, async (url) => {
    const outcome = await fetchAndMeasure(url, { wantBody: true });
    if (outcome.ms > slowMs) slowResponses.push({ url, ms: outcome.ms });
    if (!isHealthy(outcome.status)) {
      brokenPages.push({ url, status: outcome.status, error: outcome.error ?? undefined });
      return;
    }
    if (!outcome.html) return;

    try {
      const window = new Window({ url });
      window.document.write(outcome.html);
      for (const a of Array.from(window.document.querySelectorAll("a[href]"))) {
        const classified = classifyUrl(a.getAttribute("href") ?? "", url, baseOrigin);
        if (!classified || seedSet.has(classified.url)) continue;
        const map = classified.internal ? internalLinks : externalLinks;
        if (!map.has(classified.url)) map.set(classified.url, url);
      }
      for (const img of Array.from(window.document.querySelectorAll("img[src]"))) {
        const classified = classifyUrl(img.getAttribute("src") ?? "", url, baseOrigin);
        if (!classified) continue;
        if (!images.has(classified.url)) {
          images.set(classified.url, { alt: (img.getAttribute("alt") ?? "").trim(), foundOn: url });
        }
      }
      window.close();
    } catch {
      // A parse failure on one page shouldn't block the rest of the crawl.
    }
  });

  // 4. Check discovered internal links + images (capped), plus external links if requested.
  const internalTargets = [...internalLinks.keys()];
  const truncated = internalTargets.length > maxLinks;
  const internalToCheck = internalTargets.slice(0, maxLinks);

  const brokenLinks: { url: string; foundOn: string; status: number | null; redirectExists: boolean }[] = [];
  await pool(internalToCheck, DEFAULT_CONCURRENCY, async (url) => {
    const outcome = await fetchAndMeasure(url, { wantBody: false });
    if (outcome.ms > slowMs) slowResponses.push({ url, ms: outcome.ms });
    if (!isHealthy(outcome.status)) {
      const pathname = new URL(url).pathname;
      brokenLinks.push({
        url,
        foundOn: internalLinks.get(url) ?? "",
        status: outcome.status,
        redirectExists: redirectFromPaths.has(pathname),
      });
    }
  });

  const imageTargets = [...images.keys()];
  const brokenImages: { url: string; foundOn: string; status: number | null }[] = [];
  await pool(imageTargets, DEFAULT_CONCURRENCY, async (url) => {
    const outcome = await fetchAndMeasure(url, { wantBody: false });
    if (outcome.ms > slowMs) slowResponses.push({ url, ms: outcome.ms });
    if (!isHealthy(outcome.status)) {
      brokenImages.push({ url, foundOn: images.get(url)?.foundOn ?? "", status: outcome.status });
    }
  });
  const missingAltText = [...images.entries()]
    .filter(([, info]) => !info.alt)
    .map(([url, info]) => ({ url, foundOn: info.foundOn }));

  const externalLinkIssues: { url: string; foundOn: string; status: number | null }[] = [];
  if (checkExternal) {
    const externalTargets = [...externalLinks.keys()];
    await pool(externalTargets, DEFAULT_CONCURRENCY, async (url) => {
      const outcome = await fetchAndMeasure(url, { wantBody: false });
      if (!isHealthy(outcome.status)) {
        externalLinkIssues.push({ url, foundOn: externalLinks.get(url) ?? "", status: outcome.status });
      }
    });
  }

  return {
    pagesChecked: seedUrls.length,
    internalLinksChecked: internalToCheck.length,
    imagesChecked: imageTargets.length,
    externalLinksFound: externalLinks.size,
    externalLinksChecked: checkExternal ? externalLinks.size : 0,
    sitemapGaps,
    brokenPages,
    brokenLinks,
    brokenImages,
    missingAltText,
    slowResponses,
    externalLinkIssues,
    truncated,
  };
}
