"use client";

import { ArrowUpRight } from "lucide-react";
import { trackCtaClick } from "@/lib/tracking/track-cta-click";

export type CtaData = { id: string; heading: string; description: string | null; buttonText: string; buttonUrl: string };

/** The actual commercial mechanism this whole site exists for — contextual
 * links to the main site. Deliberately NOT nofollowed (unlike
 * SourceCitations' external links) since passing authority is the point.
 * Now styled around `--brand` (globally defined since the homepage
 * redesign, not admin-only as the old comment here claimed) rather than
 * the neutral `--primary` every other button on the site uses — this is
 * the one in-article moment that's explicitly a brand/conversion moment,
 * same reasoning as the hero and header hover states.
 *
 * Client component (was a server component) only so the click can be
 * tracked (Dashboard's "Top CTA Events") — the actual navigation still
 * happens via a plain `<a>`, tracking just rides along via sendBeacon. */
export function CtaBlock({ id, heading, description, buttonText, buttonUrl }: CtaData) {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/10 via-brand/[0.04] to-transparent p-6 text-center sm:p-8">
      <h3 className="font-heading text-lg font-bold sm:text-xl">{heading}</h3>
      {description && <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>}
      <a
        href={buttonUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCtaClick(id, heading)}
        className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-brand/90"
      >
        {buttonText}
        <ArrowUpRight className="size-4" />
      </a>
    </div>
  );
}
