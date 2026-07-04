import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { getRedirectFor } from "@/lib/redirects/cache";

// Cheap perimeter check only — cookie presence, no DB lookup. This keeps
// unauthenticated users out of /admin quickly, but it is NOT the
// authoritative auth check: every mutating server action / route handler
// must additionally call requireRole() from lib/auth/guards.ts, which does a
// real session lookup. See Next.js's Proxy docs: a matcher change or a
// Server Function moved to an unprotected route would otherwise silently
// lose auth coverage if Proxy were the only gate.
function handleAdminAuth(request: NextRequest, pathname: string) {
  const sessionCookie = getSessionCookie(request);

  if (pathname === "/admin/login") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Module 6 — checked against an in-memory, TTL-refreshed cache (see
// lib/redirects/cache.ts) rather than a DB hit on every public request.
// Proxy defaults to the Node.js runtime as of Next 16, so that in-memory
// state genuinely survives across requests in the same process.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return handleAdminAuth(request, pathname);
  }

  const redirect = await getRedirectFor(pathname);
  if (redirect) {
    return NextResponse.redirect(new URL(redirect.toPath, request.url), redirect.statusCode);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Everything else, minus static assets/metadata files that redirects
    // should never intercept.
    "/((?!_next/static|_next/image|uploads/|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
