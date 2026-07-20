"use client";

import { useState } from "react";
import type { PostSummary } from "@/lib/posts/post-summary";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/home/post-card";

// Same "Load more" render-limit pattern as components/site/category-guide-search.tsx
// — no search box on this page to bypass, so this is simpler: just cap the
// initial grid and reveal more on click.
const PAGE_SIZE = 9;

export function AuthorArticles({ posts }: { posts: PostSummary[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = posts.slice(0, visibleCount);
  const hasMore = posts.length > visibleCount;

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        {visible.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {visibleCount} of {posts.length} articles
          </p>
          <Button variant="outline" className="rounded-full px-6" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
