import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getPublishedPageBySlug } from "@/lib/pages/get-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { CmsPageBody } from "@/components/site/cms-page";
import { PagePlaceholder } from "@/components/site/page-placeholder";

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
      <PagePlaceholder
        eyebrow="Get in touch"
        icon={Mail}
        title={FALLBACK_TITLE}
        description="A contact form lands here in a later phase."
      />
    );
  }
  return <CmsPageBody title={result.page.title} content={result.page.content} eyebrow="Get in touch" icon={Mail} />;
}
