"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { PostSummary } from "@/lib/posts/post-summary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/home/post-card";

/**
 * Client-side instant filter over a category's already-fetched post list —
 * not a round-trip to the /search page (app/(site)/search/page.tsx). That
 * page re-runs a server query and is meant for site-wide search from the
 * hero; here the full list for this one category is already loaded, so
 * filtering it in the browser as the visitor types is both simpler and
 * faster than adding a server round-trip for what's typically a short list.
 * A plain case-insensitive substring match (not the keyword-overlap scoring
 * lib/posts/search.ts uses) is enough at this scale and keeps results in
 * their original published-date order rather than re-ranking them.
 */
// Cards rendered before a "Load More" click — cuts down initial DOM size/
// paint work on categories with a lot of posts (app-tutorials had 15+ at
// last check). Deliberately a DOM-render limit, not a smaller server fetch:
// the search box above depends on the full list already being in memory to
// stay instant/client-side (see this component's own doc comment), so
// pagination only controls how much of it renders at once, not how much
// gets fetched.
const PAGE_SIZE = 9;

export function CategoryGuideSearch({ posts }: { posts: PostSummary[] }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q));
  }, [query, posts]);

  // Pagination only applies while browsing — an active search shows every
  // match immediately rather than making the visitor click through pages to
  // find something they're specifically looking for.
  const visible = query ? filtered : filtered.slice(0, visibleCount);
  const hasMore = !query && filtered.length > visibleCount;

  return (
    <div>
      <div className="group relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this category…"
          className="h-12 rounded-full border-transparent bg-muted/60 pl-11 pr-10 text-base shadow-sm transition-shadow focus-visible:border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:shadow-md"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {query && (
        <p className="mb-6 text-sm text-muted-foreground">
          {filtered.length} guide{filtered.length === 1 ? "" : "s"} found.
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No guides in this category matched “{query}”.</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post, i) => (
              <PostCard key={post.id} post={post} priority={i === 0} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Showing {visibleCount} of {filtered.length} guides
              </p>
              <Button variant="outline" className="rounded-full px-6" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
