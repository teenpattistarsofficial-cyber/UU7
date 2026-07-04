/** Module 11 public render — plain Q&A list (no client-side accordion JS
 * needed; the FAQPage JSON-LD is emitted separately via <JsonLd>). */
export function FaqSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-xl font-semibold">Frequently Asked Questions</h2>
      <dl className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i}>
            <dt className="font-medium">{faq.question}</dt>
            <dd className="mt-1 text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
