import { CircleHelp } from "lucide-react";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";

/** Module 11 public render — now a real expand/collapse accordion (same
 * component the homepage FAQ section uses), not a static list. The
 * FAQPage JSON-LD is still emitted separately via <JsonLd> either way, and
 * collapsed answers stay in the rendered HTML (just visually hidden), so
 * this doesn't change what search engines or AI crawlers can read — it's
 * a UX change, not an SEO one. */
export function FaqSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <CircleHelp className="size-5 text-brand" />
        Frequently Asked Questions
      </h2>
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
    </section>
  );
}
