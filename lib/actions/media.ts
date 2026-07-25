"use server";

import { eq, and, inArray, isNull } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { media, posts, authors, categories } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { invalidatePublicPaths } from "@/lib/cache/invalidate-public-paths";

// Kept in sync with lib/media/process-upload.ts's UPLOAD_DIR.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Posts/categories/authors don't store their own alt/caption/title — every
// public page that shows an image (post cover, category thumbnail, author
// avatar) joins live against this `media` row by URL at render time (see
// app/(site)/[category]/[slug]/page.tsx, app/(site)/[category]/page.tsx,
// app/(site)/authors/[slug]/page.tsx). So editing or deleting a media row
// can silently affect any number of already-published pages with no direct
// foreign key to follow — this reverse-looks-up every post/author currently
// referencing the URL and invalidates each one, rather than just the admin
// media list.
async function revalidatePagesUsingMedia(url: string) {
  const usingPosts = await db.query.posts.findMany({
    where: and(eq(posts.featuredImageUrl, url), isNull(posts.deletedAt)),
  });
  const usingAuthors = await db.query.authors.findMany({
    where: and(eq(authors.avatarUrl, url), isNull(authors.deletedAt)),
  });

  const categoryIds = [...new Set(usingPosts.map((p) => p.categoryId).filter((id): id is string => Boolean(id)))];
  const relevantCategories = categoryIds.length > 0 ? await db.query.categories.findMany({ where: inArray(categories.id, categoryIds) }) : [];
  const categorySlugById = new Map(relevantCategories.map((c) => [c.id, c.slug]));

  const authorIds = [...new Set(usingPosts.map((p) => p.authorId).filter((id): id is string => Boolean(id)))];
  const relevantAuthors = authorIds.length > 0 ? await db.query.authors.findMany({ where: inArray(authors.id, authorIds) }) : [];
  const authorSlugById = new Map(relevantAuthors.map((a) => [a.id, a.slug]));

  const paths = new Set<string>();
  for (const post of usingPosts) {
    const categorySlug = post.categoryId ? categorySlugById.get(post.categoryId) : null;
    if (categorySlug) {
      paths.add("/");
      paths.add(`/${categorySlug}`);
      paths.add(`/${categorySlug}/${post.slug}`);
    }
    const authorSlug = post.authorId ? authorSlugById.get(post.authorId) : null;
    if (authorSlug) paths.add(`/authors/${authorSlug}`);
  }
  for (const author of usingAuthors) {
    paths.add("/authors");
    paths.add(`/authors/${author.slug}`);
  }

  if (paths.size > 0) {
    invalidatePublicPaths([...paths]);
    // Both tags: a post's cover image is read by lib/posts/get-post-page-data.ts
    // ("posts") and this same media row's alt text also appears on the
    // category listing's thumbnail via lib/posts/get-category-page-data.ts
    // ("categories") — busting only one would leave the other page showing
    // the old alt/caption until its 1hr ISR ceiling catches up.
    updateTag("posts");
    updateTag("categories");
  }
}

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
  const [existing] = await db.select({ url: media.url }).from(media).where(eq(media.id, id));
  await db.update(media).set(values).where(eq(media.id, id));
  revalidatePath("/admin/media");
  if (existing) await revalidatePagesUsingMedia(existing.url);
}

export async function deleteMedia(id: string) {
  await requireRole("editor");
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (row) {
    await unlink(path.join(UPLOAD_DIR, row.filename)).catch(() => {});
  }
  await db.delete(media).where(eq(media.id, id));
  revalidatePath("/admin/media");
  if (row) await revalidatePagesUsingMedia(row.url);
}

export async function bulkDeleteMedia(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  const rows = await db.select().from(media).where(inArray(media.id, ids));
  await Promise.all(rows.map((row) => unlink(path.join(UPLOAD_DIR, row.filename)).catch(() => {})));
  await db.delete(media).where(inArray(media.id, ids));
  revalidatePath("/admin/media");
  for (const row of rows) await revalidatePagesUsingMedia(row.url);
}
