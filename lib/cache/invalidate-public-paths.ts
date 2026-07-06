import "server-only";
import { revalidatePath } from "next/cache";
import { SITE_URL } from "@/lib/site";
import { purgeCloudflareUrls } from "@/lib/cloudflare/purge";

/**
 * The one place every content server action calls to say "these public
 * paths just changed": clears Next's own route cache immediately
 * (revalidatePath) and fires a Cloudflare edge-cache purge in the
 * background (best-effort — see purgeCloudflareUrls, never blocks or
 * throws). The Cloudflare call is intentionally fire-and-forget (not
 * awaited) — safe specifically because this app runs as a single
 * long-lived Node process via Docker Compose, not a serverless function
 * that could get frozen/recycled mid-request before the call completes.
 */
export function invalidatePublicPaths(paths: string[]): void {
  for (const path of paths) revalidatePath(path);
  void purgeCloudflareUrls(paths.map((path) => `${SITE_URL}${path}`));
}
