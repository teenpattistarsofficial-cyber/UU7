import Link from "next/link";
import Image from "next/image";
import { SITE_CATEGORIES } from "@/lib/site-categories";

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/authors", label: "Authors" },
];

const POLICY_LINKS = [
  { href: "/responsible-gaming", label: "Responsible Gaming" },
  { href: "/editorial-policy", label: "Editorial Policy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-brand/5">
      {/* Thin brand-gradient accent instead of a plain flat border — the one
         place outside the hero/header that nods to the brand color, kept to
         a 2px hairline so it reads as a detail, not a design element that
         needs to compete with page content. */}
      <div className="h-0.5 bg-gradient-to-r from-brand/0 via-brand to-brand/0" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {/* Below `lg`, this is a 2-column grid with only Brand forced to
           span both columns (`col-span-2`) — that's what pushes Explore
           and Company (the next two items) onto their own row together
           instead of every section stacking full-width the way a plain
           `grid-cols-1` would on mobile. Policies is a plain, unspanned
           grid item, so it just falls into whatever cell comes next in
           the grid's normal auto-flow — not repositioned or resized to
           match the row above it. `lg` switches to the original
           single-row, four-column layout, where Brand also reverts to
           spanning just one of the four tracks. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label="UU7 home">
              <Image src="/UU7.io logo.webp" alt="UU7" width={64} height={64} className="rounded-md" />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Researched rules, honest reviews, and straight answers on Indian card games, betting, and bonuses —
              not marketing.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-4 space-y-3">
              {SITE_CATEGORIES.map((category) => (
                <li key={category.href}>
                  <Link href={category.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Policies</h3>
            <ul className="mt-4 space-y-3">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} UU7. All rights reserved.</p>
          <p>18+ · This site is for informational purposes — please play responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
