import { purgeEverything } from "@/lib/cloudflare/purge";

/** Runs once when a new Next.js server instance boots — including every
 * production deploy's `docker compose up -d app`, regardless of whether
 * that happened via a remembered deploy script or ad-hoc SSH commands.
 * Automatically purges Cloudflare's entire edge cache so a code-only
 * deploy (which never runs any of the content-mutation actions that call
 * invalidatePublicPaths/purgeCloudflareUrls) can't leave stale pre-deploy
 * HTML/JS serving from edge nodes for up to their full Cache Rule TTL —
 * the exact gap found during the 2026-08-04/05 LCP fix, previously worked
 * around with a manual dashboard "Purge Everything" click. See
 * purgeEverything()'s own comment for why this purges the whole zone
 * rather than a fixed path list.
 *
 * Not awaited — register()'s return value is awaited by Next before the
 * server starts handling requests, and a slow/hung Cloudflare API call
 * must never delay real traffic from reaching a freshly-deployed server.
 * purgeEverything() never throws and carries its own timeout regardless.
 * Silently no-ops on local dev (no CLOUDFLARE_API_TOKEN/ZONE_ID there). */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    void purgeEverything();
  }
}
