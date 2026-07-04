import "server-only";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";

type RedirectEntry = { toPath: string; statusCode: number };

// Proxy is bundled and executed in its own isolated context, separate from
// route handlers and Server Actions, even though both nominally run on the
// Node.js runtime — confirmed empirically: calling `invalidateRedirectsCache`
// from a Server Action does not affect the instance of this module that
// proxy.ts sees (a follow-up request still hit the stale cache in ~5ms
// instead of the ~250ms a real reload takes). So `invalidate()` below is
// best-effort only — it helps if a future Next.js version or deployment
// shape happens to share the instance, but the real guarantee an admin's
// change appears is this short TTL, not invalidation.
const TTL_MS = 5_000;
let cache: Map<string, RedirectEntry> | null = null;
let expiresAt = 0;

async function load(): Promise<Map<string, RedirectEntry>> {
  const rows = await db.select().from(redirects);
  return new Map(rows.map((r) => [r.fromPath, { toPath: r.toPath, statusCode: r.statusCode }]));
}

export async function getRedirectFor(pathname: string): Promise<RedirectEntry | null> {
  if (!cache || Date.now() >= expiresAt) {
    cache = await load();
    expiresAt = Date.now() + TTL_MS;
  }
  return cache.get(pathname) ?? null;
}

export function invalidateRedirectsCache() {
  cache = null;
  expiresAt = 0;
}
