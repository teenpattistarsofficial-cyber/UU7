import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// One-off migration: inserts the `media` table rows for the 7 images
// uploaded locally today (their actual files are synced separately via
// `docker cp` from scripts/data/uploads-sync/ into the app container's
// uploads volume — this script only handles the database row, which is
// what makes the file show up correctly in Media Library and what
// getPublishBlockers checks for alt text). Matched by url, not id, since
// local dev and production are separate databases — safe to re-run.
//
// Usage: npx tsx scripts/apply-media-sync.ts        (dry run)
//        npx tsx scripts/apply-media-sync.ts --apply  (writes)

const ROWS = [
  { filename: "f0869eca-53f7-4042-b000-2e24ce4798d1.webp", alt: "UU7GAME Games Overview", caption: "", title: "", width: 2000, height: 1333, size: 19588, mimeType: "image/webp" },
  { filename: "b2a9f81a-1628-4a66-9b57-7a54c0886c6e.webp", alt: "The Ultimate UU7GAME Guide.webp", caption: "", title: "", width: 2000, height: 1359, size: 163922, mimeType: "image/webp" },
  { filename: "72b24e72-9344-41cf-a8d7-a389fde66a9f.webp", alt: "UU7GAME Login Guide", caption: "", title: "", width: 1600, height: 900, size: 191226, mimeType: "image/webp" },
  { filename: "86ec4935-0e92-4535-a970-a7af0d3641dc.webp", alt: "UU7 Game APK download.webp", caption: "", title: "", width: 1536, height: 1024, size: 97838, mimeType: "image/webp" },
  { filename: "c424df81-51b6-4b85-9f57-514b97593c11.webp", alt: "UU7GAME Registration Guide", caption: "", title: "", width: 1600, height: 900, size: 168136, mimeType: "image/webp" },
  { filename: "b9062e0a-d1d5-41cf-8687-8c4b08e66f82.webp", alt: "Online Rummy Guide", caption: "", title: "", width: 1600, height: 900, size: 187596, mimeType: "image/webp" },
  { filename: "2cf092db-5c57-401f-adec-29eee4070142.webp", alt: "UU7GAME Review 2026", caption: "", title: "", width: 1600, height: 900, size: 100550, mimeType: "image/webp" },
];

async function main() {
  const APPLY = process.argv.includes("--apply");

  for (const row of ROWS) {
    const url = `/uploads/${row.filename}`;
    const existing = await db.query.media.findFirst({ where: eq(media.url, url) });
    if (existing) {
      console.log(`SKIP (already exists): ${url}`);
      continue;
    }
    console.log(`INSERT: ${url} (alt: ${row.alt})`);
    if (APPLY) {
      await db.insert(media).values({
        url,
        filename: row.filename,
        mimeType: row.mimeType,
        width: row.width,
        height: row.height,
        size: row.size,
        alt: row.alt,
        caption: row.caption,
        title: row.title,
      });
    }
  }

  console.log("---");
  console.log(APPLY ? "Applied." : "Dry run only — pass --apply to write.");
  process.exit(0);
}
main();
