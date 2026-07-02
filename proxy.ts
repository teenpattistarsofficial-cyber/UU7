import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Cheap perimeter check only — cookie presence, no DB lookup. This keeps
// unauthenticated users out of /admin quickly, but it is NOT the
// authoritative auth check: every mutating server action / route handler
// must additionally call requireRole() from lib/auth/guards.ts, which does a
// real session lookup. See Next.js's Proxy docs: a matcher change or a
// Server Function moved to an unprotected route would otherwise silently
// lose auth coverage if Proxy were the only gate.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
