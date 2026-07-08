import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getPublishedPageBySlug } from "@/lib/pages/get-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { CmsPageBody } from "@/components/site/cms-page";
import { PagePlaceholder } from "@/components/site/page-placeholder";

const SLUG = "editorial-policy";
const FALLBACK_TITLE = "Editorial Policy";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) return { title: FALLBACK_TITLE };
  return buildMetadata({ seo: result.seo, fallbackTitle: result.page.title, path: `/${SLUG}` });
}

export default async function EditorialPolicyPage() {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) {
    return (
      <PagePlaceholder
        eyebrow="How we work"
        icon={ShieldCheck}
        title={FALLBACK_TITLE}
        description="Our research process, review workflow, and source validation standards will be published here."
      />
    );
  }
  return (
    <CmsPageBody title={result.page.title} content={result.page.content} eyebrow="How we work" icon={ShieldCheck} />
  );
}
