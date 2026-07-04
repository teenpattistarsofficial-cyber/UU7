"use server";

import { eq, and, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { posts, postStatusEnum, seoMeta, tags, postTags } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";
import { estimateReadingTimeMinutes } from "@/lib/seo/reading-time";
import { extractText } from "@/lib/editor/text";
import { toTiptapDoc } from "@/lib/editor/doc";

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
    readingTimeMinutes: estimateReadingTimeMinutes(extractText(content)),
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

export async function createPost(formData: FormData) {
  await requireRole("editor");
  const values = parsePostForm(formData);
  const [{ id }] = await db
    .insert(posts)
    .values({ ...values, publishedAt: values.status === "published" ? new Date() : null })
    .returning({ id: posts.id });

  await upsertSeoMeta(id, formData);
  await syncPostTags(id, formData);

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(id: string, formData: FormData) {
  await requireRole("editor");
  const values = parsePostForm(formData);

  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  const publishedAt =
    values.status === "published" ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null;

  await db
    .update(posts)
    .set({ ...values, publishedAt, updatedAt: new Date() })
    .where(eq(posts.id, id));

  await upsertSeoMeta(id, formData);
  await syncPostTags(id, formData);

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireRole("editor");
  await db.delete(posts).where(eq(posts.id, id));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, id)));
  revalidatePath("/admin/posts");
}

export async function bulkDeletePosts(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  await db.delete(posts).where(inArray(posts.id, ids));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "post"), inArray(seoMeta.entityId, ids)));
  revalidatePath("/admin/posts");
}

export async function bulkSetPostStatus(
  ids: string[],
  status: (typeof postStatusEnum.enumValues)[number],
) {
  await requireRole("editor");
  if (ids.length === 0) return;
  await db
    .update(posts)
    .set({ status, updatedAt: new Date(), ...(status === "published" ? { publishedAt: new Date() } : {}) })
    .where(inArray(posts.id, ids));
  revalidatePath("/admin/posts");
}
