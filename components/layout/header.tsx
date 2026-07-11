"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronRight, Info, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CATEGORIES } from "@/lib/site-categories";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Reuses the same category list the homepage content sections use for their
// category badges (lib/site-categories.ts), plus an "About" entry that only
// makes sense as a nav link, not a post category — appended here rather
// than added to the shared list itself.
const CATEGORY_LINKS = [...SITE_CATEGORIES, { slug: "about", label: "About", href: "/about-uu7", icon: Info }];

// Fully transparent at the very top of the page — no tint of its own at
// all. This is deliberate: even painting the *same gradient formula* here
// as the Hero uses wouldn't actually look identical, because gradient
// percentages are relative to each element's own box size, and the header
// (a ~70px strip) and the Hero (hundreds of px tall) are wildly different
// sizes — the "same" gradient computed independently on each would visibly
// diverge. Instead of matching colors, this shows the literal same
// rendered pixels: the Hero (components/home/hero.tsx) bleeds its own
// background up behind the header via a negative margin, and with no tint
// here to alter it, what's behind the header IS the hero, not an
// approximation of it.
//
// Once scrolled, it morphs into a frosted-glass bar (translucent
// background + `backdrop-blur`) for legibility over whatever regular page
// content is now underneath it. `backdrop-filter` has a real, continuous
// per-frame cost for as long as it's engaged (see the git history on this
// file — it used to run unconditionally, which was a real contributor to
// site-wide scroll jank) — gating it behind `scrolled` means that cost is
// only paid once the user has actually scrolled, not on every page view.
//
// The scrolled/not-scrolled toggle uses an IntersectionObserver on a 1px
// sentinel, not a `scroll` event listener — the sentinel only fires a
// callback when it crosses the viewport edge (a handful of times per
// session), instead of a scroll handler running on every single scroll
// frame. The sentinel sits in normal document flow immediately before the
// sticky header, so it scrolls out of view (and flips `scrolled` to true)
// as soon as the page moves away from the very top.
//
// Below `md` the nav links were previously just `hidden` with no
// replacement at all — a real bug, not a design choice, since it left
// mobile/tablet visitors with literally no way to navigate to any category
// page from the header. The hamburger + full-screen menu below fixes that.
//
// Nav/hamburger text color is driven by a SEPARATE piece of state
// (`overHero`) from the glass background (`scrolled`), because they answer
// different questions. `scrolled` just means "not at the very top pixel" —
// fine for deciding whether to show the frosted-glass background at all.
// But the homepage's hero (components/home/hero.tsx) is a full-viewport-tall
// colored section, so the header spends a long stretch of scrolling still
// floating over orange hero pixels even once `scrolled` is already true —
// using `scrolled` for text color made the nav render in dark text over
// that orange background for most of the scroll through the hero, which is
// exactly the low-contrast bug this was meant to fix. `overHero` instead
// tracks the hero element itself (`#site-hero`) via IntersectionObserver,
// so text only switches to dark once the hero has genuinely scrolled out of
// view and there's real (light) page content behind the header. Pages
// without a hero (every route except "/") default `overHero` to `false` —
// checked synchronously from the pathname, not discovered after the fact by
// querying the DOM, so there's no flash of white-on-light text on first
// paint before an effect gets a chance to run.
export function SiteHeader({ logoUrl }: { logoUrl: string }) {
  const pathname = usePathname();
  const hasHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(hasHero);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // `overHero` is reset synchronously here on every `hasHero` change, not
  // just set up once when true — this header persists across client-side
  // navigations (Next keeps a shared layout's components mounted between
  // pages), so without an explicit reset, navigating away from "/" while
  // still white-text-mode (i.e. before scrolling past the hero) left
  // `overHero` stuck at `true` on the destination page, rendering white nav
  // text/hamburger icon on that page's plain background — invisible.
  useEffect(() => {
    if (!hasHero) {
      setOverHero(false);
      return;
    }
    const hero = document.getElementById("site-hero");
    if (!hero) {
      setOverHero(false);
      return;
    }
    setOverHero(true);
    const observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [hasHero]);

  return (
    <>
      {/* `absolute` (not static/in-flow) so this 1px marker can't add its
         own sliver of visible body background above the header — it still
         sits at document position 0 either way, which is all the
         IntersectionObserver above needs. */}
      <div ref={sentinelRef} aria-hidden className="absolute top-0 h-px w-full" />
      <header
        className={cn(
          "sticky top-0 z-50 transition-colors duration-300",
          scrolled && "border-b border-white/15 bg-white/10 shadow-sm backdrop-blur-xl backdrop-saturate-150",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-0.5 sm:py-1">
          <Link href="/" className="flex items-center" aria-label="UU7 home">
            {/* `unoptimized` — the logo can now be set to any arbitrary URL
               from Settings → Branding, not just the bundled default or a
               same-origin /uploads/ path, and next.config.ts has no
               `images.remotePatterns` configured for external domains. */}
            <Image src={logoUrl} alt="UU7" width={80} height={80} unoptimized className="rounded-md" priority />
          </Link>
          <nav
            className={cn(
              "hidden items-center gap-6 text-sm font-medium md:flex",
              overHero ? "text-white/90" : "text-foreground/80",
            )}
          >
            {CATEGORY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("transition-colors", overHero ? "hover:text-white" : "hover:text-brand")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className={cn("md:hidden", overHero ? "text-white/90 hover:text-white" : "text-foreground/80")}
          >
            <Menu className="size-6" />
          </Button>
        </div>
      </header>

      {/* The mobile menu deliberately doesn't reuse the site's neutral
         `bg-popover` sheet style — it repaints the exact hero gradient
         (components/home/hero.tsx) full-screen, so opening it feels like a
         continuation of the brand moment at the top of the site rather than
         a generic system sheet dropped on top of it. Each link gets its own
         icon in a translucent badge and a `hero-fade`/`hero-anim` staggered
         entrance (same animation utility the hero itself uses — see
         app/globals.css), rather than a plain list, to make the "knowledge
         hub" identity felt here too, not just on the homepage. */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 flex h-dvh w-full max-w-none flex-col content-start items-stretch justify-start gap-0 overflow-y-auto rounded-none border-0 bg-transparent p-0 text-white ring-0 translate-x-0 translate-y-0 sm:max-w-none"
          style={{
            background:
              "radial-gradient(circle at top center, #F76103 0%, #E44A02 35%, #C94102 65%, #B73601 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)",
            }}
          />

          <div className="relative flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              {/* No visible "UU7" / "Gaming Knowledge Hub" text here anymore
                 — the (now larger) logo carries the brand on its own. A
                 `DialogTitle` is still required for the dialog to have an
                 accessible name, so it's kept but visually hidden rather
                 than removed outright. */}
              <DialogTitle className="sr-only">Menu</DialogTitle>
              <Image src={logoUrl} alt="UU7" width={72} height={72} unoptimized className="rounded-md" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <X className="size-6" />
              </Button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col gap-1.5">
              {CATEGORY_LINKS.map((link, index) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "hero-anim hero-fade group flex items-center gap-4 rounded-2xl px-3.5 py-3.5 transition-colors",
                      active ? "bg-white/15" : "hover:bg-white/10",
                    )}
                    style={{ animationDelay: `${0.05 + index * 0.05}s` }}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <link.icon className="size-5" />
                    </span>
                    <span className="flex-1 text-base font-medium text-white">{link.label}</span>
                    <ChevronRight className="size-4 text-white/40 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </nav>

            <div className="hero-anim hero-fade border-t border-white/10 pt-4" style={{ animationDelay: "0.4s" }}>
              <p className="font-serif text-sm italic text-white/70">
                Researched rules, honest reviews, and straight answers — not marketing.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
