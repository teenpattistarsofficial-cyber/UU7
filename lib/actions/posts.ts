"use server";

import { eq, and, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { JSONContent } from "@tiptap/core";
import { db } from "@/lib/db";
import {
  posts,
  postStatusEnum,
  seoMeta,
  tags,
  postTags,
  postFaqs,
  postAiSummary,
  postKeyTakeaways,
  postRelated,
  postQuickAnswer,
  postCtas,
  postStatsTables,
  media,
  categories,
} from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";
import { estimateReadingTimeMinutes } from "@/lib/seo/reading-time";
import { hasNoH1InBody, hasProperHeadingHierarchy } from "@/lib/seo/score";
import { extractText } from "@/lib/editor/text";
import { toTiptapDoc } from "@/lib/editor/doc";
import { invalidatePublicPaths } from "@/lib/cache/invalidate-public-paths";

// Module 7/9 hard gate — these two checks (plus missing alt text on an
// uploaded featured image) block publishing outright rather than just
// showing up as failing items in the SEO analysis checklist. Everything
// else in that checklist (word count, meta description length, etc.) stays
// advisory — these three are structural/accessibility problems worth
// actually stopping a publish over.
async function getPublishBlockers(content: JSONContent, featuredImageUrl: string | null): Promise<string[]> {
  const blockers: string[] = [];
  if (!hasNoH1InBody(content)) blockers.push("Body content contains an H1 — only the post title should be H1");
  if (!hasProperHeadingHierarchy(content)) blockers.push("Headings skip a level (e.g. H2 straight to H4)");

  if (featuredImageUrl) {
    const mediaRow = await db.query.media.findFirst({ where: eq(media.url, featuredImageUrl) });
    if (mediaRow && !mediaRow.alt.trim()) {
      blockers.push("Featured image is missing alt text — add it in Media Library");
    }
  }

  return blockers;
}

async function getCategorySlug(categoryId: string | null): Promise<string | null> {
  if (!categoryId) return null;
  const category = await db.query.categories.findFirst({ where: eq(categories.id, categoryId) });
  return category?.slug ?? null;
}

// The public site reads posts straight from the DB with no fetch/tag-based
// caching in play — Next's Full Route Cache is still eligible to freeze
// these pages, so a publish/edit/delete needs to explicitly invalidate
// every public path that could show stale content, not just the /admin
// list. (Each page also carries its own `export const revalidate` ceiling
// as a defense-in-depth fallback in case a path is ever missed here.)
function revalidatePublicPostPaths(categorySlug: string | null, slug: string) {
  const paths = ["/", "/sitemap.xml"];
  if (categorySlug) paths.push(`/${categorySlug}`, `/${categorySlug}/${slug}`);
  invalidatePublicPaths(paths);
}

function parsePostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const contentRaw = String(formData.get("content") ?? "");
  const content = contentRaw ? JSON.parse(contentRaw) : toTiptapDoc(null);
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft") as (typeof postStatusEnum.enumValues)[number];
  const authorId = String(formData.get("authorId") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;
  const featuredImageUrl = String(formData.get("featuredImageUrl") ?? "").trim() || null;

  // Author-editable, e.g. to correct for skimmable lists/images the
  // word-count estimate can't account for — but blank means "just use the
  // estimate", so it's never left null.
  const readingTimeInput = Number(formData.get("readingTimeMinutes"));
  const readingTimeMinutes =
    Number.isFinite(readingTimeInput) && readingTimeInput > 0
      ? Math.round(readingTimeInput)
      : estimateReadingTimeMinutes(extractText(content));

  if (!title) throw new Error("Title is required");

  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    content,
    excerpt,
    status,
    authorId,
    categoryId,
    featuredImageUrl,
    readingTimeMinutes,
  };
}

function parseSeoForm(formData: FormData) {
  return {
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
    focusKeyword: String(formData.get("focusKeyword") ?? "").trim() || null,
    canonicalUrl: String(formData.get("canonicalUrl") ?? "").trim() || null,
    robotsIndex: formData.get("robotsIndex") === "true",
    robotsFollow: formData.get("robotsFollow") === "true",
    ogTitle: String(formData.get("ogTitle") ?? "").trim() || null,
    ogDescription: String(formData.get("ogDescription") ?? "").trim() || null,
    ogImageUrl: String(formData.get("ogImageUrl") ?? "").trim() || null,
  };
}

