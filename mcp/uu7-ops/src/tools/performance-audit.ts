import { z } from "zod";
import { Window } from "happy-dom";
import { siteUrl, pagespeedApiKeyOptional } from "../config.js";
import { fetchAndMeasure, pool, DEFAULT_CONCURRENCY } from "../lib/http.js";

export const runPerformanceAuditSchema = {
  baseUrl: z.string().optional().describe("Site origin to audit; defaults to the configured UU7_SITE_URL."),
  urls: z
    .array(z.string())
    .optional()
    .describe("Specific page URLs to audit. If omitted, seeds from /sitemap.xml (homepage first)."),
  maxPages: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Cap on pages checked for cache headers/image optimization when urls isn't given (default 8)."),
  maxCwvPages: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .describe(
      "Cap on pages sent to PageSpeed Insights for real Core Web Vitals scores (default 3) — each call runs a full Lighthouse pass and takes 15-30s, so keep this small. Homepage is always included first.",
    ),
  strategy: z.enum(["mobile", "desktop"]).optional().describe("PageSpeed Insights device strategy (default mobile)."),
};

const DEFAULT_MAX_PAGES = 8;
const DEFAULT_MAX_CWV_PAGES = 3;
const LARGE_IMAGE_BYTES = 300 * 1024;
const PSI_TIMEOUT_MS = 45_000;

type PageFinding = {
  url: string;
  status: number | null;
  ms: number;
  cacheControl: string | null;
  cfCacheStatus: string | null;
  contentEncoding: string | null;
  imageCount: number;
  imagesMissingDimensions: string[];
  imagesMissingLazyLoading: string[];
  largeImages: { url: string; bytes: number }[];
};

function isLocalHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "0.0.0.0";
  } catch {
    return false;
  }
}

async function auditImages(html: string, pageUrl: string): Promise<{
  imageCount: number;
  missingDimensions: string[];
  missingLazyLoading: string[];
  imageUrls: string[];
}> {
  const missingDimensions: string[] = [];
  const missingLazyLoading: string[] = [];
  const imageUrls: string[] = [];
  try {
    const window = new Window({ url: pageUrl });
    window.document.write(html);
    const imgs = Array.from(window.document.querySelectorAll("img"));
    for (const img of imgs) {
      const src = img.getAttribute("src");
      if (!src) continue;
      try {
        imageUrls.push(new URL(src, pageUrl).toString());
      } catch {
        continue;
      }
      // next/image stamps a `data-nimg` attribute on every <img> it renders,
      // including "fill" mode, which legitimately has no width/height (sized
      // via its parent container's CSS instead) and manages loading/priority
      // itself. Only flag images next/image ISN'T managing — i.e. raw,
      // hand-authored <img> tags (the actual Tiptap body-content gap) —
      // otherwise every well-behaved next/image instance on the page would
      // false-positive and bury the one real finding in noise.
      if (img.hasAttribute("data-nimg")) continue;
      if (!img.getAttribute("width") || !img.getAttribute("height")) missingDimensions.push(src);
      if ((img.getAttribute("loading") ?? "") !== "lazy") missingLazyLoading.push(src);
    }
    window.close();
    return { imageCount: imgs.length, missingDimensions, missingLazyLoading, imageUrls };
  } catch {
    return { imageCount: 0, missingDimensions, missingLazyLoading, imageUrls };
  }
}

