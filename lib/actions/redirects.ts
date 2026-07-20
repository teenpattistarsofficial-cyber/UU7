"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { invalidateRedirectsCache } from "@/lib/redirects/cache";
import { normalizePath, VALID_STATUS_CODES } from "@/lib/redirects/validation";

export async function createRedirect(formData: FormData) {
  await requireRole("admin");
  const fromPath = normalizePath(String(formData.get("fromPath") ?? ""));
  const toPath = normalizePath(String(formData.get("toPath") ?? ""));
  const statusCode = Number(formData.get("statusCode"));

  if (!fromPath || !toPath) throw new Error("Both paths are required");
  if (fromPath === toPath) throw new Error("From and To paths must be different");
  if (fromPath === "/") throw new Error("Can't redirect the homepage");
  if (!VALID_STATUS_CODES.has(statusCode)) throw new Error("Invalid status code");

  const [row] = await db.insert(redirects).values({ fromPath, toPath, statusCode }).returning();
  invalidateRedirectsCache();
  revalidatePath("/admin/redirects");
  return row;
}

export async function deleteRedirect(id: string) {
  await requireRole("admin");
  await db.delete(redirects).where(eq(redirects.id, id));
  invalidateRedirectsCache();
  revalidatePath("/admin/redirects");
}
