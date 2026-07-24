"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contactChannels, contactChannelKindEnum } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";

type ContactChannelKind = (typeof contactChannelKindEnum.enumValues)[number];

const VALID_KINDS = new Set(contactChannelKindEnum.enumValues);

// The /contact page reads the full channel list, but app/(site)/layout.tsx
// (wrapping every public page) separately queries this same table for just
// the primary — lowest-position — channel, to feed the Ask-AI widget's
// "talk to a human" link shown sitewide. So any change here has to
// invalidate both the one page and the whole layout tree, not just
// "/contact" — otherwise every other page's Ask-AI widget would keep
// serving a stale link until something unrelated happened to revalidate
// the layout. No Cloudflare purge here, matching site-settings.ts's own
// layout-wide invalidation: pages aren't edge-cached yet (only
// /_next/image is), so there's nothing at Cloudflare's edge to purge.
function revalidateContactChannels() {
  revalidatePath("/contact");
  revalidatePath("/", "layout");
}

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
  revalidateContactChannels();
  return row;
}

export async function deleteContactChannel(id: string) {
  await requireRole("editor");
  await db.delete(contactChannels).where(eq(contactChannels.id, id));
  revalidatePath("/admin/settings");
  revalidateContactChannels();
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
  revalidateContactChannels();
}
