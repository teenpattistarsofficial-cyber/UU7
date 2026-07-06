import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages, seoMeta } from "@/lib/db/schema";

/** A page is only "live" once published — same rule as posts. Draft/
 * scheduled/archived pages must stay invisible on the public site even
 * though they're fully editable in the admin. */
export async function getPublishedPageBySlug(slug: string) {
  const page = await db.query.pages.findFirst({
    where: and(eq(pages.slug, slug), eq(pages.status, "published")),
  });
  if (!page) return null;

  const seo = await db.query.seoMeta.findFirst({
    where: and(eq(seoMeta.entityType, "page"), eq(seoMeta.entityId, page.id)),
  });

  return { page, seo };
}
