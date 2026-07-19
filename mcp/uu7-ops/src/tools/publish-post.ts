import { z } from "zod";
import { siteUrl, publishToken } from "../config.js";

// Mirrors PublishBody in app/api/publish/route.ts field-for-field. content
// is passed straight through as Tiptap JSONContent — no markdown/plain-text
// conversion layer — so build it directly as:
//   { type: "doc", content: [ ...blocks ] }
// Block shapes (matching scripts/create-*-guide.ts's hand-written helpers):
//   paragraph: { type: "paragraph", attrs: { textAlign: null }, content: [ { type: "text", text } ] }
//   heading (h2-h4 only — h1 is reserved for the post title):
//     { type: "heading", attrs: { level: 2, textAlign: null }, content: [ { type: "text", text } ] }
//   bold text run: { type: "text", text, marks: [{ type: "bold" }] }
//   link text run: { type: "text", text, marks: [{ type: "link", attrs: { href, rel: "noopener noreferrer", class: null, title: null, target: external ? "_blank" : null } }] }
//   bullet list: { type: "bulletList", content: [ { type: "listItem", content: [ { type: "paragraph", attrs: { textAlign: null }, content: [...] } ] }, ... ] }
//   image: { type: "image", attrs: { src, alt, title: null } }
const jsonContentSchema = z
  .record(z.string(), z.unknown())
  .describe("Tiptap JSONContent doc — see the top-level tool description for the exact block shapes to use.");

export const publishPostSchema = {
  title: z.string().describe("Post title (becomes the page's H1 — never repeat it as an H1 inside content)."),
  slug: z.string().optional().describe("URL slug; derived from title if omitted."),
  categorySlug: z
    .enum(["game-guides", "betting-guides", "bonuses", "app-tutorials", "statistics-reports"])
    .describe("Must be one of the site's five fixed categories."),
  authorSlug: z.string().describe("Byline author's slug — call list_existing_content first to see valid authors."),
  content: jsonContentSchema,
  focusKeyword: z.string().describe("The single target keyword this post is optimized for."),
  seoTitle: z.string().describe("30-60 chars, should contain focusKeyword."),
  metaDescription: z.string().describe("120-160 chars, also used as the post excerpt."),
  tags: z.array(z.string()).optional(),
  quickAnswer: z.string().optional().describe("Short direct-answer block shown above the article body."),
  aiSummary: z.string().optional(),
  keyTakeaways: z.array(z.string()).optional(),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  cta: z
    .object({
      heading: z.string(),
      description: z.string().optional(),
      buttonText: z.string(),
      buttonUrl: z.string().describe("Must be an http(s) URL or a same-site path starting with /."),
    })
    .optional(),
  statsTables: z
    .array(z.object({ title: z.string(), columns: z.array(z.string()), rows: z.array(z.array(z.string())) }))
    .optional(),
  coverImage: z
    .object({
      sourceUrl: z.string().describe("URL to download the image from, e.g. a Pexels src.large URL from find_cover_photo."),
      alt: z.string().describe("Required, non-empty descriptive alt text."),
      credit: z.string().optional().describe("e.g. \"Photo by Jane Doe on Pexels\" — stored as the media caption."),
    })
    .optional()
    .describe("The server downloads this, processes it (resize + WebP), and self-hosts it — preferred over featuredImageUrl."),
  featuredImageUrl: z
    .string()
    .optional()
    .describe("Only for reusing an existing/self-hosted URL directly; prefer coverImage for new photos."),
  mode: z.enum(["create", "replace"]).optional().describe("\"replace\" overwrites an existing post at the same slug."),
};

export async function publishPost(args: Record<string, unknown>) {
  const res = await fetch(new URL("/api/publish", siteUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publishToken()}`,
    },
    body: JSON.stringify(args),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`publish_post failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}
