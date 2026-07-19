import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, tags, postTags } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { verifyPublishToken } from "@/lib/publish/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { scoreKeywordOverlap } from "@/lib/seo/cannibalization";

export const runtime = "nodejs";

// Read-only counterpart to app/api/publish/route.ts, same bearer-token auth
// — gives a machine client enough live-site context to judge keyword
// cannibalization and pick the right category/author slug before drafting,
// instead of publishing blind. No code anywhere else in the repo compares
// focusKeyword across posts; this is that check's only existing precedent
// (docs/seo-content-strategy-plan.md documents the risk editorially, but
// enforces nothing at runtime).
export async function GET(request: NextRequest) {
  if (!process.env.PUBLISH_API_TOKEN) {
    return NextResponse.json({ error: "PUBLISH_API_TOKEN not configured on server" }, { status: 500 });
  }
  if (!verifyPublishToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit("publish-api")) {
    return NextResponse.json({ error: "Rate limit exceeded, try again shortly" }, { status: 429 });
  }

  const keyword = request.nextUrl.searchParams.get("keyword")?.trim() || null;

  const [postRows, authorRows, categoryRows, tagRows] = await Promise.all([
    db
      .select({
        postId: posts.id,
        slug: posts.slug,
        title: posts.title,
        status: posts.status,
        publishedAt: posts.publishedAt,
        categorySlug: categories.slug,
        focusKeyword: seoMeta.focusKeyword,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(seoMeta, and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, posts.id)))
      .where(isNull(posts.deletedAt)),
    db.query.authors.findMany({ where: isNull(authors.deletedAt) }),
    db.query.categories.findMany({ where: isNull(categories.deletedAt) }),
    db
      .select({ postId: postTags.postId, name: tags.name })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id)),
  ]);

  const tagsByPostId = new Map<string, string[]>();
  for (const row of tagRows) {
    const list = tagsByPostId.get(row.postId) ?? [];
    list.push(row.name);
    tagsByPostId.set(row.postId, list);
  }

  const postSummaries = postRows.map((p) => ({
    slug: p.slug,
    title: p.title,
    categorySlug: p.categorySlug,
    focusKeyword: p.focusKeyword,
    tags: tagsByPostId.get(p.postId) ?? [],
    status: p.status,
    publishedAt: p.publishedAt,
  }));

  const response: {
    posts: typeof postSummaries;
    authors: { slug: string; displayName: string }[];
    categories: { slug: string; label: string }[];
    keywordOverlap?: ReturnType<typeof scoreKeywordOverlap>;
  } = {
    posts: postSummaries,
    authors: authorRows.map((a) => ({ slug: a.slug, displayName: a.displayName })),
    categories: categoryRows.map((c) => ({ slug: c.slug, label: c.name })),
  };

  if (keyword) {
    response.keywordOverlap = scoreKeywordOverlap(
      keyword,
      postSummaries.map((p) => ({ slug: p.slug, title: p.title, focusKeyword: p.focusKeyword })),
    );
  }

  return NextResponse.json(response);
}
