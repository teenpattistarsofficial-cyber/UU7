import Link from "next/link";
import type { FeaturedPost } from "@/lib/home/featured-content";

export function PopularGames({ games }: { games: FeaturedPost[] }) {
  if (games.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-4 text-xl font-semibold">Popular Games</h2>
      <div className="flex flex-wrap gap-3">
        {games.map((game) => (
          <Link
            key={game.id}
            href={game.url}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            {game.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
