import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Brand-orange hero with a single static hero image ("Base image
 * transparent.webp" — chips, cards, dice, rising smoke). This replaced an
 * earlier cursor-tracked reveal effect (a second image cross-faded in via a
 * canvas-generated mask redrawn on every mousemove frame): that mechanic
 * caused noticeable page lag, and a fast, low-jank site matters more here
 * than the interactive flourish. `.webp` was chosen over the `.png` used
 * during that earlier version for the same reason — it's ~80% smaller
 * (400KB vs 2.2MB) with the same real alpha transparency, so the section's
 * own gradient still shows through the image's transparent regions with no
 * color-matching or edge-fade masking needed. `next/image` (not a CSS
 * background) is deliberate too: it gets real responsive `srcset`s and
 * priority-preload treatment for what's the page's LCP element, rather than
 * shipping one full-size file to every viewport unconditionally. The
 * radial gradient below is kept as the section's own background so there's
 * no flash/mismatch before the image loads. The section is pulled up with a
 * negative top margin (and given matching extra top padding so the copy
 * doesn't visually shift) so this fill bleeds up behind the header — see
 * the note on that in components/layout/header.tsx: the header is
 * `position: sticky`, which only overlaps content once you scroll past it,
 * so at the initial scroll position there's normally nothing behind it for
 * its transparent/blur look to show. Text here is hardcoded to
 * white/white-on-white-tint rather than the usual theme-relative tokens,
 * since the brand orange background is the same regardless of light/dark
 * mode.
 *
 * Text layout, two tiers:
 *
 * - Below `xl` (under 1280px, phones and tablets): a plain centered stack —
 *   eyebrow, headline (the page's only real `<h1>`), paragraph, then the
 *   search bar — in normal document flow above the bottom-anchored image,
 *   per explicit request to move mobile/tablet text back to the top rather
 *   than the corner-anchored arrangement used on desktop. Font sizes ramp
 *   up slightly across `sm`/`md`/`lg` since there's more width to use on a
 *   tablet than a phone, but the layout itself (centered stack, image below)
 *   is identical at every width in this tier.
 *
 * - `xl` and up (1280px+, desktop): the corner-split layout — eyebrow +
 *   headline right-aligned in the bottom-right corner, and the paragraph
 *   left-aligned and vertically centered on the left edge with a thin
 *   horizontal line trailing to a dot beside it (echoing a reference
 *   design's "Crafted in Lagos." caption) — a deliberate break from the
 *   hero's otherwise-centered symmetry, per earlier explicit request. The
 *   `min-[1440px]:` step on the headline block exists because the desktop
 *   sizes/offsets here (e.g. `text-7xl`) were tuned against a 1440px
 *   screenshot and overlapped the card imagery right at the `xl`/1280px
 *   breakpoint itself (a common laptop width, e.g. 1280×800) — so `xl`
 *   holds a smaller in-between size and 1440px+ holds the tuned one.
 *   Because this tier's headline is a visual duplicate of the mobile/tablet
 *   block's, it's a `<p>` here, not a second `<h1>` — see the comment on
 *   that block below for why it must not be `aria-hidden` either.
 *
 * Three separate DOM blocks (mobile/tablet stack + desktop paragraph corner
 * + desktop headline corner), toggled with `xl:hidden` / `hidden xl:flex` /
 * `hidden xl:block`, rather than trying to make one set of position math
 * responsive across every layout.
 *
 * The image is anchored to the BOTTOM of the section (`items-end` below)
 * instead of vertically centered, so the top stays visually clear for the
 * search bar (and, below `xl`, the text stack above it). Its own height is
 * responsive too — smaller below `xl` (75% on phones ramping to 90% on
 * tablet) than the `xl:h-[110%]` used at 1280px and up; this sizing is
 * deliberately left as-is here (not part of this pass's changes). `vignette`
 * is a soft corner-darkening layer over the flat radial gradient for extra
 * depth. An SVG-noise grain layer used to sit here too, blended in with
 * `mix-blend-mode: overlay` — removed for performance: `mix-blend-mode`
 * forces the browser to recompute that blend against everything beneath it
 * (the animating headline included) across this entire, very tall section,
 * and was a real contributor to the hero's reported lag alongside the
 * sticky header's `backdrop-blur` (see components/layout/header.tsx). The
 * vignette below has no blend mode — it's a plain alpha-composited
 * gradient, essentially free by comparison. */
export function Hero() {
  return (
    <section
      id="site-hero"
      // -mt/pt must match the header's real rendered height (88px: a 64px
      // logo plus header's own py-3) or the hero's pull-up under-shoots and
      // leaves a sliver of plain body background peeking through the
      // transparent header at the very top of the page — this exact gap
      // reappeared after the logo grew from 48px to 64px because this value
      // was still sized for the old, shorter header.
      className="relative -mt-[88px] overflow-hidden pt-[88px]"
      style={{
        background:
          "radial-gradient(circle at top center, #F76103 0%, #E44A02 35%, #C94102 65%, #B73601 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.32) 100%)",
        }}
      />

      <div className="absolute inset-0 z-0 flex items-end justify-center">
        <div className="relative h-[75%] sm:h-[80%] md:h-[85%] lg:h-[90%] xl:h-[110%]" style={{ aspectRatio: "1023 / 1537" }}>
          <Image
            src="/Base image transparent.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 90vw, 700px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[max(700px,100dvh)] max-w-4xl flex-col items-center px-4 pt-16 text-center sm:pt-24">
        <div className="xl:hidden">
          <p
            className="hero-anim hero-fade mb-3 text-xs font-medium tracking-[0.25em] text-white/70 uppercase sm:text-sm [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]"
            style={{ animationDelay: "0.15s" }}
          >
            India&apos;s Gaming Knowledge Hub
          </p>

          {/* The line break is at "you" / "can", not "actually" / "trust"
             like the desktop corner block below — a more even split (2 short
             lines instead of one long line + one short word) leaves enough
             spare width per line to size the text meaningfully larger here
             while still guaranteeing exactly two lines (measured, not
             eyeballed: `text-4xl`/`text-5xl`/`text-6xl` are comfortably under
             the largest safe size at, respectively, the narrowest phone
             (360px), `sm` (640px), and `md` (768px+) widths — the original
             one-long-line split left far less headroom, forcing much
             smaller text to avoid a third line). Same sentence either way,
             so this doesn't affect the text content, just where it visually
             wraps. The `[@media(max-height:500px)]:` overrides below
             additionally cap the size regardless of width — a phone in
             landscape (e.g. 844×390) is just as narrow-in-height as it is
             wide, but a pure width breakpoint like `md:` reads it as
             tablet-width and applies the larger tablet sizes, which pushed
             the search bar and image below the fold on load. */}
          <h1 className="mb-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:text-2xl">
            <span className="hero-anim hero-reveal block" style={{ animationDelay: "0.3s" }}>
              Gaming guides you
            </span>
            <span className="hero-anim hero-reveal block" style={{ animationDelay: "0.45s" }}>
              can actually trust
            </span>
          </h1>

          <p
            className="hero-anim hero-fade mx-auto mb-8 max-w-sm font-serif text-base italic text-white/80 sm:max-w-md md:text-lg [@media(max-height:500px)]:mb-3 [@media(max-height:500px)]:max-w-xs [@media(max-height:500px)]:text-xs"
            style={{ animationDelay: "0.6s" }}
          >
            Rummy, Teen Patti, Slots, Aviator, and Live Casino — researched rules, honest reviews, and
            straight answers, not marketing.
          </p>
        </div>

        <form
          action="/search"
          className="hero-anim hero-fade mx-auto flex w-full max-w-md items-center gap-1.5 rounded-full bg-white p-1.5 shadow-lg"
          style={{ animationDelay: "0.75s" }}
        >
          <Search className="ml-2 size-4 shrink-0 text-black/40" />
          <Input
            name="q"
            placeholder="Search guides…"
            className="border-0 bg-transparent text-black shadow-none placeholder:text-black/40 focus-visible:ring-0"
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            <Search className="size-4" />
          </Button>
        </form>
      </div>

      {/* Desktop only — paragraph with trailing line+dot, left edge, vertically centered. */}
      <div className="absolute top-1/2 left-48 z-10 hidden -translate-y-1/2 items-start gap-2 sm:left-64 xl:flex">
        <p
          className="hero-anim hero-fade w-72 shrink-0 font-serif text-2xl text-left italic text-white/80"
          style={{ animationDelay: "0.6s" }}
        >
          Rummy, Teen Patti, Slots, Aviator, and Live Casino — researched rules, honest reviews, and
          straight answers, not marketing.
        </p>
        <svg
          viewBox="0 0 120 80"
          fill="none"
          className="hero-anim hero-fade mt-2 h-auto w-[120px] shrink-0"
          style={{ animationDelay: "0.7s" }}
        >
          <path d="M0 6 H50 L104 62" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="106" cy="64" r="3" fill="white" fillOpacity="0.7" />
        </svg>
      </div>

      {/* Desktop only — eyebrow + headline, right edge, bottom corner. */}
      <div className="absolute right-4 bottom-40 z-10 hidden max-w-sm text-right xl:block xl:right-14 xl:bottom-66 min-[1440px]:right-16 min-[1440px]:bottom-64 min-[1440px]:max-w-lg">
        <p
          className="hero-anim hero-fade mb-4 text-xs font-medium tracking-[0.25em] text-white/70 uppercase min-[1440px]:text-sm"
          style={{ animationDelay: "0.15s" }}
        >
          India&apos;s Gaming Knowledge Hub
        </p>

        {/* Not an <h1> — the real one is in the xl:hidden mobile/tablet block
           above. Google indexes the mobile rendering first, so that's where
           the actual heading element needs to live; this is a visually
           identical stand-in for desktop viewports, styled as a heading
           without duplicating the document's <h1>. No aria-hidden here —
           `xl:hidden`/`hidden xl:block` already remove whichever of the two
           blocks is inactive from the accessibility tree at any given
           viewport width (that's what `display: none` does), so at any one
           time exactly one heading is both visible and announced;
           aria-hiding this one too would leave desktop screen-reader users
           with no heading at all. */}
        <p className="text-5xl font-semibold leading-[0.95] tracking-tight text-white min-[1440px]:text-7xl">
          <span className="hero-anim hero-reveal block" style={{ animationDelay: "0.3s" }}>
            Gaming guides you can actually
          </span>
          <span className="hero-anim hero-reveal block" style={{ animationDelay: "0.45s" }}>
            trust
          </span>
        </p>
      </div>
    </section>
  );
}
