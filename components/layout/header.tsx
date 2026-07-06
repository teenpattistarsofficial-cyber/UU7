import Link from "next/link";
import Image from "next/image";

const CATEGORY_LINKS = [
  { href: "/game-guides", label: "Game Guides" },
  { href: "/betting-guides", label: "Betting Guides" },
  { href: "/bonuses", label: "Bonuses" },
  { href: "/app-tutorials", label: "App Tutorials" },
  { href: "/statistics-reports", label: "Statistics & Reports" },
];

// Genuine glassmorphism — a faint white wash + heavy blur, no border (a
// visible edge there is exactly the seam we don't want). This only reads
// correctly because the Hero (components/home/hero.tsx) deliberately
// bleeds its own gradient background up behind the header via a negative
// margin — `position: sticky` doesn't overlap anything at the initial
// scroll position on its own, so without that bleed there'd be nothing
// colorful here for the blur to pick up (which is exactly what went wrong
// in an earlier version of this header). On non-homepage pages this just
// shows the flat page background through the blur, which is fine.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/10">
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
