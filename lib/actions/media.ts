"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function listMedia() {
  await requireRole("author");
  const rows = await db.query.media.findMany({ orderBy: (m, { desc }) => desc(m.createdAt) });
  return rows.map((r) => ({ id: r.id, url: r.url, alt: r.alt, width: r.width, height: r.height }));
}

export async function updateMedia(id: string, values: { alt: string; caption: string; title: string }) {
  await requireRole("author");
  await db.update(media).set(values).where(eq(media.id, id));
  revalidatePath("/admin/media");
}

export async function deleteMedia(id: string) {
  await requireRole("editor");
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (row) {
    await unlink(path.join(UPLOAD_DIR, row.filename)).catch(() => {});
  }
  await db.delete(media).where(eq(media.id, id));
  revalidatePath("/admin/media");
}

export async function bulkDeleteMedia(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const rows = await db.select().from(media).where(inArray(media.id, ids));
  await Promise.all(rows.map((row) => unlink(path.join(UPLOAD_DIR, row.filename)).catch(() => {})));
  await db.delete(media).where(inArray(media.id, ids));
  revalidatePath("/admin/media");
}
