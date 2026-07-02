import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  pgEnum,
  primaryKey,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "published",
  "scheduled",
  "archived",
]);

export const pageTemplateEnum = pgEnum("page_template", [
  "default",
  "about",
  "contact",
  "legal",
]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// authors are content-facing bylines (Module 13), distinct from admin `user`
// accounts — a persona can be authored content without ever logging in.
export const authors = pgTable("authors", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio"),
  // Plain URL for now — becomes a `media` FK once the Media SEO pipeline
  // (Phase 3) exists.
  avatarUrl: text("avatar_url"),
  roleTitle: text("role_title"),
  expertiseTags: text("expertise_tags").array(),
  socialLinks: jsonb("social_links").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  // Tiptap JSON document. Editor integration lands in Phase 2; the column
  // exists now so the shape is stable from the first migration onward.
  content: jsonb("content"),
  status: postStatusEnum("status").notNull().default("draft"),
  template: pageTemplateEnum("template").notNull().default("default"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: jsonb("content"),
  excerpt: text("excerpt"),
  status: postStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  authorId: uuid("author_id").references(() => authors.id, {
    onDelete: "set null",
  }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  // Plain URL for now — becomes a `media` FK in Phase 3.
  featuredImageUrl: text("featured_image_url"),
  readingTimeMinutes: integer("reading_time_minutes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })],
);
