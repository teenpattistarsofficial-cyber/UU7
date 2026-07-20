import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media, auditLog } from "@/lib/db/schema";
import { verifyPublishToken } from "@/lib/publish/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

const MAX_ALT_LENGTH = 500;

// Bearer-token auth, same as every other /api/ops/* route. Scoped to just
// the `alt` column — not caption/title — since missing alt text is the
// specific gap run_site_health_check/run_performance_audit surface; a
// broader "edit any media field" endpoint isn't needed for that.
export async function PATCH(request: NextRequest) {
  if (!process.env.PUBLISH_API_TOKEN) {
    return NextResponse.json({ error: "PUBLISH_API_TOKEN not configured on server" }, { status: 500 });
  }
  if (!verifyPublishToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit("publish-api")) {
    return NextResponse.json({ error: "Rate limit exceeded, try again shortly" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { url?: string; alt?: string } | null;
  if (!body?.url || typeof body.alt !== "string") {
    return NextResponse.json({ error: "Both url and alt are required" }, { status: 400 });
  }
  const alt = body.alt.trim();
  if (!alt) {
    return NextResponse.json({ error: "alt cannot be empty" }, { status: 400 });
  }
  if (alt.length > MAX_ALT_LENGTH) {
    return NextResponse.json({ error: `alt must be ${MAX_ALT_LENGTH} characters or fewer` }, { status: 400 });
  }

  const [existing] = await db.select().from(media).where(eq(media.url, body.url));
  if (!existing) {
    return NextResponse.json({ error: `No media row found for url: ${body.url}` }, { status: 404 });
  }

  await db.update(media).set({ alt }).where(eq(media.id, existing.id));
  await db.insert(auditLog).values({
    userId: null,
    userName: "publish-api",
    action: "media.alt_updated",
    entityType: "media",
    entityId: existing.id,
    entityLabel: body.url,
  });

  return NextResponse.json({ id: existing.id, url: existing.url, alt });
}
