import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";
import { verifyPublishToken } from "@/lib/publish/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

// Read-only, same bearer-token auth as app/api/publish/*. Everything else a
// site-health crawler needs is already public (the actual pages, /sitemap.xml)
// — redirects are the one piece of data that isn't, since matching happens
// against a DB-backed in-memory Map (lib/redirects/cache.ts), not anything
// exposed over HTTP. /api/ops is a new namespace, distinct from /api/publish
// (content), for read (and later read/write) access to operational settings
// like this.
export async function GET(request: NextRequest) {
  if (!process.env.PUBLISH_API_TOKEN) {
    return NextResponse.json({ error: "PUBLISH_API_TOKEN not configured on server" }, { status: 500 });
  }
  if (!verifyPublishToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit("publish-api")) {
    return NextResponse.json({ error: "Rate limit exceeded, try again shortly" }, { status: 429 });
  }

  const rows = await db
    .select({ fromPath: redirects.fromPath, toPath: redirects.toPath, statusCode: redirects.statusCode })
    .from(redirects);

  return NextResponse.json({ redirects: rows });
}
