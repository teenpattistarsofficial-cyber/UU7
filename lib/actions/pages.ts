"use server";

import { eq, and, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pages, pageTemplateEnum, postStatusEnum, seoMeta } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";
import { toTiptapDoc } from "@/lib/editor/doc";
import { invalidatePublicPaths } from "@/lib/cache/invalidate-public-paths";

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

// Pages render either at their own literal route (about/contact/
// responsible-gaming/editorial-policy) or, for any other slug, through the
// [category] route's page fallback — revalidating both "/${slug}" and
// "/sitemap.xml" covers either case with one call.
function revalidatePublicPagePaths(slug: string) {
  invalidatePublicPaths([`/${slug}`, "/sitemap.xml"]);
}

export async function createPage(formData: FormData) {
  await requireRole("editor");
  const values = parsePageForm(formData);
  const [{ id }] = await db.insert(pages).values(values).returning({ id: pages.id });
  await upsertSeoMeta(id, formData);
  revalidatePath("/admin/pages");
  revalidatePublicPagePaths(values.slug);
  redirect("/admin/pages");
}

export async function updatePage(id: string, formData: FormData) {
  await requireRole("editor");
  const values = parsePageForm(formData);
  const existing = await db.query.pages.findFirst({ where: eq(pages.id, id) });

  await db
    .update(pages)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(pages.id, id));
  await upsertSeoMeta(id, formData);

  revalidatePath("/admin/pages");
  revalidatePublicPagePaths(values.slug);
  if (existing && existing.slug !== values.slug) revalidatePublicPagePaths(existing.slug);
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  await requireRole("editor");
  const existing = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  await db.delete(pages).where(eq(pages.id, id));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "page"), eq(seoMeta.entityId, id)));
  revalidatePath("/admin/pages");
  if (existing) revalidatePublicPagePaths(existing.slug);
}

export async function bulkDeletePages(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const targets = await db.query.pages.findMany({ where: inArray(pages.id, ids) });
  await db.delete(pages).where(inArray(pages.id, ids));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "page"), inArray(seoMeta.entityId, ids)));
  revalidatePath("/admin/pages");
  for (const page of targets) revalidatePublicPagePaths(page.slug);
}

export async function bulkSetPageStatus(
  ids: string[],
  status: (typeof postStatusEnum.enumValues)[number],
) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const targets = await db.query.pages.findMany({ where: inArray(pages.id, ids) });
  await db.update(pages).set({ status, updatedAt: new Date() }).where(inArray(pages.id, ids));
  revalidatePath("/admin/pages");
  for (const page of targets) revalidatePublicPagePaths(page.slug);
}
