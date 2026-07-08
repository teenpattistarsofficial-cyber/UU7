import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { getPublishedPageBySlug } from "@/lib/pages/get-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { CmsPageBody } from "@/components/site/cms-page";
import { PagePlaceholder } from "@/components/site/page-placeholder";

const SLUG = "responsible-gaming";
const FALLBACK_TITLE = "Responsible Gaming";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) return { title: FALLBACK_TITLE };
  return buildMetadata({ seo: result.seo, fallbackTitle: result.page.title, path: `/${SLUG}` });
}

export default async function ResponsibleGamingPage() {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) {
    return (
      <PagePlaceholder
        eyebrow="Play safe"
        icon={HeartHandshake}
        title={FALLBACK_TITLE}
        description="Safe play guidelines, age restrictions, and risk awareness content will be published here."
      />
    );
  }
  return (
    <CmsPageBody title={result.page.title} content={result.page.content} eyebrow="Play safe" icon={HeartHandshake} />
  );
}
