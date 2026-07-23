import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Brand-orange hero with a full-bleed photographic background
 * ("hero-casino-table.webp" — poker chips, red dice, and a card hand on a
 * dark felt table; sourced from Pexels, free-to-use/no-attribution-required
 * license, same as the site's post cover images). This replaced an earlier
 * transparent-cutout graphic (chips/cards floating on a flat gradient,
 * object-contain) per explicit request to bring back a real full-bleed cover
 * photo like the original pre-redesign hero — that cutout couldn't do this
 * on its own since it's a tall portrait asset with mostly-empty margins, not
 * a frame composed for a wide background fill. `next/image` (not a CSS
 * background) is deliberate too: it gets real responsive `srcset`s and
 * `loading="eager"` + `fetchPriority="high"` treatment for what's the
 * page's LCP element (Next 16 deprecated the old `priority` prop, which no
 * longer sets `fetchpriority` on its own — see the bundled Image docs),
 * rather than shipping one full-size file to every viewport unconditionally. The
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
 * The photo fills the entire section (`absolute inset-0` + `object-cover`)
 * behind every layout tier, including mobile, where text now sits directly
 * over it rather than in the clear gradient-only space above a
 * bottom-anchored graphic like the previous design had. That's why the
 * scrim below is a full-section dark gradient, not just a corner vignette —
 * a busy photo needs real contrast under white text everywhere, not just at
 * the edges. An SVG-noise grain layer used to sit here too, blended in with
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
      // -mt/pt must match the header's real rendered height or the hero's
      // pull-up under-shoots and leaves a sliver of plain body background
      // peeking through the transparent header at the very top of the page
      // — this exact gap has reappeared more than once after the header's
      // logo size or padding changed and this value wasn't updated to
      // match. Two tiers because the header's own padding is responsive
      // (py-0.5 below `sm`, py-1 from `sm` up) while the 80px logo stays
      // fixed: 84px below `sm` (80 + 2*2px), 88px from `sm` up (80 + 2*4px).
      className="relative -mt-[84px] overflow-hidden pt-[84px] sm:-mt-[88px] sm:pt-[88px]"
      style={{
        background:
          "radial-gradient(circle at top center, #F76103 0%, #E44A02 35%, #C94102 65%, #B73601 100%)",
      }}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-casino-table.webp"
          alt="Poker chips, red dice, and a card hand on a dark casino table"
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover brightness-[0.55]"
        />
      </div>

      {/* Full-section dark scrim, not just a corner vignette — text now sits
         directly over the photo at every breakpoint (see the note above),
         so contrast has to hold everywhere text can appear, not just the
         edges. Stronger at the very top/bottom (search bar, headline,
         paragraph all cluster there) than the vertical center, where the
         photo's own dark felt background already gives some natural
         contrast. */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,8,0,0.55) 0%, rgba(20,8,0,0.25) 25%, rgba(20,8,0,0.3) 75%, rgba(20,8,0,0.6) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-30"
        // Plain alpha-composited tint, no blend mode — see the note further
        // down about mix-blend-mode being removed from this section for
        // performance (it forces a recompute against everything beneath it,
        // across this entire tall section, on every paint).
        style={{ background: "rgba(199,65,2,0.35)" }}
      />

      {/* Below `sm` (phones), a flat `600px` floor instead of the
         full-viewport `max(700px,100dvh)` used from `sm` up — the text+
         search content only naturally needs ~330px, so forcing the section
         to fill the entire phone screen (often 800px+) just added a long
         stretch of nothing-but-image scroll distance before the next
         section, which read as the hero being too long. `sm` and up are
         unchanged. */}
      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-4xl flex-col items-center px-4 pt-16 text-center sm:min-h-[max(700px,100dvh)] sm:pt-24">
        <div className="xl:hidden">
          <p
            className="hero-anim hero-fade mb-3 text-xs font-medium tracking-[0.25em] text-white/70 uppercase sm:text-sm [@media(max-height:500px)]:mb-1 [@media(max-height:500px)]:text-[10px]"
            style={{ animationDelay: "0.15s" }}
          >
            India&apos;s Gaming Knowledge Hub
          </p>

          {/* The line break is at "gaming" / "guides", not "can" / "trust"
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
              Real-money gaming
            </span>
            <span className="hero-anim hero-reveal block" style={{ animationDelay: "0.45s" }}>
              guides you can trust
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
          <Button
            type="submit"
            size="icon"
            aria-label="Search"
            className="shrink-0 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          >
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
            Real-money gaming guides
          </span>
          <span className="hero-anim hero-reveal block" style={{ animationDelay: "0.45s" }}>
            you can trust
          </span>
        </p>
      </div>
    </section>
  );
}
