"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import type { FaqGroup } from "@/lib/faq";
import { getCategoryMeta } from "@/lib/site-categories";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";

/**
 * Client-side instant filter over the FAQ page's already-fetched groups —
 * same rationale as CategoryGuideSearch: the full set is small enough to
 * already be in memory, so filtering it as the visitor types beats a
 * server round-trip. Matches against both question and answer text, since
 * a visitor searching e.g. "withdrawal time" should find an answer whose
 * question doesn't literally contain that phrase. Category sections with
 * no remaining matches are hidden rather than shown empty.
 */
export function FaqSearch({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        faqs: group.faqs.filter(
          (faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.faqs.length > 0);
  }, [query, groups]);

  const totalMatches = filteredGroups.reduce((sum, g) => sum + g.faqs.length, 0);

  return (
    <div>
      <div className="group relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="h-12 rounded-full border-transparent bg-muted/60 pl-11 pr-10 text-base shadow-sm transition-shadow focus-visible:border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:shadow-md"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {query && (
        <p className="mb-6 text-sm text-muted-foreground">
          {totalMatches} question{totalMatches === 1 ? "" : "s"} found.
        </p>
      )}

      {filteredGroups.length === 0 ? (
        <p className="text-muted-foreground">No questions matched “{query}”.</p>
      ) : (
        <div className="space-y-10">
          {filteredGroups.map((group) => {
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
    </div>
  );
}
