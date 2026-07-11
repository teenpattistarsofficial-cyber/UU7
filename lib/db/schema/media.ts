import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

// Uploaded images (Module 9). Files are processed through sharp (auto-orient,
// strip EXIF, convert to WebP) and stored on disk under uploads/, served via
// app/uploads/[filename]/route.ts — this row is the metadata + the URL
// pointer to that file.
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  size: integer("size").notNull(),
  alt: text("alt").notNull().default(""),
  caption: text("caption"),
  title: text("title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
