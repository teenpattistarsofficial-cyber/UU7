import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";
import { getRedirectFor } from "@/lib/redirects/cache";
import { getMaintenanceState } from "@/lib/maintenance-cache";
import { DEFAULT_LOGO_URL, DEFAULT_FAVICON_URL } from "@/lib/site";

const DEFAULT_MAINTENANCE_MESSAGE = "We'll be back shortly. Thanks for your patience.";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Raw HTML/CSS, not a React component — this has to render from the proxy
// layer itself, before any route/layout is reached, so it can't depend on
// Tailwind's build output or any component tree. Reuses the site's actual
// --brand token value and the same light/dark background tokens as
// app/globals.css (oklch() is supported natively by every browser Next 16
// targets) so it reads as the same product, not a generic error page.
// Self-contained on purpose — no Google Fonts / external script / analytics
// requests — a page whose entire job is "the server may be having a bad
// day" shouldn't itself depend on a third party being up.
function renderMaintenancePage(message: string, logoUrl: string, faviconUrl: string): string {
  const escapedMessage = escapeHtml(message);
  // Unlike next/image (which encodes automatically), a raw <img src>/<link
  // href> needs this done by hand — the default logo path has a literal
  // space in its filename ("UU7.io logo.webp"), which breaks unencoded.
  const escapedLogo = escapeHtml(encodeURI(logoUrl));
  const escapedFavicon = escapeHtml(encodeURI(faviconUrl));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta http-equiv="refresh" content="30"/>
<meta name="robots" content="noindex"/>
<title>Down for maintenance | UU7</title>
<link rel="icon" href="${escapedFavicon}"/>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100dvh; display: flex; align-items: center; justify-content: center;
    background: oklch(1 0 0); color: oklch(0.145 0 0);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 1.5rem;
  }
  .card {
    max-width: 26rem; width: 100%; text-align: center;
    background: oklch(0.98 0.002 260); border: 1px solid oklch(0 0 0 / 8%);
    border-radius: 1rem; padding: 2.75rem 2rem 2.25rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 20px 48px -24px rgba(0,0,0,0.25);
  }
  @media (prefers-color-scheme: dark) {
    body { background: oklch(0.145 0 0); color: oklch(0.985 0 0); }
    .card { background: oklch(0.21 0 0); border-color: oklch(1 0 0 / 10%); }
  }
  .logo { height: 36px; width: auto; margin: 0 auto 1.5rem; display: block; }
  .icon-wrap {
    width: 56px; height: 56px; margin: 0 auto 1.25rem; border-radius: 9999px;
    background: oklch(0.705 0.213 47.604 / 12%); display: flex; align-items: center; justify-content: center;
  }
  .icon { color: oklch(0.705 0.213 47.604); animation: spin 2s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  h1 { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.625rem; letter-spacing: -0.01em; }
  .message { color: oklch(0.556 0 0); line-height: 1.6; margin: 0 0 1.5rem; font-size: 0.9375rem; }
  .muted { color: oklch(0.556 0 0); font-size: 0.8125rem; margin: 0; }
</style>
</head>
<body>
  <div class="card">
    <img class="logo" src="${escapedLogo}" alt="UU7"/>
    <div class="icon-wrap">
      <svg class="icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>
    <h1>We&rsquo;ll be right back</h1>
    <p class="message">${escapedMessage}</p>
    <p class="muted">This page checks again automatically every 30 seconds.</p>
  </div>
</body>
</html>`;
}

// Cheap perimeter check only — cookie presence, no DB lookup. This keeps
// unauthenticated users out of /admin quickly, but it is NOT the
// authoritative auth check: every mutating server action / route handler
// must additionally call requireRole() from lib/auth/guards.ts, which does a
// real session lookup. See Next.js's Proxy docs: a matcher change or a
// Server Function moved to an unprotected route would otherwise silently
// lose auth coverage if Proxy were the only gate.
async function handleAdminAuth(request: NextRequest, pathname: string) {
  const sessionCookie = getSessionCookie(request);

  if (pathname === "/admin/login") {
    if (sessionCookie) {
      // A stale cookie (session revoked/deleted server-side — e.g. a
      // password reset via the seed script) still passes this presence
      // check. Blindly redirecting to /admin on that basis bounces straight
      // back here once app/(admin)/admin/(dashboard)/layout.tsx's own real
      // session lookup fails, which redirects to /admin/login again —
      // an infinite loop (ERR_TOO_MANY_REDIRECTS), since neither side ever
      // re-examines the cookie's actual validity. The login page loads
      // rarely (once per session, not on every admin request), so paying
      // for a real lookup here — unlike the cheap check below, which runs
      // on every /admin/* and /api/admin/* request — is affordable.
      const result = await auth.api.getSession({ headers: request.headers });
      if (result?.user) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
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

  // /api/auth/* must stay reachable no matter what — it's how an admin
  // signs in to /admin (still fully exempt, gated separately above) to turn
  // maintenance mode off again. Everyone else hits the maintenance page on
  // the public site while it's on — deliberately no session-cookie
  // exemption here, so a logged-in admin browsing the public pages sees
  // exactly what every other visitor sees.
  if (!pathname.startsWith("/api/auth")) {
    const maintenance = await getMaintenanceState();
    if (maintenance.enabled) {
      return new NextResponse(
        renderMaintenancePage(
          maintenance.message || DEFAULT_MAINTENANCE_MESSAGE,
          maintenance.logoUrl || DEFAULT_LOGO_URL,
          maintenance.faviconUrl || DEFAULT_FAVICON_URL,
        ),
        {
          status: 503,
          headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3600" },
        },
      );
    }
  }

  const redirect = await getRedirectFor(pathname);
  if (redirect) {
    return NextResponse.redirect(new URL(redirect.toPath, request.url), redirect.statusCode);
  }

  // Page-view tracking moved to a client-side beacon (see
  // components/tracking/page-view-tracker.tsx + app/api/track/pageview) —
  // this used to run here on every page response, but setting a Set-Cookie
  // header (for the anonymous visitor id) on every response makes Cloudflare
  // treat the whole page as private and never edge-cache it, and the
  // awaited DB insert added a blocking round-trip to every page load.
  // Neither cost belongs on the response path for a page that's otherwise
  // perfectly cacheable.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Everything else, minus static assets — anything with a file
    // extension (the logo, robots.txt, sitemap.xml, and any other /public
    // file) — that redirects/maintenance-mode should never intercept. Named
    // exclusions alone missed this: an admin-set logo path (or any other
    // /public asset referenced by path, e.g. the maintenance page's own
    // <img>) would otherwise get served the maintenance HTML instead of the
    // actual file while maintenance mode is on.
    "/((?!_next/static|_next/image|uploads/|.*\\..*).*)",
  ],
};
