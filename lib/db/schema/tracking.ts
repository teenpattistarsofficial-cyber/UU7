import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// First-party page-view log — deliberately separate from analyticsSnapshots
// (lib/db/schema/analytics.ts), which is GA4/Search Console data pulled by
// a nightly job. This is written directly, request by request, from
// proxy.ts, so the Dashboard's "today" numbers don't wait on a sync job.
// `visitorId` comes from an anonymous, non-identifying cookie (see
// proxy.ts) — no login/account is involved on the public site.
export const pageViews = pgTable("page_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  path: text("path").notNull(),
  visitorId: text("visitor_id").notNull(),
  ip: text("ip"),
  device: text("device").notNull().default("desktop"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One row per click on a CtaBlock (components/article/cta-block.tsx) or the
// homepage SiteCta. `ctaId` is the post_ctas row id where one exists, or a
// fixed slug (e.g. "homepage") for the static homepage CTA — not a foreign
// key, since a clicked CTA may since have been edited/deleted and the click
// should still count historically. `ctaLabel` is denormalized for the same
// reason: the label must still be displayable after the source CTA is gone.
export const ctaClicks = pgTable("cta_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  ctaId: text("cta_id").notNull(),
  ctaLabel: text("cta_label"),
  path: text("path").notNull(),
  visitorId: text("visitor_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin activity feed — logged, not derived, so it stays true even after
// the entity it refers to is later deleted (hence `userName`/`entityLabel`
// denormalized rather than joined live). Only covers what's wired in
// explicitly (see lib/actions/audit-log.ts) — login and the highest-signal
// content actions (create/delete) — not a blanket log of every mutation.
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  entityLabel: text("entity_label"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
