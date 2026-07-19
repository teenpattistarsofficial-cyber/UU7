import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JSONContent } from "@tiptap/core";
import { db } from "@/lib/db";
import {
  posts,
  categories,
  authors,
  seoMeta,
  postQuickAnswer,
  postAiSummary,
  postKeyTakeaways,
  postFaqs,
  postCtas,
  postStatsTables,
  media,
  auditLog,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractText } from "@/lib/editor/text";
import { slugify } from "@/lib/seo/slugify";
import { getSeoChecklist } from "@/lib/seo/score";
import { verifyPublishToken } from "@/lib/publish/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { isSafeExternalUrl } from "@/lib/seo/safe-url";
import { processImageBuffer } from "@/lib/media/process-upload";
import { syncPostTagsByNames, syncPostCtasByItems } from "@/lib/actions/posts";

export const runtime = "nodejs";

// Deliberately NOT under /admin or /api/admin — those paths are gated by
// proxy.ts's session-cookie check (handleAdminAuth), which only a logged-in
// browser session can satisfy. This route is meant for a machine client
// (an agent posting content directly), so it authenticates itself via a
// bearer token instead, checked below against PUBLISH_API_TOKEN.
//
// Lets an agent publish/update a post directly against production without
// the local-script -> git commit -> SSH -> docker rebuild cycle every other
// content change in this codebase still goes through. Mirrors exactly what
// scripts/create-*.ts do by hand: category/author lookup by slug, insert
// post + seoMeta + optional AEO/GEO blocks + optional CTA, then reports the
// same SEO checklist the admin editor shows.

const MAX_COVER_IMAGE_BYTES = 15 * 1024 * 1024;
const COVER_IMAGE_FETCH_TIMEOUT_MS = 10_000;

