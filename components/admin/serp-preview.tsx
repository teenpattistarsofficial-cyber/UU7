"use client";

import { useDeferredValue } from "react";
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

  const displayTitle = truncateToPixelWidth(
    deferredTitle || "Untitled page",
    SERP_TITLE_MAX_PX,
    SERP_TITLE_FONT,
  );
  const displayDescription = truncateToPixelWidth(
    deferredDescription || "No description provided.",
    SERP_DESCRIPTION_MAX_PX,
    SERP_DESCRIPTION_FONT,
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
