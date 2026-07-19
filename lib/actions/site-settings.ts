"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { invalidateRedirectsCache } from "@/lib/redirects/cache";
import { invalidateMaintenanceCache } from "@/lib/maintenance-cache";

// Every field this singleton row can hold — Branding and Global SEO are two
// separate forms/Save buttons in the admin (see components/admin/branding-settings.tsx
// and global-seo-settings.tsx), each submitting only its own fields. Doing a
// partial update keyed on `formData.has(key)` (not just "falsy → null") is
// what keeps one form's save from wiping out the other's fields, since a
// FormData that never included, say, `siteTitle` at all must leave the
// existing siteTitle alone rather than reading it as blank.
const FIELD_KEYS = [
  "logoUrl",
  "faviconUrl",
  "ogImageUrl",
  "siteTitle",
  "metaDescription",
  "metaKeywords",
  "googleSiteVerification",
  "twitterHandle",
  "canonicalUrl",
  "maintenanceMessage",
  "aiWidgetWelcomeMessage",
  "headScripts",
  "footerScripts",
] as const;

// Shared by every action below — each writes to the same singleton row, so
// upsert-if-missing lives in one place rather than four near-identical
// copies.
async function applySettingsUpdate(updates: Record<string, unknown>) {
  const [existing] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  if (existing) {
    await db.update(siteSettings).set({ ...updates, updatedAt: new Date() }).where(eq(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values(updates);
  }
  // Every page's header/footer/metadata (and every admin page's sidebar)
  // reads this, so the whole site's layout cache needs invalidating, not
  // just one path.
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function updateSiteSettings(formData: FormData) {
  // Gated at "admin", not "editor" like most content actions — this is
  // site-wide identity/SEO (appears on every single page, in both the
  // public site and the admin itself), closer in blast radius to
  // Redirects (also admin-only) than to per-content editing.
  await requireRole("admin");

  const updates: Partial<Record<(typeof FIELD_KEYS)[number], string | null>> = {};
  for (const key of FIELD_KEYS) {
    if (!formData.has(key)) continue;
    updates[key] = String(formData.get(key) ?? "").trim() || null;
  }

  await applySettingsUpdate(updates);
  // Cheap no-op unless `maintenanceMessage` was part of this save — safe to
  // always call rather than threading a conditional through.
  invalidateMaintenanceCache();
}

// Increments cacheVersion (a visible proof a clear actually happened) and
// revalidates every cached page — plus best-effort-invalidates the
// in-memory redirects cache (lib/redirects/cache.ts), since that's the one
// other place server state outlives a single request.
export async function clearSiteCache() {
  await requireRole("admin");

  const [existing] = await db.select({ cacheVersion: siteSettings.cacheVersion }).from(siteSettings).limit(1);
  const nextVersion = (existing?.cacheVersion ?? 1) + 1;

  await applySettingsUpdate({ cacheVersion: nextVersion, cacheClearedAt: new Date() });
  invalidateRedirectsCache();

  return { version: nextVersion };
}

export async function setMaintenanceMode(enabled: boolean) {
  await requireRole("admin");
  await applySettingsUpdate({ maintenanceMode: enabled });
  invalidateMaintenanceCache();
}

export async function setAiWidgetEnabled(enabled: boolean) {
  await requireRole("admin");
  await applySettingsUpdate({ aiWidgetEnabled: enabled });
}

// Deliberately its own action rather than riding along in updateSiteSettings'
// FIELD_KEYS list — a saved API key must never round-trip back into a form
// value the way other text settings do (the UI never re-displays the real
// key, only a masked last-4 preview), so this returns that preview directly
// instead of the caller having to re-fetch the row itself.
export async function setOpenAiApiKey(key: string | null) {
  await requireRole("admin");
  const trimmed = key?.trim() || null;
  await applySettingsUpdate({ openaiApiKey: trimmed });
  return { configured: Boolean(trimmed), preview: trimmed ? trimmed.slice(-4) : null };
}
