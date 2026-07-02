"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { posts, postStatusEnum } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";
import { estimateReadingTimeMinutes } from "@/lib/seo/reading-time";

// `content` is a plain string for now — it becomes a Tiptap JSON document
// once the editor lands in Phase 2. The jsonb column accepts either shape.
function parsePostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "");
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
    readingTimeMinutes: estimateReadingTimeMinutes(content),
  };
}

export async function createPost(formData: FormData) {
  await requireRole("editor");
  const values = parsePostForm(formData);
  await db.insert(posts).values({
    ...values,
    publishedAt: values.status === "published" ? new Date() : null,
  });
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

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireRole("editor");
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin/posts");
}
