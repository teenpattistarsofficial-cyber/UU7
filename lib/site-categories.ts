import { BarChart3, Gamepad2, Gift, Smartphone, TrendingUp, type LucideIcon } from "lucide-react";

/** Single source of truth for the site's five top-level categories — label,
 * href, and an icon each, shared between the header nav/mobile menu
 * (components/layout/header.tsx) and the homepage content sections
 * (components/home/*), which both need to render the same category as a
 * nav link vs. a post's category badge. Slugs must match the seeded
 * `categories` table rows exactly (see lib/db/seed or the admin categories
 * screen) — there's no runtime validation tying the two together. */
export const SITE_CATEGORIES: { slug: string; label: string; href: string; icon: LucideIcon }[] = [
  { slug: "game-guides", label: "Game Guides", href: "/game-guides", icon: Gamepad2 },
  { slug: "betting-guides", label: "Betting Guides", href: "/betting-guides", icon: TrendingUp },
  { slug: "bonuses", label: "Bonuses", href: "/bonuses", icon: Gift },
  { slug: "app-tutorials", label: "App Tutorials", href: "/app-tutorials", icon: Smartphone },
  { slug: "statistics-reports", label: "Statistics & Reports", href: "/statistics-reports", icon: BarChart3 },
];

const BY_SLUG = new Map(SITE_CATEGORIES.map((c) => [c.slug, c]));

/** Falls back to a plain label (from whatever the DB has) and no icon for
 * categories that exist in the database but aren't one of the five
 * hardcoded nav categories above — e.g. a category an editor created
 * through the admin that hasn't been added to this list yet. */
export function getCategoryMeta(slug: string | null | undefined, fallbackLabel?: string) {
  const known = slug ? BY_SLUG.get(slug) : undefined;
  if (known) return known;
  return { slug: slug ?? "", label: fallbackLabel ?? "Guide", href: slug ? `/${slug}` : "#", icon: null };
}
