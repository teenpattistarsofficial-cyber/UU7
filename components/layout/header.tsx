import Link from "next/link";
import Image from "next/image";

const CATEGORY_LINKS = [
  { href: "/game-guides", label: "Game Guides" },
  { href: "/betting-guides", label: "Betting Guides" },
  { href: "/bonuses", label: "Bonuses" },
  { href: "/app-tutorials", label: "App Tutorials" },
  { href: "/statistics-reports", label: "Statistics & Reports" },
];

// Fully transparent — no tint of its own at all. This is deliberate: even
// painting the *same gradient formula* here as the Hero uses wouldn't
// actually look identical, because gradient percentages are relative to
// each element's own box size, and the header (a ~70px strip) and the Hero
// (hundreds of px tall) are wildly different sizes — the "same" gradient
// computed independently on each would visibly diverge. Instead of
// matching colors, this shows the literal same rendered pixels: the Hero
// (components/home/hero.tsx) bleeds its own background up behind the
// header via a negative margin, and with no tint here to alter it, what's
// behind the header IS the hero, not an approximation of it. backdrop-blur
// is kept for when the header overlaps other scrolled content further down
// the page — it has no visible effect over the hero's smooth gradient
// specifically, since blurring a smooth gradient looks the same as the
// gradient itself.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <Link href="/" className="flex items-center" aria-label="UU7 home">
          <Image src="/UU7.io logo.webp" alt="UU7" width={48} height={48} className="rounded-md" priority />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
          {CATEGORY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand">
              {link.label}
            </Link>
          ))}
          <Link href="/about" className="transition-colors hover:text-brand">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