type PublishBody = {
  title: string;
  slug?: string;
  categorySlug: string;
  authorSlug: string;
  content: JSONContent;
  featuredImageUrl?: string | null;
  coverImage?: { sourceUrl: string; alt: string; credit?: string };
  focusKeyword: string;
  seoTitle: string;
  metaDescription: string;
  quickAnswer?: string;
  aiSummary?: string;
  keyTakeaways?: string[];
  faqs?: { question: string; answer: string }[];
  cta?: { heading: string; description?: string; buttonText: string; buttonUrl: string };
  statsTables?: { title: string; columns: string[]; rows: string[][] }[];
  tags?: string[];
  mode?: "create" | "replace";
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Fetches an image server-side with a protocol allowlist (SSRF guard), a
// timeout, and a size cap enforced both via Content-Length (when the server
// reports one honestly) and the actual downloaded byte count (when it
// doesn't) — a coverImage.sourceUrl is caller-supplied, unlike the
// session-authenticated admin upload route's direct file input.
async function fetchCoverImageBuffer(url: string): Promise<Buffer> {
  if (!isSafeExternalUrl(url)) {
    throw new Error("coverImage.sourceUrl must be an http(s) URL");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COVER_IMAGE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Failed to fetch coverImage.sourceUrl: ${res.status}`);

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > MAX_COVER_IMAGE_BYTES) {
      throw new Error(`coverImage.sourceUrl is too large (max ${MAX_COVER_IMAGE_BYTES / 1024 / 1024}MB)`);
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_COVER_IMAGE_BYTES) {
      throw new Error(`coverImage.sourceUrl is too large (max ${MAX_COVER_IMAGE_BYTES / 1024 / 1024}MB)`);
    }
    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.PUBLISH_API_TOKEN) {
    return NextResponse.json({ error: "PUBLISH_API_TOKEN not configured on server" }, { status: 500 });
  }
  if (!verifyPublishToken(request)) {
    return unauthorized();
  }
  if (!checkRateLimit("publish-api")) {
    return NextResponse.json({ error: "Rate limit exceeded, try again shortly" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as PublishBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, categorySlug, authorSlug, content, focusKeyword, seoTitle, metaDescription } = body;
  if (!title || !categorySlug || !authorSlug || !content || !focusKeyword || !seoTitle || !metaDescription) {
    return NextResponse.json(
      { error: "Missing required field(s): title, categorySlug, authorSlug, content, focusKeyword, seoTitle, metaDescription" },
      { status: 400 },
    );
  }

  if (body.cta && !isSafeExternalUrl(body.cta.buttonUrl)) {
    return NextResponse.json({ error: "cta.buttonUrl must be an http(s) URL or a same-site path" }, { status: 400 });
  }
  if (body.coverImage && !body.coverImage.alt?.trim()) {
    return NextResponse.json({ error: "coverImage.alt is required" }, { status: 400 });
  }
  if (body.coverImage && !isSafeExternalUrl(body.coverImage.sourceUrl)) {
    return NextResponse.json({ error: "coverImage.sourceUrl must be an http(s) URL" }, { status: 400 });
  }

  const slug = body.slug ? slugify(body.slug) : slugify(title);
  const mode = body.mode === "replace" ? "replace" : "create";

  const category = await db.query.categories.findFirst({ where: eq(categories.slug, categorySlug) });
  if (!category) {
    return NextResponse.json({ error: `Category not found: ${categorySlug}` }, { status: 404 });
  }
  const author = await db.query.authors.findFirst({ where: eq(authors.slug, authorSlug) });
  if (!author) {
    return NextResponse.json({ error: `Author not found: ${authorSlug}` }, { status: 404 });
  }

  const existing = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (existing && mode === "create") {
    return NextResponse.json(
      { error: "Post already exists", id: existing.id, slug, mode: "create" },
      { status: 409 },
    );
  }
  if (existing && mode === "replace") {
    // Same teardown scripts/delete-post.ts performs by hand — dependent
    // rows first (no ON DELETE CASCADE on seoMeta since it's polymorphic
    // across entity types, so it needs an explicit delete).
    await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, existing.id)));
    await db.delete(postQuickAnswer).where(eq(postQuickAnswer.postId, existing.id));
    await db.delete(postAiSummary).where(eq(postAiSummary.postId, existing.id));
    await db.delete(postKeyTakeaways).where(eq(postKeyTakeaways.postId, existing.id));
    await db.delete(postFaqs).where(eq(postFaqs.postId, existing.id));
    await db.delete(postCtas).where(eq(postCtas.postId, existing.id));
    await db.delete(postStatsTables).where(eq(postStatsTables.postId, existing.id));
    await db.delete(posts).where(eq(posts.id, existing.id));
  }

  // Cover image: resolves to a permanent, self-hosted, alt-tagged media row
  // via the same sharp/WebP pipeline the admin upload route uses, instead of
  // the plain external-URL passthrough featuredImageUrl always was. Done
  // before inserting the post row since that row needs the final URL.
  let featuredImageUrl = body.featuredImageUrl ?? null;
  let coverMedia: { id: string; url: string; width: number; height: number } | null = null;
  if (body.coverImage) {
    let buffer: Buffer;
    try {
      buffer = await fetchCoverImageBuffer(body.coverImage.sourceUrl);
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch coverImage" }, { status: 400 });
    }
    const processed = await processImageBuffer(buffer);
    const [mediaRow] = await db
      .insert(media)
      .values({
        url: processed.url,
        filename: processed.filename,
        mimeType: processed.mimeType,
        width: processed.width,
        height: processed.height,
        size: processed.size,
        alt: body.coverImage.alt.trim(),
        caption: body.coverImage.credit?.trim() || null,
      })
      .returning({ id: media.id, url: media.url, width: media.width, height: media.height });
    coverMedia = mediaRow;
    featuredImageUrl = mediaRow.url;
  }

  const text = extractText(content);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const [post] = await db
    .insert(posts)
    .values({
      title,
      slug,
      content,
      status: "published",
      categoryId: category.id,
      authorId: author.id,
      featuredImageUrl,
      excerpt: metaDescription,
      readingTimeMinutes: Math.ceil(wordCount / 200),
      publishedAt: new Date(),
    })
    .returning({ id: posts.id });

  await db.insert(seoMeta).values({
    entityType: "post",
    entityId: post.id,
    seoTitle,
    metaDescription,
    focusKeyword,
    robotsIndex: true,
    robotsFollow: true,
  });

  if (body.quickAnswer) {
    await db.insert(postQuickAnswer).values({ postId: post.id, text: body.quickAnswer });
  }
  if (body.aiSummary) {
    await db.insert(postAiSummary).values({ postId: post.id, summary: body.aiSummary });
  }
  if (body.keyTakeaways?.length) {
    await db.insert(postKeyTakeaways).values(
      body.keyTakeaways.map((text, position) => ({ postId: post.id, text, position })),
    );
  }
  if (body.faqs?.length) {
    await db.insert(postFaqs).values(
      body.faqs.map((f, position) => ({ postId: post.id, question: f.question, answer: f.answer, position })),
    );
  }
  if (body.cta) {
    await syncPostCtasByItems(post.id, [body.cta]);
  }
  if (body.statsTables?.length) {
    await db.insert(postStatsTables).values(
      body.statsTables.map((t, position) => ({ postId: post.id, title: t.title, columns: t.columns, rows: t.rows, position })),
    );
  }
  if (body.tags?.length) {
    await syncPostTagsByNames(post.id, body.tags);
  }

  await db.insert(auditLog).values({
    userId: null,
    userName: "publish-api",
    action: mode === "replace" ? "publish.replace" : "publish.create",
    entityType: "post",
    entityId: post.id,
    entityLabel: title,
  });

  const checklist = getSeoChecklist({
    title,
    slug,
    content,
    seo: { seoTitle, metaDescription, focusKeyword },
    featuredImageUrl,
  });
  const passed = checklist.filter((c) => c.passed).length;

  return NextResponse.json({
    id: post.id,
    slug,
    url: `/${categorySlug}/${slug}`,
    wordCount,
    created: !existing,
    replaced: Boolean(existing && mode === "replace"),
    media: coverMedia,
    seoChecklist: { passed, total: checklist.length, failures: checklist.filter((c) => !c.passed).map((c) => c.label) },
  });
}