async function upsertSeoMeta(entityId: string, formData: FormData) {
  const values = parseSeoForm(formData);
  await db
    .insert(seoMeta)
    .values({ entityType: "post", entityId, ...values })
    .onConflictDoUpdate({
      target: [seoMeta.entityType, seoMeta.entityId],
      set: values,
    });
}

// Full-replace strategy: simplest correct approach at the tag volumes a
// single post has (a handful), avoids diffing join-table rows by hand.
async function syncPostTags(postId: string, formData: FormData) {
  const raw = String(formData.get("tags") ?? "[]");
  const names = [...new Set((JSON.parse(raw) as string[]).map((t) => t.trim()).filter(Boolean))];

  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (names.length === 0) return;

  const tagIds: string[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const existing = await db.query.tags.findFirst({ where: eq(tags.slug, slug) });
    if (existing) {
      tagIds.push(existing.id);
    } else {
      const [created] = await db.insert(tags).values({ name, slug }).returning({ id: tags.id });
      tagIds.push(created.id);
    }
  }
  await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
}

// Full-replace strategy, same as syncPostTags — FAQs are a handful of
// rows per post, not worth diffing by hand.
async function syncPostFaqs(postId: string, formData: FormData) {
  const raw = String(formData.get("faqs") ?? "[]");
  const items = (JSON.parse(raw) as { question: string; answer: string }[])
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
    .filter((f) => f.question && f.answer);

  await db.delete(postFaqs).where(eq(postFaqs.postId, postId));
  if (items.length === 0) return;
  await db.insert(postFaqs).values(items.map((f, position) => ({ postId, ...f, position })));
}

async function syncPostAiSummary(postId: string, formData: FormData) {
  const summary = String(formData.get("aiSummary") ?? "").trim();
  const takeaways = (JSON.parse(String(formData.get("keyTakeaways") ?? "[]")) as string[])
    .map((t) => t.trim())
    .filter(Boolean);

  await db.delete(postAiSummary).where(eq(postAiSummary.postId, postId));
  if (summary) {
    await db.insert(postAiSummary).values({ postId, summary });
  }

  await db.delete(postKeyTakeaways).where(eq(postKeyTakeaways.postId, postId));
  if (takeaways.length > 0) {
    await db.insert(postKeyTakeaways).values(takeaways.map((text, position) => ({ postId, text, position })));
  }
}

async function syncPostRelated(postId: string, formData: FormData) {
  const raw = String(formData.get("relatedPostIds") ?? "[]");
  const ids = [...new Set((JSON.parse(raw) as string[]).filter((relatedId) => relatedId && relatedId !== postId))];

  await db.delete(postRelated).where(eq(postRelated.postId, postId));
  if (ids.length === 0) return;
  await db.insert(postRelated).values(ids.map((relatedPostId, position) => ({ postId, relatedPostId, position })));
}

async function syncPostQuickAnswer(postId: string, formData: FormData) {
  const text = String(formData.get("quickAnswer") ?? "").trim();
  await db.delete(postQuickAnswer).where(eq(postQuickAnswer.postId, postId));
  if (text) {
    await db.insert(postQuickAnswer).values({ postId, text });
  }
}

async function syncPostCtas(postId: string, formData: FormData) {
  const raw = String(formData.get("ctas") ?? "[]");
  const items = (JSON.parse(raw) as { heading: string; description: string; buttonText: string; buttonUrl: string }[])
    .map((c) => ({
      heading: c.heading.trim(),
      description: c.description.trim() || null,
      buttonText: c.buttonText.trim(),
      buttonUrl: c.buttonUrl.trim(),
    }))
    .filter((c) => c.heading && c.buttonText && c.buttonUrl);

  await db.delete(postCtas).where(eq(postCtas.postId, postId));
  if (items.length === 0) return;
  await db.insert(postCtas).values(items.map((c, position) => ({ postId, ...c, position })));
}

