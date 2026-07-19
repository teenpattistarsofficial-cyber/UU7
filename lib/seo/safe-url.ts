const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

// Allows absolute http(s) URLs and same-site relative paths ("/foo"),
// rejects everything else (javascript:, data:, vbscript:, protocol-relative
// "//evil.com", etc.). Needed anywhere a URL is stored/rendered without
// going through Tiptap's Link mark, which already enforces its own protocol
// allowlist (lib/editor/extensions.ts) — CTA button URLs and server-fetched
// cover image sources both bypass that entirely.
export function isSafeExternalUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    return SAFE_PROTOCOLS.has(new URL(trimmed).protocol);
  } catch {
    return false;
  }
}
