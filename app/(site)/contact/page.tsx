import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getPublishedPageBySlug } from "@/lib/pages/get-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { CmsPageBody } from "@/components/site/cms-page";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { ContactChannels } from "@/components/site/contact-channels";

const SLUG = "contact";
const FALLBACK_TITLE = "Contact";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) return { title: FALLBACK_TITLE };
  return buildMetadata({ seo: result.seo, fallbackTitle: result.page.title, path: `/${SLUG}` });
}

// Bespoke centered layout rather than the shared PagePlaceholder (used
// as-is by about/editorial-policy/responsible-gaming) — Telegram is a real,
// permanent contact channel rather than "not published yet" filler, so this
// page gets its own standard contact-page treatment even before an editor
// publishes a CMS "contact" row.
export default async function ContactPage() {
  const result = await getPublishedPageBySlug(SLUG);

  if (!result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: FALLBACK_TITLE }]} />

        <div className="text-center">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Mail className="size-6" />
          </span>
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">Get in touch</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{FALLBACK_TITLE}</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Have a question about a guide, spotted something that needs correcting, or just want to say hi? We&apos;re
            easiest to reach on Telegram.
          </p>
        </div>

        <ContactChannels />
      </div>
    );
  }

  return (
    <CmsPageBody title={result.page.title} content={result.page.content} eyebrow="Get in touch" icon={Mail}>
      <ContactChannels />
    </CmsPageBody>
  );
}
