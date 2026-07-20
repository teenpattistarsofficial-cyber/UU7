import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { redirects, auditLog } from "@/lib/db/schema";
import { verifyPublishToken } from "@/lib/publish/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { invalidateRedirectsCache } from "@/lib/redirects/cache";
import { normalizePath, VALID_STATUS_CODES } from "@/lib/redirects/validation";

export const runtime = "nodejs";

// Bearer-token auth, same as every other /api/ops/* and /api/publish/*
// route. GET is read-only (everything else a site-health crawler needs is
// already public — redirects are the one piece that isn't, since matching
// happens against an in-memory Map, lib/redirects/cache.ts, not anything
// exposed over HTTP). POST lets the ops agent apply a fix directly — e.g.
// run_site_health_check finds a broken link with no redirect, the agent
// adds one on the spot instead of a human running raw SQL by hand.
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
    .select({ id: redirects.id, fromPath: redirects.fromPath, toPath: redirects.toPath, statusCode: redirects.statusCode })
    .from(redirects);

  return NextResponse.json({ redirects: rows });
}

export async function POST(request: NextRequest) {
  if (!process.env.PUBLISH_API_TOKEN) {
    return NextResponse.json({ error: "PUBLISH_API_TOKEN not configured on server" }, { status: 500 });
  }
  if (!verifyPublishToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit("publish-api")) {
    return NextResponse.json({ error: "Rate limit exceeded, try again shortly" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { fromPath?: string; toPath?: string; statusCode?: number } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Same validation as lib/actions/redirects.ts#createRedirect — normalizePath
  // strips any pasted-in origin down to a bare path, so this can never
  // become an open redirect to an external domain.
  const fromPath = normalizePath(body.fromPath ?? "");
  const toPath = normalizePath(body.toPath ?? "");
  const statusCode = body.statusCode ?? 308;

  if (!fromPath || !toPath) {
    return NextResponse.json({ error: "Both fromPath and toPath are required" }, { status: 400 });
  }
  if (fromPath === toPath) {
    return NextResponse.json({ error: "fromPath and toPath must be different" }, { status: 400 });
  }
  if (fromPath === "/") {
    return NextResponse.json({ error: "Can't redirect the homepage" }, { status: 400 });
  }
  if (!VALID_STATUS_CODES.has(statusCode)) {
    return NextResponse.json({ error: "statusCode must be one of 301, 302, 307, 308" }, { status: 400 });
  }

  let row;
  try {
    [row] = await db.insert(redirects).values({ fromPath, toPath, statusCode }).returning();
  } catch (err) {
    // Postgres unique_violation on redirects.from_path — drizzle's postgres.js
    // driver wraps the real PostgresError in `cause`, not on the outer Error.
    const code = (err instanceof Error && (err.cause as { code?: string } | undefined)?.code) || undefined;
    if (code === "23505") {
      return NextResponse.json({ error: `A redirect for ${fromPath} already exists` }, { status: 409 });
    }
    throw err;
  }

  invalidateRedirectsCache();
  await db.insert(auditLog).values({
    userId: null,
    userName: "publish-api",
    action: "redirect.create",
    entityType: "redirect",
    entityId: row.id,
    entityLabel: `${fromPath} -> ${toPath}`,
  });

  return NextResponse.json({ redirect: row });
}
