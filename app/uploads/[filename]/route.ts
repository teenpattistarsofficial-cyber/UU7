import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Uploaded media used to live under public/uploads and rely on Next's own
// static file serving. That broke in production: the app container's
// standalone server resolves public/ files against a list it builds once at
// boot, so a file written to the volume-mounted uploads dir *after* the
// process started 404'd until the next restart — every real upload, since
// the container is never restarted right after someone uploads an image.
// Reading the file from disk on every request here sidesteps that boot-time
// list entirely. Filenames are always a plain randomUUID().webp (see
// lib/media/process-upload.ts), so a path separator or ".." can only mean a
// crafted request, not a real file.
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return new NextResponse(null, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    const [data, info] = await Promise.all([readFile(filePath), stat(filePath)]);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Last-Modified": info.mtime.toUTCString(),
        "Content-Length": String(info.size),
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
