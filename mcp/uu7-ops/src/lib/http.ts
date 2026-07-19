// Shared timed-fetch + bounded-concurrency helpers, used by both
// health-check.ts and performance-audit.ts so the crawling primitives exist
// in exactly one place.

export const DEFAULT_CONCURRENCY = 8;
export const DEFAULT_FETCH_TIMEOUT_MS = 8000;

export type FetchOutcome = {
  status: number | null;
  ms: number;
  error: string | null;
  html: string | null;
  headers: Headers | null;
};

export async function fetchAndMeasure(
  url: string,
  opts: { wantBody?: boolean; method?: "GET" | "HEAD"; timeoutMs?: number } = {},
): Promise<FetchOutcome> {
  const { wantBody = false, method = "GET", timeoutMs = DEFAULT_FETCH_TIMEOUT_MS } = opts;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    // redirect: "manual" so one of the site's own configured redirects shows
    // up as a 3xx (treated as healthy by callers) instead of silently
    // following it and reporting the destination's status/timing instead.
    const res = await fetch(url, { method, signal: controller.signal, redirect: "manual" });
    const ms = Date.now() - start;
    const contentType = res.headers.get("content-type") ?? "";
    const html = wantBody && res.status < 400 && contentType.includes("text/html") ? await res.text() : null;
    return { status: res.status, ms, error: null, html, headers: res.headers };
  } catch (err) {
    return {
      status: null,
      ms: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
      html: null,
      headers: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function pool<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>) {
  let index = 0;
  async function runOne() {
    while (index < items.length) {
      const i = index++;
      await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) || 1 }, runOne));
}

export function isHealthy(status: number | null): boolean {
  return status !== null && status < 400;
}
