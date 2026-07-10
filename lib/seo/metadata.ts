import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";

type SeoMetaRow = {
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  robotsIndex?: boolean | null;
  robotsFollow?: boolean | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
} | null | undefined;

/** Turns a seo_meta row (Modules 1 + 4) into a Next.js Metadata object,
 * falling back to the entity's own title/excerpt when a field was left
 * blank in the editor. `fallbackImage` (e.g. a post's cover image) is used
 * for the social preview when no custom OG image was set — resolved
 * against `metadataBase` in the root layout, so a relative `/uploads/...`
 * path works here same as an absolute URL. If neither is set either, falls
 * back to the site-wide default social image from Settings → Branding,
 * so a page never ships a bare, image-less social card just because no one
 * ever set a per-page image. Async (every caller already awaits/returns it
 * from an async generateMetadata) for that one extra lookup — cached via
 * getSiteSettings()'s cache() wrapper, so this doesn't add a real query per
 * call within the same request. */
export async function buildMetadata({
  seo,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  path,
}: {
  seo: SeoMetaRow;
  fallbackTitle: string;
  fallbackDescription?: string | null;
  fallbackImage?: string | null;
  path: string;
}): Promise<Metadata> {
  const siteSettingsRow = await getSiteSettings();
  const title = seo?.seoTitle || fallbackTitle;
  const description =
    seo?.metaDescription || fallbackDescription || siteSettingsRow?.metaDescription || undefined;
  const canonical = seo?.canonicalUrl || path;
  const robotsIndex = seo?.robotsIndex ?? true;
  const robotsFollow = seo?.robotsFollow ?? true;
  const socialImage = seo?.ogImageUrl || fallbackImage || siteSettingsRow?.ogImageUrl || undefined;

  return {
    title,
    description,
    keywords: siteSettingsRow?.metaKeywords || undefined,
    alternates: { canonical },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: canonical,
      type: "article",
      images: socialImage ? [{ url: socialImage }] : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      site: siteSettingsRow?.twitterHandle || undefined,
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}
