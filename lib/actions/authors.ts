"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";
import { invalidatePublicPaths } from "@/lib/cache/invalidate-public-paths";

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
  await db.insert(authors).values(values);
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

export async function deleteAuthor(id: string) {
  await requireRole("editor");
  const existing = await db.query.authors.findFirst({ where: eq(authors.id, id) });
  await db.delete(authors).where(eq(authors.id, id));
  revalidatePath("/admin/authors");
  const paths = ["/authors"];
  if (existing) paths.push(`/authors/${existing.slug}`);
  invalidatePublicPaths(paths);
}
