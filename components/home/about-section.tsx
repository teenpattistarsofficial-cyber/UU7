import Link from "next/link";
import { ArrowRight, Eye, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { SITE_CATEGORIES } from "@/lib/site-categories";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Fact-checked against real gameplay" },
  { icon: Sparkles, label: "No marketing dressed up as advice" },
  { icon: RefreshCw, label: "Reviewed and updated, not left stale" },
  { icon: Eye, label: "Commercial relationships disclosed, not hidden" },
];

/** Homepage teaser for the full About page — deliberately distinct copy
 * from about/page.tsx's own paragraphs (not a repeat of it), since its job
 * is to build enough trust and substance to earn the click through to
 * /about-uu7, not to restate the whole editorial methodology inline. The
 * second column reuses the same category list the header/footer nav
 * already draw from (lib/site-categories.ts) as a lightweight "what we
 * actually cover" list — real, useful content rather than a decorative
 * filler graphic. */
export function AboutSection() {
  return (
    <section className="mb-20">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow="Who we are" title="A gaming knowledge hub, not a marketing site" className="mb-4" />

          <p className="max-w-xl text-muted-foreground">
            Most gaming content online falls into one of two camps: marketing dressed up as advice, or forum-grade
            guesswork with no editorial process behind it. UU7 is our attempt at a third option — explaining how
            card games, slots, and gaming apps actually work, so you can make your own call instead of taking an
            ad&apos;s word for it.
          </p>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Every guide is checked against how a game actually plays, not copied from another site — and where
            we haven&apos;t been able to verify a detail about a specific platform, we say so rather than guess.
          </p>

          <ul className="mt-6 mb-8 flex flex-wrap gap-x-6 gap-y-3">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-foreground/80">
                <Icon className="size-4 shrink-0 text-brand" />
                {label}
              </li>
            ))}
          </ul>

          <Link
            href="/about-uu7"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-brand/90"
          >
            Learn more about us
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-brand uppercase">What we cover</p>
          <ul className="space-y-1">
            {SITE_CATEGORIES.map((category) => (
              <li key={category.href}>
                <Link
                  href={category.href}
                  className="group flex items-center gap-3 border-b border-border/60 py-3.5 last:border-b-0"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <category.icon className="size-4" />
                  </span>
                  <span className="font-medium group-hover:text-brand">{category.label}</span>
                  <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
