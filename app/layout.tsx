import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL, DEFAULT_LOGO_URL, DEFAULT_FAVICON_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/settings";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/article/json-ld";
import { PageViewTracker } from "@/components/tracking/page-view-tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_SITE_TITLE = "UU7 — Gaming Guides, Betting Guides & Bonus Reviews";
const DEFAULT_META_DESCRIPTION =
  "Game guides, betting guides, bonus breakdowns, tutorials, and gaming statistics.";

// Async so branding (favicon) and global SEO (title/description/keywords/
// search-console verification) can be read from the DB. The homepage has no
// generateMetadata of its own — unlike posts/pages/categories/authors —
// so `default`/`description` here is effectively "the site's own SEO",
// same as buildMetadata()'s equivalent fallbacks are for everything else.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings?.siteTitle || DEFAULT_SITE_TITLE;
  const description = settings?.metaDescription || DEFAULT_META_DESCRIPTION;
  const canonical = settings?.canonicalUrl || SITE_URL;
  // Same site-wide default image Branding uses as every other page's OG
  // fallback (see buildMetadata()) — the homepage has no per-page SEO row
  // to fall back from, so this is the only source for it here.
  const socialImage = settings?.ogImageUrl || undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: "%s | UU7",
      default: title,
    },
    description,
    keywords: settings?.metaKeywords || undefined,
    alternates: { canonical },
    // Always set (never `undefined`) — favicon.ico now lives in /public,
    // not app/, specifically so this is the ONE place a favicon link comes
    // from; leaving it unset when no custom one is configured would mean
    // no favicon at all rather than falling back to the default.
    icons: { icon: settings?.faviconUrl || DEFAULT_FAVICON_URL },
    verification: settings?.googleSiteVerification
      ? { google: settings.googleSiteVerification }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: socialImage ? [{ url: socialImage }] : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      site: settings?.twitterHandle || undefined,
      title,
      description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const logoUrl = settings?.logoUrl || DEFAULT_LOGO_URL;
  const description = settings?.metaDescription || DEFAULT_META_DESCRIPTION;
  // JSON-LD needs a real absolute URL (unlike page `metadata`, it isn't
  // resolved against `metadataBase` automatically) — only prefix SITE_URL
  // for a relative path; an admin-entered logo could already be a full URL
  // on another host.
  const absoluteLogoUrl = /^https?:\/\//.test(logoUrl) ? logoUrl : `${SITE_URL}${encodeURI(logoUrl)}`;

  const organizationSchema = buildOrganizationSchema({
    name: "UU7",
    url: SITE_URL,
    logoUrl: absoluteLogoUrl,
    description,
    areaServed: "India",
  });
  const websiteSchema = buildWebsiteSchema({ name: "UU7", url: SITE_URL });

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <JsonLd blocks={[organizationSchema, websiteSchema]} />
        <PageViewTracker />
      </body>
    </html>
  );
}
