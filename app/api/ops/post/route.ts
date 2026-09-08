import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { verifyPublishToken } from "@/lib/publish/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!verifyPublishToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing ?slug= parameter" }, { status: 400 });
  }

  const post = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), isNull(posts.deletedAt)),
  });
  if (!post) {
    return NextResponse.json({ error: `No post found with slug: ${slug}` }, { status: 404 });
  }

  const [category, author, seo, quickAnswer, aiSummary, keyTakeaways, faqs, ctas, statsTables] =
    await Promise.all([
      post.categoryId
        ? db.query.categories.findFirst({ where: eq(categories.id, post.categoryId) })
        : null,
      post.authorId
        ? db.query.authors.findFirst({ where: eq(authors.id, post.authorId) })
        : null,
      db.query.seoMeta.findFirst({
        where: and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, post.id)),
      }),
      db.query.postQuickAnswer.findFirst({ where: eq(postQuickAnswer.postId, post.id) }),
      db.query.postAiSummary.findFirst({ where: eq(postAiSummary.postId, post.id) }),
      db.query.postKeyTakeaways.findMany({ where: eq(postKeyTakeaways.postId, post.id) }),
      db.query.postFaqs.findMany({ where: eq(postFaqs.postId, post.id) }),
      db.query.postCtas.findMany({ where: eq(postCtas.postId, post.id) }),
      db.query.postStatsTables.findMany({ where: eq(postStatsTables.postId, post.id) }),
    ]);

  return NextResponse.json({
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      excerpt: post.excerpt,
      content: post.content,
      featuredImageUrl: post.featuredImageUrl,
      readingTimeMinutes: post.readingTimeMinutes,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    },
    categorySlug: category?.slug ?? null,
    authorSlug: author?.slug ?? null,
    seo: seo ?? null,
    quickAnswer: quickAnswer?.text ?? null,
    aiSummary: aiSummary?.summary ?? null,
    keyTakeaways: keyTakeaways.map((k) => k.text),
    faqs: faqs.map((f) => ({ question: f.question, answer: f.answer })),
    ctas: ctas.map((c) => ({
      heading: c.heading,
      description: c.description,
      buttonText: c.buttonText,
      buttonUrl: c.buttonUrl,
    })),
    statsTables: statsTables.map((t) => ({
      title: t.title,
      columns: t.columns,
      rows: t.rows,
    })),
  });
}
