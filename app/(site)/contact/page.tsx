import type { Metadata } from "next";
import { getPublishedPageBySlug } from "@/lib/pages/get-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { CmsPageBody } from "@/components/site/cms-page";

const SLUG = "contact";
const FALLBACK_TITLE = "Contact";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) return { title: FALLBACK_TITLE };
  return buildMetadata({ seo: result.seo, fallbackTitle: result.page.title, path: `/${SLUG}` });
}

export default async function ContactPage() {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-semibold">{FALLBACK_TITLE}</h1>
        <p className="text-muted-foreground">A contact form lands here in a later phase.</p>
      </div>
    );
  }
  return <CmsPageBody title={result.page.title} content={result.page.content} />;
}
