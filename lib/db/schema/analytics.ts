import { pgTable, uuid, date, text, integer, real, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Module 14 — populated only by scripts/jobs/sync-analytics.ts (a nightly
// job against the GSC/GA4 service account), never written to from a
// request. The admin dashboard reads exclusively from these tables so it
// never calls Google live on page load.
export const analyticsSnapshots = pgTable(
  "analytics_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    sessions: integer("sessions").notNull().default(0),
    activeUsers: integer("active_users").notNull().default(0),
    screenPageViews: integer("screen_page_views").notNull().default(0),
    avgEngagementSeconds: integer("avg_engagement_seconds").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("analytics_snapshots_date_idx").on(table.date)],
);

export const searchQueriesSnapshot = pgTable("search_queries_snapshot", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  query: text("query").notNull(),
  page: text("page").notNull(),
  clicks: integer("clicks").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  ctr: real("ctr").notNull().default(0),
  position: real("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
