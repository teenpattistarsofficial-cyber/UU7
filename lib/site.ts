// Single source of truth for the site's canonical origin — used for
// metadataBase, the sitemap/robots absolute URLs, and JSON-LD blocks that
// need a real URL rather than a relative path.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3006";
