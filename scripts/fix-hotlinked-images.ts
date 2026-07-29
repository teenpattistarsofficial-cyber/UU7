import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { db } from "@/lib/db";
import { posts, media } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Inlines the exact same recipe as lib/media/process-upload.ts's
// processImageBuffer (rotate, cap width 2000, transcode to WebP, write to
// uploads/) rather than importing it directly — that module starts with
// `import "server-only"`, which only resolves inside Next's own build
// system, not under plain `tsx` (confirmed: no script in this repo imports
// any server-only-marked lib file, all stick to db/schema/drizzle-orm/node
// built-ins). Keep this in sync with process-upload.ts if that recipe
// ever changes.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function processImageBuffer(buffer: Buffer) {
  const { data, info } = await sharp(buffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const filename = `${randomUUID()}.webp`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), data);

  return {
    filename,
    url: `/uploads/${filename}`,
    width: info.width,
    height: info.height,
    size: info.size,
    mimeType: "image/webp",
  };
}

// One-off migration: self-hosts every post's hotlinked (non-/uploads/)
// featuredImageUrl through the same sharp/WebP pipeline + media-row
// convention app/api/publish/route.ts's coverImage path already uses for
// anything published today — this backfills posts published before that
// path existed (see scripts/create-*-guide.ts, which set featuredImageUrl
// directly to a raw Pexels URL). Run scripts/audit-hotlinked-images.ts
// first to see what this will touch.
//
// Runs via raw Drizzle from a standalone process — cannot call
// revalidatePath/updateTag (those need an actual Next.js server/request
// context and would throw outside one). The existing revalidate:3600
// ceiling on the "posts" tag is an acceptable staleness window for an
// image-only content-quality fix like this.
//
// Usage: npx tsx scripts/fix-hotlinked-images.ts        (dry run)
//        npx tsx scripts/fix-hotlinked-images.ts --apply  (writes)

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      throw new Error(`too large (max ${MAX_IMAGE_BYTES / 1024 / 1024}MB)`);
    }
    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const APPLY = process.argv.includes("--apply");

  const allPosts = await db.query.posts.findMany();
  const toMigrate = allPosts.filter((p) => p.featuredImageUrl && !p.featuredImageUrl.startsWith("/uploads/"));

  console.log(`${toMigrate.length} post(s) with a hotlinked featuredImageUrl.`);
  console.log("---");

  let migrated = 0;
  let failed = 0;

  for (const post of toMigrate) {
    const sourceUrl = post.featuredImageUrl!;
    if (!APPLY) {
      // processImageBuffer writes a real file to uploads/ as an
      // inseparable part of resizing — never call it during a dry run,
      // which must have zero side effects like every other script here.
      console.log(`"${post.title}" (${post.slug}): would migrate ${sourceUrl}`);
      continue;
    }
    try {
      const buffer = await fetchImageBuffer(sourceUrl);
      const processed = await processImageBuffer(buffer);
      await db.insert(media).values({
        url: processed.url,
        filename: processed.filename,
        mimeType: processed.mimeType,
        width: processed.width,
        height: processed.height,
        size: processed.size,
        alt: post.title,
      });
      await db.update(posts).set({ featuredImageUrl: processed.url }).where(eq(posts.id, post.id));
      console.log(`"${post.title}" (${post.slug}): ${sourceUrl} -> ${processed.url}`);
      migrated++;
    } catch (err) {
      failed++;
      console.log(`"${post.title}" (${post.slug}): FAILED — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("---");
  console.log(`Migrated: ${migrated}, failed: ${failed}`);
  console.log(APPLY ? "Applied." : "Dry run only — pass --apply to write.");
  process.exit(0);
}
main();
