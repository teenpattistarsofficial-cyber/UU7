import Link from "next/link";
import Image from "next/image";
import { SITE_CATEGORIES } from "@/lib/site-categories";

const COMPANY_LINKS = [
  { href: "/about-uu7", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/authors", label: "Authors" },
];

const POLICY_LINKS = [
  { href: "/responsible-gaming", label: "Responsible Gaming" },
  { href: "/editorial-policy", label: "Editorial Policy" },
];

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/starsuu7indiagames/",
    label: "Facebook",
    hover: "hover:border-blue-500/60 hover:bg-blue-500/10 hover:text-blue-400 hover:shadow-[0_0_18px_rgba(59,130,246,0.35)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/starsuu7game",
    label: "X (Twitter)",
    hover: "hover:border-zinc-300/60 hover:bg-zinc-300/10 hover:text-zinc-200 hover:shadow-[0_0_18px_rgba(212,212,216,0.25)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://in.pinterest.com/starsuu7india/",
    label: "Pinterest",
    hover: "hover:border-red-600/60 hover:bg-red-600/10 hover:text-red-500 hover:shadow-[0_0_18px_rgba(230,0,35,0.35)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    href: "https://t.me/OfficialStarsuu7game",
    label: "Telegram",
    hover: "hover:border-sky-400/60 hover:bg-sky-400/10 hover:text-sky-400 hover:shadow-[0_0_18px_rgba(56,189,248,0.35)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    href: "https://whatsapp.com/channel/0029Vb6HYJ2KLaHvG4hKr90Z",
    label: "WhatsApp",
    hover: "hover:border-green-500/60 hover:bg-green-500/10 hover:text-green-400 hover:shadow-[0_0_18px_rgba(34,197,94,0.35)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

export function SiteFooter({ logoUrl }: { logoUrl: string }) {
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
              <Image src={logoUrl} alt="UU7" width={64} height={64} unoptimized className="rounded-md" />
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
                  {/* prefetch off: the header nav already prefetches every
                     category link once — the footer repeats the same set,
                     so prefetching here again is pure duplicate work with
                     no benefit (confirmed contributing to the homepage's
                     Total Blocking Time via a run_performance_audit pass). */}
                  <Link href={category.href} prefetch={false} className="text-sm text-muted-foreground hover:text-foreground">
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
                  {/* /about-uu7 specifically: same duplicate-prefetch reasoning
                     as the category links above — the header nav's "About"
                     entry already prefetches it once. FAQ/Contact/Authors
                     aren't in the header nav, so they keep default prefetch. */}
                  <Link
                    href={link.href}
                    prefetch={link.href === "/about-uu7" ? false : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
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

        {/* Social links bar */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs font-medium tracking-widest text-muted-foreground/60 uppercase">
            Follow StarsUU7
          </p>
          <div className="flex items-center gap-2.5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground/70 transition-all duration-300 hover:scale-[1.12] ${social.hover}`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} UU7. All rights reserved.</p>
          <p>18+ · This site is for informational purposes — please play responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
