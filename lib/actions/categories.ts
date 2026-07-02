"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/seo/slugify";

export async function createCategory(formData: FormData) {
  await requireRole("editor");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!name) throw new Error("Name is required");

  await db.insert(categories).values({
    name,
    slug: slugInput ? slugify(slugInput) : slugify(name),
    description,
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  await requireRole("editor");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!name) throw new Error("Name is required");

  await db
    .update(categories)
    .set({
      name,
      slug: slugInput ? slugify(slugInput) : slugify(name),
      description,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireRole("editor");
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}
