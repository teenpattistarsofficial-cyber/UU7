"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pages, pageTemplateEnum, postStatusEnum } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";

// `content` is a plain string for now — it becomes a Tiptap JSON document
// once the editor lands in Phase 2. The jsonb column accepts either shape.
function parsePageForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const status = String(formData.get("status") ?? "draft") as (typeof postStatusEnum.enumValues)[number];
  const template = String(formData.get("template") ?? "default") as (typeof pageTemplateEnum.enumValues)[number];

  if (!title) throw new Error("Title is required");

  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    content,
    status,
    template,
  };
}

export async function createPage(formData: FormData) {
  await requireRole("editor");
  await db.insert(pages).values(parsePageForm(formData));
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function updatePage(id: string, formData: FormData) {
  await requireRole("editor");
  await db
    .update(pages)
    .set({ ...parsePageForm(formData), updatedAt: new Date() })
    .where(eq(pages.id, id));
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  await requireRole("editor");
  await db.delete(pages).where(eq(pages.id, id));
  revalidatePath("/admin/pages");
}
