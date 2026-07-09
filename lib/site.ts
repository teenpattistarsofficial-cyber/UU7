// Single source of truth for the site's canonical origin — used for
// metadataBase, the sitemap/robots absolute URLs, and JSON-LD blocks that
// need a real URL rather than a relative path.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3006";

// Single source of truth for the human-contact channel — used by the
// Contact page (components/site/contact-channels.tsx) and the Ask-AI
// widget's escalation link (components/ask-ai/chat-widget.tsx), so the
// handle can't drift between the two.
export const TELEGRAM_CONTACT_URL = "https://t.me/nehakapoorbot";
