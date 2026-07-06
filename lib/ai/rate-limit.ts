import "server-only";

// In-memory only, same assumption lib/redirects/cache.ts already relies on:
// this app deploys as a single Node process on one VPS (see the deployment
// plan), so a module-level Map is a real per-instance limiter, not a leak
// across separate serverless invocations. Resets on restart/deploy, which is
// fine for a cost guard rather than a security control.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const hitsByKey = new Map<string, number[]>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const recentHits = (hitsByKey.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recentHits.length >= MAX_REQUESTS_PER_WINDOW) {
    hitsByKey.set(key, recentHits);
    return false;
  }
  recentHits.push(now);
  hitsByKey.set(key, recentHits);
  return true;
}
