import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/home/hero-visual";

/** Full-bleed hero band with a single smooth brand gradient — deliberately
 * just two color stops (no middle stop) so the fade rate never changes
 * partway through, which is what caused a visible "kink"/band in an
 * earlier version. One soft white glow provides the only extra light
 * accent, positioned in the same corner the gradient is already strongest
 * so it reads as one consistent light source rather than two competing
 * colors. The section is pulled up with a negative top margin (and given
 * matching extra top padding so the actual copy doesn't visually shift) so
 * its background bleeds up behind the header — see the note on that in
 * components/layout/header.tsx for why that matters: the header is
 * `position: sticky`, which only overlaps content once you scroll past it,
 * so at the initial scroll position there's normally nothing behind it for
 * a glass/blur effect to show. */
export function Hero() {
  return (
    <section
      className="relative -mt-20 overflow-hidden pt-20"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--brand) 28%, var(--background)) 0%, var(--background) 80%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-white/30 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2 lg:gap-8">
        <div className="text-center lg:text-left">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            🎮 India&apos;s Gaming Knowledge Hub
          </span>
          <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:mx-0">
            Gaming guides you can actually <span className="text-brand">trust</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground lg:mx-0">
            Rummy, Teen Patti, Slots, Aviator, and Live Casino — researched rules, honest reviews, and
            straight answers, not marketing.
          </p>
          <form
            action="/search"
            className="mx-auto flex max-w-md items-center gap-1.5 rounded-full border border-border bg-card/80 p-1.5 shadow-sm backdrop-blur lg:mx-0"
          >
            <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search guides…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="submit" size="icon" className="shrink-0 rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
              <Search className="size-4" />
            </Button>
          </form>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
