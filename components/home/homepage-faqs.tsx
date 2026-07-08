import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/home/section-heading";

// Pulled from featured pillar posts' own FAQ entries (see
// lib/home/featured-content.ts) — a small curated subset, deliberately
// distinct from the full, every-published-post list on the standalone
// /faq page (lib/faq.ts) that the CTA below links to. Not carrying its own
// FAQPage JSON-LD here either, since that schema already lives on each
// FAQ's source pillar page; duplicating it on the homepage too would be
// the same answer under two URLs' structured data rather than one clear
// source.
export function HomepageFaqs({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null;

  return (
    <section className="mb-20">
      <SectionHeading
        eyebrow="Straight answers"
        title="Frequently Asked Questions"
        description="Pulled straight from our guides — the same questions players actually ask us."
      />
      <Accordion>
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={i}>
            <AccordionTrigger number={i + 1}>{faq.question}</AccordionTrigger>
            <AccordionPanel number={i + 1}>
              <p className="text-muted-foreground">{faq.answer}</p>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-6 text-center">
        <Link
          href="/faq"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
        >
          View all FAQs
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
