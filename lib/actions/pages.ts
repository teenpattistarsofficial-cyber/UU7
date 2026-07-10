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
import { logActivity } from "@/lib/actions/audit-log";

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
  await logActivity({ action: "page.created", entityType: "page", entityId: id, entityLabel: values.title });
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

// Soft-delete — moves the page to Trash rather than removing it; see the
// matching comment on `deletePost` in lib/actions/posts.ts.
export async function deletePage(id: string) {
  await requireRole("editor");
  const existing = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  await db.update(pages).set({ deletedAt: new Date() }).where(eq(pages.id, id));
  if (existing) {
    await logActivity({ action: "page.deleted", entityType: "page", entityId: id, entityLabel: existing.title });
  }
  revalidatePath("/admin/pages");
  if (existing) revalidatePublicPagePaths(existing.slug);
}

export async function bulkDeletePages(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const targets = await db.query.pages.findMany({ where: inArray(pages.id, ids) });
  await db.update(pages).set({ deletedAt: new Date() }).where(inArray(pages.id, ids));
  revalidatePath("/admin/pages");
  for (const page of targets) revalidatePublicPagePaths(page.slug);
}

export async function restorePage(id: string) {
  await requireRole("editor");
  const existing = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  await db.update(pages).set({ deletedAt: null }).where(eq(pages.id, id));
  revalidatePath("/admin/pages");
  if (existing) revalidatePublicPagePaths(existing.slug);
}

export async function bulkRestorePages(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const targets = await db.query.pages.findMany({ where: inArray(pages.id, ids) });
  await db.update(pages).set({ deletedAt: null }).where(inArray(pages.id, ids));
  revalidatePath("/admin/pages");
  for (const page of targets) revalidatePublicPagePaths(page.slug);
}

// The actual, irreversible `db.delete` — gated at "admin" rather than
// "editor" (every other action in this file), since there's no more Trash
// safety net past this point. Only reachable from the Trash tab.
export async function permanentlyDeletePage(id: string) {
  await requireRole("admin");
  const existing = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  await db.delete(pages).where(eq(pages.id, id));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "page"), eq(seoMeta.entityId, id)));
  if (existing) {
    await logActivity({ action: "page.deleted_permanently", entityType: "page", entityId: id, entityLabel: existing.title });
  }
  revalidatePath("/admin/pages");
}

export async function bulkPermanentlyDeletePages(ids: string[]) {
  await requireRole("admin");
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
  const targets = await db.query.pages.findMany({ where: inArray(pages.id, ids) });
  await db.update(pages).set({ status, updatedAt: new Date() }).where(inArray(pages.id, ids));
  revalidatePath("/admin/pages");
  for (const page of targets) revalidatePublicPagePaths(page.slug);
}
