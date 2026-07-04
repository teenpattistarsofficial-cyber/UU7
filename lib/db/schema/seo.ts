import { pgTable, text, boolean, uuid, pgEnum, unique } from "drizzle-orm/pg-core";

export const seoEntityTypeEnum = pgEnum("seo_entity_type", ["post", "page", "category"]);

// Polymorphic — one row per content entity, shared across posts/pages/
// categories instead of duplicating ~10 SEO columns on each table
// (Module 1: SEO fields, Module 4: Technical SEO settings).
export const seoMeta = pgTable(
  "seo_meta",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: seoEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    seoTitle: text("seo_title"),
    metaDescription: text("meta_description"),
    focusKeyword: text("focus_keyword"),
    canonicalUrl: text("canonical_url"),
    robotsIndex: boolean("robots_index").notNull().default(true),
    robotsFollow: boolean("robots_follow").notNull().default(true),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogImageUrl: text("og_image_url"),
  },
  (t) => [unique().on(t.entityType, t.entityId)],
);
