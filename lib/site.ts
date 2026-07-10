// Single source of truth for the site's canonical origin — used for
// metadataBase, the sitemap/robots absolute URLs, and JSON-LD blocks that
// need a real URL rather than a relative path.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3006";

// Static default logo, used until an admin sets a custom one in Settings →
// Branding — the file still ships in /public, so the site never breaks
// before that first upload. Deliberately NOT in lib/settings.ts alongside
// getSiteSettings() — that file is `server-only` (it touches the DB), and
// this constant needs to be importable from client components too (e.g.
// components/admin/branding-settings.tsx's live preview), which would
// otherwise poison the whole import for client bundling.
export const DEFAULT_LOGO_URL = "/UU7.io logo.webp";

// Moved from app/favicon.ico to public/favicon.ico deliberately — Next's
// file-based favicon convention auto-injects its own <link rel="icon">
// for anything at app/favicon.ico with NO way to suppress it from
// generateMetadata, so a custom favicon set via Settings → Branding would
// always end up competing with it (two <link rel="icon"> tags, ambiguous
// which a browser picks). Serving the default from /public instead and
// only ever setting the icon through the `icons` metadata field (see
// app/layout.tsx) keeps exactly one favicon link, always.
export const DEFAULT_FAVICON_URL = "/favicon.ico";
