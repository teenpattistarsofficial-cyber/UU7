/** Pure JSON-LD builder functions (Module 10) — kept as plain objects so
 * callers can combine multiple blocks into one `@graph` and render them
 * with a single <JsonLd> script tag. */
export function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema({
  headline,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
}: {
  headline: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  datePublished?: Date | null;
  dateModified?: Date | null;
  authorName?: string | null;
  authorUrl?: string | null;
}) {
  return {
    "@type": "Article",
    headline,
    description: description || undefined,
    mainEntityOfPage: url,
    image: imageUrl || undefined,
    datePublished: datePublished ? datePublished.toISOString() : undefined,
    dateModified: dateModified ? dateModified.toISOString() : undefined,
    author: authorName ? { "@type": "Person", name: authorName, url: authorUrl || undefined } : undefined,
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  if (items.length === 0) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildPersonSchema({
  name,
  url,
  jobTitle,
  description,
  imageUrl,
  sameAs,
}: {
  name: string;
  url: string;
  jobTitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sameAs?: string[];
}) {
  return {
    "@type": "Person",
    name,
    url,
    jobTitle: jobTitle || undefined,
    description: description || undefined,
    image: imageUrl || undefined,
    sameAs: sameAs && sameAs.length > 0 ? sameAs : undefined,
  };
}

export function buildOrganizationSchema({
  name,
  url,
  logoUrl,
  description,
}: {
  name: string;
  url: string;
  logoUrl?: string | null;
  description?: string | null;
}) {
  return {
    "@type": "Organization",
    name,
    url,
    logo: logoUrl || undefined,
    description: description || undefined,
  };
}

// No SearchAction — there's no /search route yet, and advertising one that
// 404s is worse than omitting it. Add `potentialAction` once a real search
// page exists.
export function buildWebsiteSchema({ name, url }: { name: string; url: string }) {
  return {
    "@type": "WebSite",
    name,
    url,
  };
}
