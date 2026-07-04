"use client";

import { useState, useTransition } from "react";
import { Search, Sparkles, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPosts, suggestRelatedForPost, type LinkSuggestion } from "@/lib/actions/internal-links";

/** Module 8 (Internal Linking Assistant + anchor suggestions) — search or
 * auto-suggest other published posts, then insert a link to one directly
 * into the article at the cursor via `onInsert`, using its title as the
 * suggested anchor text. */
export function InternalLinkAssistant({
  excludePostId,
  currentTitle,
  currentTagNames,
  currentCategoryId,
  onInsert,
}: {
  excludePostId?: string;
  currentTitle: string;
  currentTagNames: string[];
  currentCategoryId: string | null;
  onInsert: (url: string, anchorText: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LinkSuggestion[]>([]);
  const [pending, startTransition] = useTransition();

  function runSearch(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      setResults(await searchPosts(q, excludePostId));
    });
  }

  function runAutoSuggest() {
    startTransition(async () => {
      setResults(
        await suggestRelatedForPost({
          excludePostId,
          title: currentTitle,
          tagNames: currentTagNames,
          categoryId: currentCategoryId,
        }),
      );
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => runSearch(e.target.value)}
            placeholder="Search posts to link to…"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={runAutoSuggest} disabled={pending} className="shrink-0 gap-1.5">
          <Sparkles className="size-3.5" />
          Suggest
        </Button>
      </div>

      {results.length > 0 ? (
        <ul className="space-y-0.5 rounded-md border border-border p-1.5">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onInsert(r.url, r.title)}
                className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                title={`Insert a link to "${r.title}"`}
              >
                <span className="min-w-0 truncate">{r.title}</span>
                <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Search by topic, or hit Suggest for posts related to this one — click a result to insert a link with its
          title as anchor text at your cursor.
        </p>
      )}
    </div>
  );
}
