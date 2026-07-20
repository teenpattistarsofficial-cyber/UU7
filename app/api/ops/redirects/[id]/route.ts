import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { redirects, auditLog } from "@/lib/db/schema";
import { verifyPublishToken } from "@/lib/publish/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { invalidateRedirectsCache } from "@/lib/redirects/cache";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.PUBLISH_API_TOKEN) {
    return NextResponse.json({ error: "PUBLISH_API_TOKEN not configured on server" }, { status: 500 });
  }
  if (!verifyPublishToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit("publish-api")) {
    return NextResponse.json({ error: "Rate limit exceeded, try again shortly" }, { status: 429 });
  }

  const { id } = await params;
  const [existing] = await db.select().from(redirects).where(eq(redirects.id, id));
  if (!existing) {
    return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
  }

  await db.delete(redirects).where(eq(redirects.id, id));
  invalidateRedirectsCache();
  await db.insert(auditLog).values({
    userId: null,
    userName: "publish-api",
    action: "redirect.delete",
    entityType: "redirect",
    entityId: id,
    entityLabel: `${existing.fromPath} -> ${existing.toPath}`,
  });

  return NextResponse.json({ deleted: true });
}
