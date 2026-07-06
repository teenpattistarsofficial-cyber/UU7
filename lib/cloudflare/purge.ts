import "server-only";

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";
// Cloudflare's documented cap on URLs per purge_cache call.
const MAX_URLS_PER_REQUEST = 30;

export function isCloudflarePurgeConfigured(): boolean {
  return Boolean(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * Purges specific URLs from Cloudflare's edge cache — the plan's
 * "purge-on-publish" mechanism, paired with (not a replacement for) the
 * revalidatePath() calls already wired into every content mutation.
 * revalidatePath clears Next's own server-side cache; this clears
 * Cloudflare's edge cache in front of it, which Next has no way to reach
 * through on its own.
 *
 * No-ops silently when unconfigured, and never throws on API failure — a
 * cache purge failing should never block a publish/save action, it should
 * just mean that one edge cache entry falls back to its normal TTL expiry
 * instead of updating instantly.
 */
export async function purgeCloudflareUrls(urls: string[]): Promise<void> {
  if (!isCloudflarePurgeConfigured() || urls.length === 0) return;

  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  for (const batch of chunk(urls, MAX_URLS_PER_REQUEST)) {
    try {
      const res = await fetch(`${CLOUDFLARE_API_BASE}/zones/${zoneId}/purge_cache`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: batch }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        console.error("Cloudflare cache purge failed:", data?.errors ?? res.statusText);
      }
    } catch (err) {
      console.error("Cloudflare cache purge request failed:", err);
    }
  }
}
