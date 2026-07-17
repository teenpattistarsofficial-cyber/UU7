import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logPageView } from "@/lib/tracking/log-page-view";

export const runtime = "nodejs";

const VISITOR_COOKIE = "uu7_vid";

// Fired by the client-side PageViewTracker on every route change — moved
// out of proxy.ts (which used to run this + set the cookie on every single
// page response) because a Set-Cookie header on a page response makes
// Cloudflare treat it as private and never edge-cache it, and the awaited
// DB insert added a blocking round-trip to every page load. This route is
// already expected to be uncached/dynamic, so neither cost lands on the
// actual page response anymore.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : null;
  if (!path) {
    return new Response(null, { status: 400 });
  }

  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const response = new NextResponse(null, { status: 204 });
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  await logPageView({
    path,
    visitorId,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    userAgent: request.headers.get("user-agent"),
  });

  return response;
}
