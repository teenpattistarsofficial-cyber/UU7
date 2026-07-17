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
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractText } from "@/lib/editor/text";
import { slugify } from "@/lib/seo/slugify";
import { getSeoChecklist } from "@/lib/seo/score";

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

type PublishBody = {
  title: string;
  slug?: string;
  categorySlug: string;
  authorSlug: string;
  content: JSONContent;
  featuredImageUrl?: string | null;
  focusKeyword: string;
  seoTitle: string;
  metaDescription: string;
  quickAnswer?: string;
  aiSummary?: string;
  keyTakeaways?: string[];
  faqs?: { question: string; answer: string }[];
  cta?: { heading: string; description?: string; buttonText: string; buttonUrl: string };
  mode?: "create" | "replace";
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const expectedToken = process.env.PUBLISH_API_TOKEN;
  if (!expectedToken) {
    return NextResponse.json({ error: "PUBLISH_API_TOKEN not configured on server" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  const providedToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!providedToken || providedToken !== expectedToken) {
    return unauthorized();
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
    await db.delete(posts).where(eq(posts.id, existing.id));
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
      featuredImageUrl: body.featuredImageUrl ?? null,
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
    await db.insert(postCtas).values({
      postId: post.id,
      heading: body.cta.heading,
      description: body.cta.description ?? null,
      buttonText: body.cta.buttonText,
      buttonUrl: body.cta.buttonUrl,
      position: 0,
    });
  }

  const checklist = getSeoChecklist({
    title,
    slug,
    content,
    seo: { seoTitle, metaDescription, focusKeyword },
    featuredImageUrl: body.featuredImageUrl ?? null,
  });
  const passed = checklist.filter((c) => c.passed).length;

  return NextResponse.json({
    id: post.id,
    slug,
    url: `/${categorySlug}/${slug}`,
    wordCount,
    created: !existing,
    replaced: Boolean(existing && mode === "replace"),
    seoChecklist: { passed, total: checklist.length, failures: checklist.filter((c) => !c.passed).map((c) => c.label) },
  });
}
