"use server";

import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";
import { invalidatePublicPaths } from "@/lib/cache/invalidate-public-paths";
import { logActivity } from "@/lib/actions/audit-log";

function parseAuthorForm(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const roleTitle = String(formData.get("roleTitle") ?? "").trim() || null;
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;
  const expertiseInput = String(formData.get("expertiseTags") ?? "").trim();
  const expertiseTags = expertiseInput
    ? expertiseInput.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const twitter = String(formData.get("twitter") ?? "").trim();
  const linkedin = String(formData.get("linkedin") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const socialLinks =
    twitter || linkedin || website
      ? { ...(twitter && { twitter }), ...(linkedin && { linkedin }), ...(website && { website }) }
      : null;

  if (!displayName) throw new Error("Display name is required");

  return {
    displayName,
    slug: slugInput ? slugify(slugInput) : slugify(displayName),
    bio,
    roleTitle,
    avatarUrl,
    expertiseTags,
    socialLinks,
  };
}

export async function createAuthor(formData: FormData) {
  await requireRole("editor");
  const values = parseAuthorForm(formData);
  const [{ id }] = await db.insert(authors).values(values).returning({ id: authors.id });
  await logActivity({ action: "author.created", entityType: "author", entityId: id, entityLabel: values.displayName });
  revalidatePath("/admin/authors");
  invalidatePublicPaths(["/authors"]);
  redirect("/admin/authors");
}

export async function updateAuthor(id: string, formData: FormData) {
  await requireRole("editor");
  const values = parseAuthorForm(formData);
  const existing = await db.query.authors.findFirst({ where: eq(authors.id, id) });

  await db
    .update(authors)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(authors.id, id));

  revalidatePath("/admin/authors");
  const paths = ["/authors", `/authors/${values.slug}`];
  if (existing && existing.slug !== values.slug) paths.push(`/authors/${existing.slug}`);
  invalidatePublicPaths(paths);
  // Not fanned out to every post by this author — the AuthorBox embedded
  // there will pick up the change on its own hourly ISR ceiling instead.
  redirect("/admin/authors");
}

// Soft-delete — moves the author to Trash rather than removing it; see the
// matching comment on `deletePost` in lib/actions/posts.ts. No "still in
// use" guard like categories: a post by a trashed author just renders
// without a byline (see the `author &&` guards in the article template)
// instead of breaking, so trashing one is always safe.
export async function deleteAuthor(id: string) {
  await requireRole("editor");
  const existing = await db.query.authors.findFirst({ where: eq(authors.id, id) });
  if (!existing) return;
  await db.update(authors).set({ deletedAt: new Date() }).where(eq(authors.id, id));
  await logActivity({ action: "author.deleted", entityType: "author", entityId: id, entityLabel: existing.displayName });
  revalidatePath("/admin/authors");
  invalidatePublicPaths(["/authors", `/authors/${existing.slug}`]);
}

export async function bulkDeleteAuthors(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const targets = await db.query.authors.findMany({ where: inArray(authors.id, ids) });
  await db.update(authors).set({ deletedAt: new Date() }).where(inArray(authors.id, ids));
  revalidatePath("/admin/authors");
  invalidatePublicPaths(["/authors", ...targets.map((a) => `/authors/${a.slug}`)]);
}

export async function restoreAuthor(id: string) {
  await requireRole("editor");
  const existing = await db.query.authors.findFirst({ where: eq(authors.id, id) });
  await db.update(authors).set({ deletedAt: null }).where(eq(authors.id, id));
  revalidatePath("/admin/authors");
  if (existing) invalidatePublicPaths(["/authors", `/authors/${existing.slug}`]);
}

export async function bulkRestoreAuthors(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const targets = await db.query.authors.findMany({ where: inArray(authors.id, ids) });
  await db.update(authors).set({ deletedAt: null }).where(inArray(authors.id, ids));
  revalidatePath("/admin/authors");
  invalidatePublicPaths(["/authors", ...targets.map((a) => `/authors/${a.slug}`)]);
}

// The actual, irreversible `db.delete` — gated at "admin" rather than
// "editor" (every other action in this file), matching the same escalation
// pages/posts use since there's no more Trash safety net past this point.
// `posts.authorId` has `onDelete: "set null"`, so any post by this author
// just loses its byline — safe, same as the soft-delete path above.
export async function permanentlyDeleteAuthor(id: string) {
  await requireRole("admin");
  const existing = await db.query.authors.findFirst({ where: eq(authors.id, id) });
  await db.delete(authors).where(eq(authors.id, id));
  if (existing) {
    await logActivity({
      action: "author.deleted_permanently",
      entityType: "author",
      entityId: id,
      entityLabel: existing.displayName,
    });
    invalidatePublicPaths(["/authors", `/authors/${existing.slug}`]);
  }
  revalidatePath("/admin/authors");
}

export async function bulkPermanentlyDeleteAuthors(ids: string[]) {
  await requireRole("admin");
  if (ids.length === 0) return;
  const targets = await db.query.authors.findMany({ where: inArray(authors.id, ids) });
  await db.delete(authors).where(inArray(authors.id, ids));
  revalidatePath("/admin/authors");
  invalidatePublicPaths(["/authors", ...targets.map((a) => `/authors/${a.slug}`)]);
}
