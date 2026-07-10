import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { DEFAULT_LOGO_URL } from "@/lib/site";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { NotFoundContent } from "@/components/site/not-found-content";

// Root fallback for a path that matches no route pattern at all (e.g. a
// 3+ segment garbage URL) — the rare case, since every realistic 404 here
// (a mistyped/removed guide URL) actually matches [category]/page.tsx or
// [category]/[slug]/page.tsx, which explicitly call `notFound()` and are
// caught by app/(site)/not-found.tsx instead (inheriting the header/footer
// from that segment's layout automatically). This one sits outside that
// layout, so the header/footer are rendered manually instead.
export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

export default async function RootNotFound() {
  const settings = await getSiteSettings();
  const logoUrl = settings?.logoUrl || DEFAULT_LOGO_URL;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader logoUrl={logoUrl} />
      <div className="flex-1">
        <NotFoundContent />
      </div>
      <SiteFooter logoUrl={logoUrl} />
    </div>
  );
}
