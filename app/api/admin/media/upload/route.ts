import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { requireRole, UnauthorizedError } from "@/lib/auth/guards";
import { processUpload } from "@/lib/media/process-upload";

export async function POST(request: NextRequest) {
  try {
    await requireRole("author");
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
  }

  const processed = await processUpload(file);

  const [row] = await db
    .insert(media)
    .values({
      url: processed.url,
      filename: processed.filename,
      mimeType: processed.mimeType,
      width: processed.width,
      height: processed.height,
      size: processed.size,
    })
    .returning();

  return NextResponse.json(row);
}
