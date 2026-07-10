"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contactChannels, contactChannelKindEnum } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { invalidatePublicPaths } from "@/lib/cache/invalidate-public-paths";

type ContactChannelKind = (typeof contactChannelKindEnum.enumValues)[number];

const VALID_KINDS = new Set(contactChannelKindEnum.enumValues);

function parseContactChannelForm(formData: FormData) {
  const kind = String(formData.get("kind") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();

  if (!VALID_KINDS.has(kind as ContactChannelKind)) throw new Error("Invalid contact channel kind");
  if (!label) throw new Error("Label is required");
  if (!value) throw new Error("Value is required");

  return { kind: kind as ContactChannelKind, label, value };
}

export async function createContactChannel(formData: FormData) {
  await requireRole("editor");
  const values = parseContactChannelForm(formData);

  const existing = await db.select({ position: contactChannels.position }).from(contactChannels);
  const nextPosition = existing.length > 0 ? Math.max(...existing.map((r) => r.position)) + 1 : 0;

  const [row] = await db.insert(contactChannels).values({ ...values, position: nextPosition }).returning();
  revalidatePath("/admin/settings");
  invalidatePublicPaths(["/contact"]);
  return row;
}

export async function deleteContactChannel(id: string) {
  await requireRole("editor");
  await db.delete(contactChannels).where(eq(contactChannels.id, id));
  revalidatePath("/admin/settings");
  invalidatePublicPaths(["/contact"]);
}

// Simple position-swap reorder (up/down buttons, same UX as the FAQ
// builder) rather than drag-and-drop — this list is a handful of rows at
// most, not worth the extra complexity.
export async function moveContactChannel(id: string, direction: -1 | 1) {
  await requireRole("editor");
  const rows = await db.select().from(contactChannels).orderBy(contactChannels.position);
  const index = rows.findIndex((r) => r.id === id);
  const targetIndex = index + direction;
  if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) return;

  const current = rows[index];
  const target = rows[targetIndex];
  await db.update(contactChannels).set({ position: target.position }).where(eq(contactChannels.id, current.id));
  await db.update(contactChannels).set({ position: current.position }).where(eq(contactChannels.id, target.id));

  revalidatePath("/admin/settings");
  invalidatePublicPaths(["/contact"]);
}
