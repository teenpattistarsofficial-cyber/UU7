"use server";

import { eq, and, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pages, pageTemplateEnum, postStatusEnum, seoMeta } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";
import { toTiptapDoc } from "@/lib/editor/doc";

function parsePageForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const contentRaw = String(formData.get("content") ?? "");
  const content = contentRaw ? JSON.parse(contentRaw) : toTiptapDoc(null);
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
    .values({ entityType: "page", entityId, ...values })
    .onConflictDoUpdate({
      target: [seoMeta.entityType, seoMeta.entityId],
      set: values,
    });
}

export async function createPage(formData: FormData) {
  await requireRole("editor");
  const [{ id }] = await db.insert(pages).values(parsePageForm(formData)).returning({ id: pages.id });
  await upsertSeoMeta(id, formData);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function updatePage(id: string, formData: FormData) {
  await requireRole("editor");
  await db
    .update(pages)
    .set({ ...parsePageForm(formData), updatedAt: new Date() })
    .where(eq(pages.id, id));
  await upsertSeoMeta(id, formData);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  await requireRole("editor");
  await db.delete(pages).where(eq(pages.id, id));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "page"), eq(seoMeta.entityId, id)));
  revalidatePath("/admin/pages");
}

export async function bulkDeletePages(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  await db.delete(pages).where(inArray(pages.id, ids));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "page"), inArray(seoMeta.entityId, ids)));
  revalidatePath("/admin/pages");
}

export async function bulkSetPageStatus(
  ids: string[],
  status: (typeof postStatusEnum.enumValues)[number],
) {
  await requireRole("editor");
  if (ids.length === 0) return;
  await db.update(pages).set({ status, updatedAt: new Date() }).where(inArray(pages.id, ids));
  revalidatePath("/admin/pages");
}
