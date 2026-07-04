import { pgTable, text, integer, uuid, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { posts } from "./content";

// AEO — 40-60 word, snippet-targeted direct answer. One per post, same
// shape as post_ai_summary but distinct purpose (search snippet capture
// vs. a denser GEO/AI-extraction callout).
export const postQuickAnswer = pgTable("post_quick_answer", {
  postId: uuid("post_id")
    .primaryKey()
    .references(() => posts.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
});

// Ordered call-to-action blocks (e.g. "Claim Bonus" linking out to the
// commercial site) — a post can have more than one.
export const postCtas = pgTable("post_ctas", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  heading: text("heading").notNull(),
  description: text("description"),
  buttonText: text("button_text").notNull(),
  buttonUrl: text("button_url").notNull(),
  position: integer("position").notNull().default(0),
});

// GEO — real semantic <table> data (not a screenshot). `columns` is an
// ordered array of header strings; `rows` is an array of same-length
// string arrays. A post can have more than one (e.g. "RTP by Game" and
// "Deposit Limits" as separate tables).
export const postStatsTables = pgTable("post_stats_tables", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  columns: jsonb("columns").notNull().$type<string[]>(),
  rows: jsonb("rows").notNull().$type<string[][]>(),
  position: integer("position").notNull().default(0),
});

// Module 11 (FAQ Builder) — ordered Q&A pairs, feeds both the public
// FaqSection and the FAQPage JSON-LD block.
export const postFaqs = pgTable("post_faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  position: integer("position").notNull().default(0),
});

// Module 12 (AI Summary Block) — one dense, factual summary per post plus
// an ordered list of key takeaways, rendered as a distinct GEO-targeted
// callout with stable `data-ai-extract` DOM hooks.
export const postAiSummary = pgTable("post_ai_summary", {
  postId: uuid("post_id")
    .primaryKey()
    .references(() => posts.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
});

export const postKeyTakeaways = pgTable("post_key_takeaways", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  position: integer("position").notNull().default(0),
});

// Module 8 (Internal Linking Assistant / Related Posts) — manual pins only;
// when a post has none, the related-posts section falls back to the live
// scoring heuristic in lib/seo/related.ts instead of reading from here.
export const postRelated = pgTable(
  "post_related",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    relatedPostId: uuid("related_post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.postId, t.relatedPostId] })],
);