async function syncPostStatsTables(postId: string, formData: FormData) {
  const raw = String(formData.get("statsTables") ?? "[]");
  const items = (JSON.parse(raw) as { title: string; columns: string[]; rows: string[][] }[])
    .map((t) => ({ title: t.title.trim(), columns: t.columns, rows: t.rows }))
    .filter((t) => t.title && t.columns.length > 0);

  await db.delete(postStatsTables).where(eq(postStatsTables.postId, postId));
  if (items.length === 0) return;
  await db.insert(postStatsTables).values(items.map((t, position) => ({ postId, ...t, position })));
}

export async function createPost(formData: FormData) {
  await requireRole("editor");
  const values = parsePostForm(formData);

  if (values.status === "published") {
    const blockers = await getPublishBlockers(values.content, values.featuredImageUrl);
    if (blockers.length > 0) throw new Error(`Cannot publish: ${blockers.join("; ")}`);
  }

  const [{ id }] = await db
    .insert(posts)
    .values({ ...values, publishedAt: values.status === "published" ? new Date() : null })
    .returning({ id: posts.id });

  await upsertSeoMeta(id, formData);
  await syncPostTags(id, formData);
  await syncPostFaqs(id, formData);
  await syncPostAiSummary(id, formData);
  await syncPostRelated(id, formData);
  await syncPostQuickAnswer(id, formData);
  await syncPostCtas(id, formData);
  await syncPostStatsTables(id, formData);

  revalidatePath("/admin/posts");
  revalidatePublicPostPaths(await getCategorySlug(values.categoryId), values.slug);
  redirect("/admin/posts");
}

export async function updatePost(id: string, formData: FormData) {
  await requireRole("editor");
  const values = parsePostForm(formData);

  if (values.status === "published") {
    const blockers = await getPublishBlockers(values.content, values.featuredImageUrl);
    if (blockers.length > 0) throw new Error(`Cannot publish: ${blockers.join("; ")}`);
  }

  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  const publishedAt =
    values.status === "published" ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null;

  await db
    .update(posts)
    .set({ ...values, publishedAt, updatedAt: new Date() })
    .where(eq(posts.id, id));

  await upsertSeoMeta(id, formData);
  await syncPostTags(id, formData);
  await syncPostFaqs(id, formData);
  await syncPostAiSummary(id, formData);
  await syncPostRelated(id, formData);
  await syncPostQuickAnswer(id, formData);
  await syncPostCtas(id, formData);
  await syncPostStatsTables(id, formData);

  revalidatePath("/admin/posts");
  revalidatePublicPostPaths(await getCategorySlug(values.categoryId), values.slug);
  // Slug/category changed — the old public URL is now orphaned but may
  // still be sitting in the route cache serving stale "still exists" HTML.
  if (existing && (existing.slug !== values.slug || existing.categoryId !== values.categoryId)) {
    revalidatePublicPostPaths(await getCategorySlug(existing.categoryId), existing.slug);
  }
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireRole("editor");
  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  await db.delete(posts).where(eq(posts.id, id));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, id)));
  revalidatePath("/admin/posts");
  if (existing) revalidatePublicPostPaths(await getCategorySlug(existing.categoryId), existing.slug);
}

export async function bulkDeletePosts(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const targets = await db.query.posts.findMany({ where: inArray(posts.id, ids) });
  await db.delete(posts).where(inArray(posts.id, ids));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "post"), inArray(seoMeta.entityId, ids)));
  revalidatePath("/admin/posts");
  for (const post of targets) {
    revalidatePublicPostPaths(await getCategorySlug(post.categoryId), post.slug);
  }
}

export async function bulkSetPostStatus(
  ids: string[],
  status: (typeof postStatusEnum.enumValues)[number],
) {
  await requireRole("editor");
  if (ids.length === 0) return;

  const targets = await db.query.posts.findMany({ where: inArray(posts.id, ids) });
  if (status === "published") {
    for (const post of targets) {
      const blockers = await getPublishBlockers(toTiptapDoc(post.content), post.featuredImageUrl);
      if (blockers.length > 0) {
        throw new Error(`Cannot publish "${post.title}": ${blockers.join("; ")}`);
      }
    }
  }

  await db
    .update(posts)
    .set({ status, updatedAt: new Date(), ...(status === "published" ? { publishedAt: new Date() } : {}) })
    .where(inArray(posts.id, ids));
  revalidatePath("/admin/posts");
  for (const post of targets) {
    revalidatePublicPostPaths(await getCategorySlug(post.categoryId), post.slug);
  }
}
