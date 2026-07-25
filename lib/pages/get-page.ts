import "server-only";
import { unstable_cache } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages, seoMeta } from "@/lib/db/schema";

/** A page is only "live" once published — same rule as posts. Draft/
 * scheduled/archived pages must stay invisible on the public site even
 * though they're fully editable in the admin. `deletedAt` is a separate
 * soft-delete flag from `status` (a trashed page keeps its prior status),
 * so it has to be checked explicitly too — otherwise a page moved to Trash
 * in the admin stays visible at its public URL.
 *
 * Wrapped in unstable_cache (see the note in lib/home/featured-content.ts
 * for why direct DB calls need this) — tagged "pages" and invalidated by
 * lib/actions/pages.ts on every mutation. `[slug]` becomes part of the
 * cache key automatically (unstable_cache includes call arguments), so
 * each page slug gets its own independent cache entry. */
export const getPublishedPageBySlug = unstable_cache(
  async (slug: string) => {
    const page = await db.query.pages.findFirst({
      where: and(eq(pages.slug, slug), eq(pages.status, "published"), isNull(pages.deletedAt)),
    });
    if (!page) return null;

    const seo = await db.query.seoMeta.findFirst({
      where: and(eq(seoMeta.entityType, "page"), eq(seoMeta.entityId, page.id)),
    });

    return { page, seo };
  },
  ["published-page-by-slug"],
  { tags: ["pages"], revalidate: 3600 },
);
