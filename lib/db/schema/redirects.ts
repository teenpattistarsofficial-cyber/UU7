import { pgTable, text, integer, uuid, timestamp } from "drizzle-orm/pg-core";

// Module 6 — enforced in proxy.ts against an in-memory cache (lib/redirects/cache.ts),
// not a per-request DB hit.
export const redirects = pgTable("redirects", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  // 308/307 preserve the request method (the modern equivalents of 301/302);
  // kept as a plain integer rather than an enum so any valid redirect code
  // can be entered without a migration.
  statusCode: integer("status_code").notNull().default(308),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
