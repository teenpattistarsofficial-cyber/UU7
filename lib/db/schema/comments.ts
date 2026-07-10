import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { posts } from "./content";

export const commentStatusEnum = pgEnum("comment_status", ["pending", "approved", "rejected"]);

// No threading (no parentId) — deliberately flat for v1, matching the
// scope of what's actually asked for; a reply feature can be layered on
// later without a schema migration being disruptive (just an added
// nullable self-reference column).
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  // Held for moderation by default — never shown publicly until an editor
  // approves it. Matches the "Pending Comments" terminology already used
  // on the admin dashboard before this feature existed.
  status: commentStatusEnum("status").notNull().default("pending"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
