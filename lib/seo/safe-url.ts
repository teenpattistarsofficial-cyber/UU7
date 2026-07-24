import { SITE_URL } from "@/lib/site";

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

// Same-origin relative paths ("/foo") and absolute same-hostname URLs are
// internal (should stay in the same tab); everything else — a different
// hostname, protocol-relative "//other.com", mailto:/tel: — is external
// (should open in a new tab with rel="noopener noreferrer"). Used by the
// editor's link-insertion code (components/editor/tiptap-editor.tsx) to set
// the Tiptap link mark's target/rel automatically at authoring time, rather
// than relying on a one-time content sweep that silently goes stale the
// next time someone adds a link (see docs/development-log.md's "Sitewide
// bug: every link opened in a new tab" entry — the extension-default fix
// alone didn't close this gap).
export function isExternalUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return false;
  try {
    const target = new URL(trimmed, SITE_URL);
    return target.hostname !== new URL(SITE_URL).hostname;
  } catch {
    return false;
  }
}
