function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Read lazily (inside functions, not at module load) so the server can still
// start and list its tools even if a variable is missing — the error only
// surfaces when a tool that actually needs it gets called.
export function siteUrl(): string {
  return requireEnv("UU7_SITE_URL").replace(/\/$/, "");
}

export function publishToken(): string {
  return requireEnv("UU7_PUBLISH_TOKEN");
}

export function pexelsApiKey(): string {
  return requireEnv("PEXELS_API_KEY");
}

// Optional, unlike the getters above — PageSpeed Insights works keyless, just
// at a lower rate limit, so a missing key shouldn't block the tool.
export function pagespeedApiKeyOptional(): string | undefined {
  return process.env.PAGESPEED_API_KEY || undefined;
}
