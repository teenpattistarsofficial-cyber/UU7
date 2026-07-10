import "server-only";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

type MaintenanceState = { enabled: boolean; message: string | null; logoUrl: string | null; faviconUrl: string | null };

// Same TTL-cache shape as lib/redirects/cache.ts and for the same reason:
// proxy.ts runs in its own bundled context, so a Server Action calling
// invalidate() doesn't reliably reach the instance proxy.ts sees — the
// short TTL is the real guarantee, invalidation is just a best-effort
// head start.
const TTL_MS = 5_000;
let cache: MaintenanceState | null = null;
let expiresAt = 0;

async function load(): Promise<MaintenanceState> {
  const [row] = await db
    .select({
      maintenanceMode: siteSettings.maintenanceMode,
      maintenanceMessage: siteSettings.maintenanceMessage,
      logoUrl: siteSettings.logoUrl,
      faviconUrl: siteSettings.faviconUrl,
    })
    .from(siteSettings)
    .limit(1);
  return {
    enabled: row?.maintenanceMode ?? false,
    message: row?.maintenanceMessage ?? null,
    logoUrl: row?.logoUrl ?? null,
    faviconUrl: row?.faviconUrl ?? null,
  };
}

export async function getMaintenanceState(): Promise<MaintenanceState> {
  if (!cache || Date.now() >= expiresAt) {
    cache = await load();
    expiresAt = Date.now() + TTL_MS;
  }
  return cache;
}

export function invalidateMaintenanceCache() {
  cache = null;
  expiresAt = 0;
}
