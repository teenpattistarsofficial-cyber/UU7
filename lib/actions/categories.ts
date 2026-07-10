"use server";

import { eq, and, inArray, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories, seoMeta, posts } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";
import { invalidatePublicPaths } from "@/lib/cache/invalidate-public-paths";
import { logActivity } from "@/lib/actions/audit-log";

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
    .values({ entityType: "category", entityId, ...values })
    .onConflictDoUpdate({
      target: [seoMeta.entityType, seoMeta.entityId],
      set: values,
    });
}

// Unlike posts/pages, a category can have live posts still pointing at it
// via `posts.categoryId` — and unlike the real FK's `onDelete: "set null"`,
// a soft-delete never fires that cascade, so nothing would otherwise stop
// a trashed category from silently 404ing every post still assigned to it
// (see [category]/page.tsx: a trashed category fails its own lookup, and
// there's no fallback path once that happens). Trashing is blocked until
// the category is empty; permanently deleting still relies on the real FK,
// which is safe.
async function countLivePosts(categoryId: string): Promise<number> {
  const rows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.categoryId, categoryId), isNull(posts.deletedAt)));
  return rows.length;
}

export async function createCategory(formData: FormData) {
  await requireRole("editor");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!name) throw new Error("Name is required");

  const [{ id }] = await db
    .insert(categories)
    .values({
      name,
      slug: slugInput ? slugify(slugInput) : slugify(name),
      description,
    })
    .returning({ id: categories.id });
  await upsertSeoMeta(id, formData);
  await logActivity({ action: "category.created", entityType: "category", entityId: id, entityLabel: name });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  await requireRole("editor");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!name) throw new Error("Name is required");

  const existing = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  const slug = slugInput ? slugify(slugInput) : slugify(name);

  await db
    .update(categories)
    .set({ name, slug, description, updatedAt: new Date() })
    .where(eq(categories.id, id));
  await upsertSeoMeta(id, formData);

  revalidatePath("/admin/categories");
  const paths = ["/", `/${slug}`];
  if (existing && existing.slug !== slug) paths.push(`/${existing.slug}`);
  invalidatePublicPaths(paths);
  redirect("/admin/categories");
}

// Soft-delete — moves the category to Trash rather than removing it; see
// the matching comment on `deletePost` in lib/actions/posts.ts. Blocked
// while it still has live posts assigned (see countLivePosts above).
export async function deleteCategory(id: string) {
  await requireRole("editor");
  const existing = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  if (!existing) return;

  const liveCount = await countLivePosts(id);
  if (liveCount > 0) {
    throw new Error(
      `Can't move "${existing.name}" to Trash — ${liveCount} post${liveCount === 1 ? " is" : "s are"} still assigned to it. Reassign ${liveCount === 1 ? "it" : "them"} to another category first.`,
    );
  }

  await db.update(categories).set({ deletedAt: new Date() }).where(eq(categories.id, id));
  await logActivity({ action: "category.deleted", entityType: "category", entityId: id, entityLabel: existing.name });
  revalidatePath("/admin/categories");
  invalidatePublicPaths([`/${existing.slug}`]);
}

export async function bulkDeleteCategories(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;

  const targets = await db.query.categories.findMany({ where: inArray(categories.id, ids) });
  const blocked: string[] = [];
  const deletableIds: string[] = [];

  for (const category of targets) {
    const liveCount = await countLivePosts(category.id);
    if (liveCount > 0) blocked.push(`${category.name} (${liveCount})`);
    else deletableIds.push(category.id);
  }

  if (deletableIds.length > 0) {
    await db.update(categories).set({ deletedAt: new Date() }).where(inArray(categories.id, deletableIds));
    revalidatePath("/admin/categories");
    for (const category of targets) {
      if (deletableIds.includes(category.id)) invalidatePublicPaths([`/${category.slug}`]);
    }
  }

  if (blocked.length > 0) {
    throw new Error(
      `Skipped ${blocked.length} categor${blocked.length === 1 ? "y" : "ies"} still with posts assigned: ${blocked.join(", ")}.`,
    );
  }
}

export async function restoreCategory(id: string) {
  await requireRole("editor");
  const existing = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  await db.update(categories).set({ deletedAt: null }).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  if (existing) invalidatePublicPaths([`/${existing.slug}`]);
}

export async function bulkRestoreCategories(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const targets = await db.query.categories.findMany({ where: inArray(categories.id, ids) });
  await db.update(categories).set({ deletedAt: null }).where(inArray(categories.id, ids));
  revalidatePath("/admin/categories");
  for (const category of targets) invalidatePublicPaths([`/${category.slug}`]);
}

// The actual, irreversible `db.delete` — gated at "admin" rather than
// "editor" (every other action in this file), matching the same escalation
// pages/posts use since there's no more Trash safety net past this point.
// Relies on the real FK's `onDelete: "set null"` to clear `posts.categoryId`
// for any (already-trashed, by definition reachable only via Trash) posts —
// safe, unlike the soft-delete path above.
export async function permanentlyDeleteCategory(id: string) {
  await requireRole("admin");
  const existing = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  await db.delete(categories).where(eq(categories.id, id));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "category"), eq(seoMeta.entityId, id)));
  if (existing) {
    await logActivity({
      action: "category.deleted_permanently",
      entityType: "category",
      entityId: id,
      entityLabel: existing.name,
    });
  }
  revalidatePath("/admin/categories");
}

export async function bulkPermanentlyDeleteCategories(ids: string[]) {
  await requireRole("admin");
  if (ids.length === 0) return;
  await db.delete(categories).where(inArray(categories.id, ids));
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "category"), inArray(seoMeta.entityId, ids)));
  revalidatePath("/admin/categories");
}
