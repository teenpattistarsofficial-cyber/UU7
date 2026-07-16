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
  // Replacement cover images swapped in directly via the admin panel for
  // 4 posts (originally Pexels stock photos) — never synced before.
  { filename: "62c0d968-a72e-4559-bd8e-d5d4ce658e11.webp", alt: "UU7GAME Slots Guide", caption: "", title: "", width: 2000, height: 1326, size: 208622, mimeType: "image/webp" },
  { filename: "4f075f02-9ddb-4cfc-875d-f94d3181d4ce.webp", alt: "UU7GAME Casino Games Guide", caption: "", title: "", width: 2000, height: 1333, size: 290626, mimeType: "image/webp" },
  { filename: "e7bc10d7-9dce-4be0-880e-3f8bffff73bc.webp", alt: "UU7GAME Deposit and Withdrawal Guide", caption: "", title: "", width: 2000, height: 1333, size: 105020, mimeType: "image/webp" },
  { filename: "e11a767d-3a61-4720-84c0-0ea590a84aff.webp", alt: "UU7GAME Rummy Guide", caption: "", title: "", width: 2000, height: 1337, size: 170128, mimeType: "image/webp" },
  // UU7GAME Mobile App guide's 5 inline screenshots (real app UI, uploaded
  // via the admin Media Library rather than sourced as stock photos).
  { filename: "79bee96a-6782-4f2d-98c2-dad53ad1b9c0.webp", alt: "UU7GAME app home screen showing the game category rail and bottom navigation", caption: "", title: "", width: 576, height: 1280, size: 110116, mimeType: "image/webp" },
  { filename: "80327e95-b9dd-48f4-a857-18584193db92.webp", alt: "UU7GAME app deposit screen showing minimum, maximum, and quick-select deposit amounts", caption: "", title: "", width: 576, height: 1280, size: 59500, mimeType: "image/webp" },
  { filename: "6691583d-154a-4a4d-9bd1-e9a942f10062.webp", alt: "UU7GAME app phone number verification modal", caption: "", title: "", width: 576, height: 1280, size: 42012, mimeType: "image/webp" },
  { filename: "b87de7ae-e887-415a-8f47-e40048ce4b97.webp", alt: "UU7GAME app promo tab sidebar showing Ranking and VIP bonus banners", caption: "", title: "", width: 576, height: 1280, size: 77006, mimeType: "image/webp" },
  { filename: "14fc3a18-ac1d-4a74-bf9c-122e9dc183f7.webp", alt: "UU7GAME app profile screen showing VIP tier progress and account menu", caption: "", title: "", width: 576, height: 1280, size: 29450, mimeType: "image/webp" },
  // Replacement cover image for the Mobile App guide (set directly via the
  // admin panel, replacing the original Pexels stock photo).
  { filename: "7dc00b3f-30cd-4806-87fb-b2b3ea2d1ebc.webp", alt: "UU7GAME Mobile App cover", caption: "", title: "", width: 1536, height: 1024, size: 220202, mimeType: "image/webp" },
  // UU7GAME Aviator Guide's 3 inline screenshots (real app UI).
  { filename: "6a10f4ef-7fb6-47d9-b395-ce1fcb9940a1.webp", alt: "UU7GAME lobby screen showing Aviator's tile placement on the main game grid", caption: "", title: "", width: 1280, height: 618, size: 130284, mimeType: "image/webp" },
  { filename: "e5bc5415-4838-4554-bbe0-7c84d8821b6e.webp", alt: "UU7GAME Aviator's Game Rules screen, stating the game runs on a provably fair system", caption: "", title: "", width: 1280, height: 709, size: 34938, mimeType: "image/webp" },
  { filename: "50d8b169-be9a-4d28-844b-aac676e3df6a.webp", alt: "UU7GAME Aviator's live betting screen showing the two dual betting panels, round-history strip, and All Bets feed", caption: "", title: "", width: 1280, height: 697, size: 39610, mimeType: "image/webp" },
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
