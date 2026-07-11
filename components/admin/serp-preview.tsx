"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  truncateToPixelWidth,
  SERP_TITLE_MAX_PX,
  SERP_TITLE_FONT,
  SERP_DESCRIPTION_MAX_PX,
  SERP_DESCRIPTION_FONT,
} from "@/lib/seo/pixel-width";

export function SerpPreview({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description: string;
}) {
  // Deferred so fast typing doesn't force a canvas remeasure on every
  // keystroke.
  const deferredTitle = useDeferredValue(title);
  const deferredDescription = useDeferredValue(description);

  // The server has no canvas, so it always measures via the character-count
  // heuristic. The client DOES have a canvas — but if this component used it
  // from its very first render, that first (hydration) render would already
  // diverge from the server's heuristic-truncated text, a real, deterministic
  // hydration mismatch on every load with a long enough title/description,
  // not a fluke. `mounted` starts false (server AND the client's initial
  // render both take the heuristic path — identical output, no mismatch),
  // then flips true after mount, upgrading to the accurate canvas-measured
  // truncation; a DOM update after hydration is always safe.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayTitle = truncateToPixelWidth(
    deferredTitle || "Untitled page",
    SERP_TITLE_MAX_PX,
    SERP_TITLE_FONT,
    mounted,
  );
  const displayDescription = truncateToPixelWidth(
    deferredDescription || "No description provided.",
    SERP_DESCRIPTION_MAX_PX,
    SERP_DESCRIPTION_FONT,
    mounted,
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Search preview
      </p>
      <div className="max-w-[600px] font-sans">
        <p className="truncate text-sm text-foreground/70">{url}</p>
        <p className="mt-0.5 truncate text-xl text-[#1a0dab] dark:text-[#8ab4f8]">{displayTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-foreground/80">{displayDescription}</p>
      </div>
    </div>
  );
}
