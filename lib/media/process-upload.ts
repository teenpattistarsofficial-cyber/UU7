import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Auto-orients from EXIF then strips it, caps width at 2000px (source images
// are routinely much larger than any layout on the site needs), and
// transcodes to WebP — the one processing step this module does, per the
// scope agreed for the Media module's first version (no responsive
// multi-size variants yet).
export async function processUpload(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

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
