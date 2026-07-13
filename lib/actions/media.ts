"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";

// Kept in sync with lib/media/process-upload.ts's UPLOAD_DIR.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function listMedia() {
  await requireRole("author");
  const rows = await db.query.media.findMany({ orderBy: (m, { desc }) => desc(m.createdAt) });
  return rows.map((r) => ({ id: r.id, url: r.url, alt: r.alt, width: r.width, height: r.height }));
}

// Looks a media row up by its public URL rather than id — callers that only
// hold a `featuredImageUrl` string (e.g. a post form loaded from a previous
// session) have no id to look up by otherwise.
export async function getMediaByUrl(url: string) {
  await requireRole("author");
  if (!url) return null;
  const row = await db.query.media.findFirst({ where: eq(media.url, url) });
  if (!row) return null;
  return { id: row.id, url: row.url, alt: row.alt, caption: row.caption, title: row.title };
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
