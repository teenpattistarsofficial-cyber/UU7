import { ArrowUpRight } from "lucide-react";

/** The homepage-level version of the same "commercial mechanism" every
 * article's admin-authored CtaBlock already provides per-post
 * (components/article/cta-block.tsx) — a contextual, NOT-nofollowed link
 * to the main site, since passing authority there is this whole site's
 * reason for existing. Placed as the last section before the footer
 * (a closing moment, not a mid-page banner) and kept to one short line +
 * one button — anything louder would cut against the "not a marketing
 * site" positioning the About section right above it just made. */
export function SiteCta() {
  return (
    <section>
      <div className="overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/10 via-brand/[0.04] to-transparent p-8 text-center sm:p-12">
        <h2 className="font-heading text-xl font-bold sm:text-2xl">Ready to put it into practice?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Take what you&apos;ve learned to UU7GAME — real-money rummy, teen patti, slots, aviator, and live casino
          tables.
        </p>
        <a
          href="https://uu7stars.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-brand/90"
        >
          Visit UU7GAME
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
