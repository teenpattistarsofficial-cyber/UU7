import Link from "next/link";

const CATEGORY_LINKS = [
  { href: "/game-guides", label: "Game Guides" },
  { href: "/betting-guides", label: "Betting Guides" },
  { href: "/bonuses", label: "Bonuses" },
  { href: "/app-tutorials", label: "App Tutorials" },
  { href: "/statistics-reports", label: "Statistics & Reports" },
];

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          UU7
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-foreground/80 md:flex">
          {CATEGORY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
