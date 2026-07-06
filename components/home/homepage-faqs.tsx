// Pulled from featured pillar posts' own FAQ entries (see
// lib/home/featured-content.ts) — deliberately not carrying its own
// FAQPage JSON-LD here, since that schema already lives on each FAQ's
// source pillar page; duplicating it on the homepage too would be the same
// answer under two URLs' structured data rather than one clear source.
export function HomepageFaqs({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null;

  return (
    <section className="mb-16">
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
