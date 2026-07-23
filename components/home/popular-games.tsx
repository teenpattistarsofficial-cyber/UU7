import Link from "next/link";
import { ArrowUpRight, Dices, Rocket, Spade, Video, type LucideIcon } from "lucide-react";
import type { FeaturedPost } from "@/lib/home/featured-content";
import { SectionHeading } from "@/components/home/section-heading";

// Per-game icons rather than reusing the (identical, "Game Guides")
// category icon on every chip — these pillar slugs are specific enough to
// warrant their own, and it's what actually makes a row of otherwise-
// identical badges scannable at a glance. Slug-keyed rather than
// title-keyed so a copy edit to the post title doesn't silently break it.
// Add an entry here (and to POPULAR_GAME_SLUGS in featured-content.ts)
// once a Teen Patti pillar guide actually exists — Aviator's already
// covered as of uu7game-aviator-guide.
const GAME_ICONS: Record<string, LucideIcon> = {
  "online-rummy-guide-rules-formats-and-strategy": Spade,
  "uu7game-slots-guide": Dices,
  "uu7game-casino-games-guide": Video,
  "uu7game-aviator-guide": Rocket,
};

export function PopularGames({ games }: { games: FeaturedPost[] }) {
  if (games.length === 0) return null;

  return (
    <section className="mb-20">
      <div className="rounded-3xl bg-gradient-to-br from-muted/60 to-muted/10 p-6 sm:p-10">
        <SectionHeading eyebrow="Player favorites" title="Popular Games" className="mb-6 sm:mb-8" />
        {/* `flex flex-wrap` with a fixed-ish basis, not `grid` — a grid's
           columns stay reserved (and empty) when there are fewer games than
           columns, which with only a handful of pillars published so far
           left this section's decorative band mostly blank. Flex items
           just cluster to the left instead, so it looks intentional at any
           count from 1 to a full curated list of 5. Below `sm`, width is a
           calc()'d ~50% basis (2-up) rather than a fixed px width — a fixed
           160px card on a ~360px viewport left a single lonely card per row
           with a wide dead gap next to it instead of actually using the
           space. */}
        <div className="flex flex-wrap gap-3">
          {games.map((game) => {
            const Icon = GAME_ICONS[game.url.split("/").pop() ?? ""] ?? Dices;
            return (
              <Link
                key={game.id}
                href={game.url}
                className="group flex w-[calc(50%-0.375rem)] shrink-0 flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-12px_rgba(0,0,0,0.12)] sm:w-44"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="flex items-start justify-between gap-2">
                  {/* These titles are full SEO post titles ("Online Rummy
                     Guide: Rules, Formats, and Strategy"), too long for a
                     ~160px chip — every pillar title in practice follows a
                     "short name: longer subtitle" convention, so the part
                     before the colon reads as a game name on its own. */}
                  <span className="text-sm font-medium leading-snug text-balance">
                    {game.title.split(":")[0]}
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
