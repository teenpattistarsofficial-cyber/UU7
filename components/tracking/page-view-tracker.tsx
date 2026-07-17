"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/tracking/track-page-view";

// Rendered once in the root layout — fires a best-effort beacon on the
// initial load and every client-side route change. Replaces the old
// proxy.ts middleware tracking, which ran a blocking DB insert and set a
// cookie on every single page response, defeating Cloudflare's ability to
// cache any HTML page at all (a Set-Cookie header makes a CDN treat the
// response as private, regardless of what the actual content looks like).
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
