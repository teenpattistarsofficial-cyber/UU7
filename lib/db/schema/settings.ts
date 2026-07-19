import { pgTable, text, integer, uuid, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

export const contactChannelKindEnum = pgEnum("contact_channel_kind", [
  "telegram",
  "whatsapp",
  "email",
  "phone",
  "website",
]);

// Admin-manageable "how to reach us" list rendered on the Contact page and
// used as the Ask-AI widget's escalation link — replaces what used to be a
// single hardcoded TELEGRAM_CONTACT_URL constant, so adding/changing/
// removing a contact method no longer needs a code change.
export const contactChannels = pgTable("contact_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: contactChannelKindEnum("kind").notNull(),
  label: text("label").notNull(),
  // Meaning depends on `kind`: a full URL for telegram/whatsapp/website, a
  // bare email address for `email`, a bare phone number for `phone` — see
  // getContactChannelHref() in lib/contact-channels.ts for how each is
  // turned into a real href (mailto:/tel:/as-is).
  value: text("value").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Singleton — exactly one row, read via lib/settings.ts's getSiteSettings()
// (upserted rather than keyed by a fixed id, same reasoning as the CMS
// pages table not needing one). Any field left null falls back to the
// site's static default asset (see DEFAULT_LOGO_URL in lib/site.ts)
// rather than breaking header/footer/admin chrome before an admin sets one.
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  // Fallback social-share image for any page/post that has neither its own
  // OG image nor a featured image — see buildMetadata() in lib/seo/metadata.ts.
  ogImageUrl: text("og_image_url"),
  // Site-wide SEO identity — the homepage has no generateMetadata of its
  // own (unlike posts/pages/categories/authors), so before this it just
  // inherited whatever was hardcoded in app/layout.tsx. These are also the
  // fallback for every other page's title/description default.
  siteTitle: text("site_title"),
  metaDescription: text("meta_description"),
  // Comma-separated. Ignored by Google/Bing for ranking for well over a
  // decade now — kept only because some other engines/tools still read it
  // and a site owner may still want it set; the admin UI says so.
  metaKeywords: text("meta_keywords"),
  // Site verification meta tags (Search Console etc.) — just the raw
  // content value Google's verification page gives you, not a full tag.
  googleSiteVerification: text("google_site_verification"),
  // "@handle" for the twitter:site card meta — threaded into every page's
  // Twitter card via buildMetadata(), not just the homepage's, since a
  // post/page's own buildMetadata() call fully replaces the root layout's
  // `twitter` object rather than merging with it.
  twitterHandle: text("twitter_handle"),
  // Homepage-only canonical override — left blank, the homepage canonicalizes
  // to SITE_URL itself (see app/layout.tsx). Every other page/post/category
  // already has its own canonicalUrl field in seo_meta (Module 1).
  canonicalUrl: text("canonical_url"),
  // Bumped by clearSiteCache() alongside a sitewide revalidatePath() — the
  // number itself isn't consumed anywhere yet, it's just a visible proof a
  // clear actually happened (and a future cache-busting key once a CDN
  // layer is in front of this).
  cacheVersion: integer("cache_version").notNull().default(1),
  cacheClearedAt: timestamp("cache_cleared_at"),
  // Enforced in proxy.ts — everyone hits a 503 maintenance response on the
  // public site while this is on, admins included; only /admin itself
  // stays reachable (gated separately) so it can be turned back off. See
  // lib/maintenance-cache.ts for the TTL cache proxy.ts actually reads
  // (same pattern as lib/redirects/cache.ts).
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  maintenanceMessage: text("maintenance_message"),
  aiWidgetEnabled: boolean("ai_widget_enabled").notNull().default(true),
  aiWidgetWelcomeMessage: text("ai_widget_welcome_message"),
  // Powers the Ask-AI widget's OpenAI calls (lib/ai/client.ts) — takes
  // priority over the OPENAI_API_KEY env var when set, so a key can be
  // rotated from the admin without a redeploy. Never sent to any client
  // component: pages read this row server-side and must only pass a
  // masked preview (last 4 chars) + a configured boolean down to the UI,
  // the same way a password field never round-trips its real value.
  openaiApiKey: text("openai_api_key"),
  // Raw HTML/script content (e.g. GA4's gtag.js snippet), rendered verbatim
  // near the top of <body> on every public page — see
  // components/site/custom-scripts.tsx. Deliberately unsanitized: the whole
  // point is executing whatever's pasted here, so this is admin-gated the
  // same as every other site-wide setting, not treated as untrusted input.
  headScripts: text("head_scripts"),
  // Same as headScripts but rendered at the very end of <body> instead of
  // the top — for anything meant to load after page content (deferred
  // widgets, chat scripts, a GTM noscript fallback, etc.).
  footerScripts: text("footer_scripts"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
