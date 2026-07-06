import "server-only";

// A single JSON-blob service-account key in one env var, same convention as
// every other credential in this app (lib/db/index.ts, lib/auth/index.ts) —
// everything lives in .env.local / the VPS's env, no separate key file to
// manage or accidentally commit.
export function isAnalyticsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS && process.env.GSC_SITE_URL && process.env.GA4_PROPERTY_ID,
  );
}

export function getGoogleCredentials(): Record<string, unknown> {
  return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS ?? "{}");
}

export function getGscSiteUrl(): string {
  return process.env.GSC_SITE_URL ?? "";
}

export function getGa4PropertyId(): string {
  return process.env.GA4_PROPERTY_ID ?? "";
}
