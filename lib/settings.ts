import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

// `cache()` dedupes this within a single request/render pass — the logo
// alone is read from up to three places on one page load (header, footer,
// and, on admin routes, the sidebar), and this is one query, not three.
export const getSiteSettings = cache(async () => {
  const [row] = await db.select().from(siteSettings).limit(1);
  return row ?? null;
});
