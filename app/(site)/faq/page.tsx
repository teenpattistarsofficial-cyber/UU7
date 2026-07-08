import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CircleHelp } from "lucide-react";
import { getAllFaqsByCategory } from "@/lib/faq";
import { getCategoryMeta } from "@/lib/site-categories";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Straight answers to the questions players actually ask us about games, betting, and bonuses.",
};

// This route has no params, so without `force-dynamic` Next would try to
// statically prerender it (including at `next build` time, requiring a
// live DATABASE_URL in the Docker build) — same class of fix as the
// homepage/authors/sitemap routes.
export const dynamic = "force-dynamic";

// Deliberately no FAQPage JSON-LD here — every one of these questions
// already carries that schema on its source article (see FaqSection's own
// comment for the same reasoning): duplicating it here would just be the
// same answer under two URLs' structured data instead of one clear source.
export default async function FaqPage() {
  const groups = await getAllFaqsByCategory();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <div className="mb-10 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <CircleHelp className="size-6" />
        </span>
        <div>
          <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-brand uppercase">Straight answers</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Pulled straight from our guides — the same questions players actually ask us, answered in one place.
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground">No published FAQs yet — check back soon.</p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const Icon = getCategoryMeta(group.categorySlug, group.categoryLabel).icon;
            return (
              <section key={group.categorySlug}>
                <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
                  {Icon && <Icon className="size-4 text-brand" />}
                  {group.categoryLabel}
                </h2>
                <Accordion>
                  {group.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={i}>
                      <AccordionTrigger number={i + 1}>{faq.question}</AccordionTrigger>
                      <AccordionPanel number={i + 1}>
                        <p className="text-muted-foreground">{faq.answer}</p>
                        <Link
                          href={faq.sourceUrl}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                        >
                          From: {faq.sourceTitle}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/10 via-brand/[0.04] to-transparent p-6 text-center sm:p-8">
        <h3 className="font-heading text-lg font-bold sm:text-xl">Didn&apos;t find your answer?</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
          Browse our full library of game and betting guides for the deeper detail behind these quick answers.
        </p>
        <Link
          href="/game-guides"
          className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-brand/90"
        >
          Browse guides
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
