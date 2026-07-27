import "server-only";
import { unstable_cache } from "next/cache";
import { isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";

/** The full authors directory (/authors) — previously a direct, unwrapped
 * Drizzle call on every request, unlike every other page here (see
 * lib/pages/get-page.ts). Wrapped the same way: plain fields only
 * (name/bio/slug/etc, no component refs) crossing the cache boundary, so
 * this can't repeat the icon-mangling bug fixed in d062ab3. Tagged
 * "authors" and busted by lib/actions/authors.ts on every mutation. */
export const getPublishedAuthors = unstable_cache(
  async () => {
    // `deletedAt` is separate from a status field authors don't have — a
    // trashed author must be excluded explicitly.
    return db.query.authors.findMany({
      where: isNull(authors.deletedAt),
      orderBy: (a, { asc }) => asc(a.displayName),
    });
  },
  ["published-authors"],
  { tags: ["authors"], revalidate: 3600 },
);
