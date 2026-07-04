"use client";

import { useState, useTransition } from "react";
import { Search, X, Sparkles, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPosts, suggestRelatedForPost, type LinkSuggestion } from "@/lib/actions/internal-links";

export type RelatedPostPin = { id: string; title: string };

/** Manual pins (Module 8) — search or auto-suggest, then pin. Falls back to
 * the same auto-scoring on the public page when a post has no pins at all,
 * so this is "curate the automatic picks" rather than "required setup". */
export function RelatedPostsPicker({
  value,
  onChange,
  excludePostId,
  currentTitle,
  currentTagNames,
  currentCategoryId,
}: {
  value: RelatedPostPin[];
  onChange: (pins: RelatedPostPin[]) => void;
  excludePostId?: string;
  currentTitle: string;
  currentTagNames: string[];
  currentCategoryId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LinkSuggestion[]>([]);
  const [pending, startTransition] = useTransition();

  function addPin(item: LinkSuggestion) {
    if (value.some((p) => p.id === item.id)) return;
    onChange([...value, { id: item.id, title: item.title }]);
  }

  function removePin(id: string) {
    onChange(value.filter((p) => p.id !== id));
  }

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

  const visibleResults = results.filter((r) => !value.some((p) => p.id === r.id));

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((pin) => (
            <li key={pin.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm">
              <span className="truncate">{pin.title}</span>
              <button type="button" onClick={() => removePin(pin.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => runSearch(e.target.value)} placeholder="Search posts to pin…" className="h-8 pl-8 text-sm" />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={runAutoSuggest} disabled={pending} className="shrink-0 gap-1.5">
          <Sparkles className="size-3.5" />
          Auto-suggest
        </Button>
      </div>

      {visibleResults.length > 0 && (
        <ul className="space-y-0.5 rounded-md border border-border p-1.5">
          {visibleResults.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => addPin(r)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span className="truncate">{r.title}</span>
                <Plus className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