async function callPageSpeedInsights(url: string, strategy: "mobile" | "desktop") {
  const psiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  psiUrl.searchParams.set("url", url);
  psiUrl.searchParams.set("strategy", strategy);
  psiUrl.searchParams.set("category", "performance");
  const key = pagespeedApiKeyOptional();
  if (key) psiUrl.searchParams.set("key", key);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PSI_TIMEOUT_MS);
  try {
    const res = await fetch(psiUrl, { signal: controller.signal });
    const body = await res.json();
    if (!res.ok) {
      return { url, error: body?.error?.message ?? `PageSpeed Insights request failed (${res.status})` };
    }
    const audits = body?.lighthouseResult?.audits ?? {};
    const score = body?.lighthouseResult?.categories?.performance?.score;
    return {
      url,
      performanceScore: typeof score === "number" ? Math.round(score * 100) : null,
      lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
      cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
      tbtMs: audits["total-blocking-time"]?.numericValue ?? null,
      speedIndexMs: audits["speed-index"]?.numericValue ?? null,
    };
  } catch (err) {
    return { url, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runPerformanceAudit(args: {
  baseUrl?: string;
  urls?: string[];
  maxPages?: number;
  maxCwvPages?: number;
  strategy?: "mobile" | "desktop";
}) {
  const base = (args.baseUrl ?? siteUrl()).replace(/\/$/, "");
  const maxPages = args.maxPages ?? DEFAULT_MAX_PAGES;
  const maxCwvPages = args.maxCwvPages ?? DEFAULT_MAX_CWV_PAGES;
  const strategy = args.strategy ?? "mobile";

  // 1. Resolve the page list.
  let pageUrls: string[];
  if (args.urls?.length) {
    pageUrls = args.urls.slice(0, maxPages);
  } else {
    const sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text();
    const fromSitemap = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    const homepage = `${base}/`;
    const rest = fromSitemap.filter((u) => u !== homepage && u !== base);
    pageUrls = [homepage, ...rest].slice(0, maxPages);
  }

  // 2. HTTPS check.
  const baseIsHttps = base.startsWith("https://");
  let httpsReachable: boolean | null = null;
  if (!baseIsHttps) {
    try {
      const httpsUrl = base.replace(/^http:\/\//, "https://");
      const outcome = await fetchAndMeasure(httpsUrl, { timeoutMs: 5000 });
      httpsReachable = outcome.status !== null && outcome.status < 500;
    } catch {
      httpsReachable = false;
    }
  }

  // 3. Cache-header + image-optimization tier.
  const pages: PageFinding[] = [];
  const imageUrlToPages = new Map<string, Set<string>>();

  await pool(pageUrls, DEFAULT_CONCURRENCY, async (url) => {
    const outcome = await fetchAndMeasure(url, { wantBody: true });
    const finding: PageFinding = {
      url,
      status: outcome.status,
      ms: outcome.ms,
      cacheControl: outcome.headers?.get("cache-control") ?? null,
      cfCacheStatus: outcome.headers?.get("cf-cache-status") ?? null,
      contentEncoding: outcome.headers?.get("content-encoding") ?? null,
      imageCount: 0,
      imagesMissingDimensions: [],
      imagesMissingLazyLoading: [],
      largeImages: [],
    };
    if (outcome.html) {
      const { imageCount, missingDimensions, missingLazyLoading, imageUrls } = await auditImages(outcome.html, url);
      finding.imageCount = imageCount;
      finding.imagesMissingDimensions = missingDimensions;
      finding.imagesMissingLazyLoading = missingLazyLoading;
      for (const imgUrl of imageUrls) {
        if (!imageUrlToPages.has(imgUrl)) imageUrlToPages.set(imgUrl, new Set());
        imageUrlToPages.get(imgUrl)!.add(url);
      }
    }
    pages.push(finding);
  });

  // Check each unique image's size once via HEAD, attribute large ones back to their page(s).
  const uniqueImageUrls = [...imageUrlToPages.keys()];
  const largeImagesByUrl = new Map<string, number>();
  await pool(uniqueImageUrls, DEFAULT_CONCURRENCY, async (imgUrl) => {
    const outcome = await fetchAndMeasure(imgUrl, { method: "HEAD" });
    const bytes = Number(outcome.headers?.get("content-length") ?? 0);
    if (bytes > LARGE_IMAGE_BYTES) largeImagesByUrl.set(imgUrl, bytes);
  });
  for (const page of pages) {
    for (const [imgUrl, bytes] of largeImagesByUrl) {
      if (imageUrlToPages.get(imgUrl)?.has(page.url)) {
        page.largeImages.push({ url: imgUrl, bytes });
      }
    }
  }

  // 4. Core Web Vitals tier via PageSpeed Insights.
  let coreWebVitals: {
    skipped: boolean;
    skippedReason?: string;
    strategy: "mobile" | "desktop";
    results: Awaited<ReturnType<typeof callPageSpeedInsights>>[];
  };
  if (maxCwvPages === 0) {
    coreWebVitals = { skipped: true, skippedReason: "maxCwvPages was 0", strategy, results: [] };
  } else if (isLocalHost(base)) {
    coreWebVitals = {
      skipped: true,
      skippedReason: "baseUrl is localhost — Google's PageSpeed Insights servers can't reach a local dev server. Point baseUrl at the public site to get real Core Web Vitals scores.",
      strategy,
      results: [],
    };
  } else {
    const cwvTargets = pageUrls.slice(0, maxCwvPages);
    const results: Awaited<ReturnType<typeof callPageSpeedInsights>>[] = [];
    for (const url of cwvTargets) {
      // Sequential, not pooled — PSI runs a real Lighthouse pass per call and
      // is rate-limited, especially without an API key.
      results.push(await callPageSpeedInsights(url, strategy));
    }
    coreWebVitals = { skipped: false, strategy, results };
  }

  return {
    pagesChecked: pageUrls,
    https: { baseIsHttps, httpsReachable },
    pages,
    coreWebVitals,
    notes: [
      "Cloudflare zone-level settings (Polish, Brotli, Rocket Loader, Auto Minify) are not checked by this tool — would need a separate Cloudflare API credential.",
    ],
  };
}
