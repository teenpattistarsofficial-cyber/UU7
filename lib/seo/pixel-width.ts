let canvas: HTMLCanvasElement | null = null;

/** Approximates Google's pixel-width-based truncation (it doesn't truncate
 * by character count) using a canvas measureText call with a font similar
 * to what desktop search results render with. Falls back to a
 * character-count heuristic when no canvas is available (SSR) — or when the
 * caller explicitly asks for it via `useCanvas: false`, which SerpPreview
 * does for its very first client render (see the comment there on why: this
 * function being called with the SAME `useCanvas` value on both the server
 * and the client's initial render is what keeps hydration from mismatching,
 * not `typeof document` alone — `document` already exists on the client
 * before hydration finishes, so gating on that alone would still measure
 * with canvas immediately and diverge from the server's heuristic output). */
function measureWidth(text: string, font: string, useCanvas: boolean): number {
  if (!useCanvas || typeof document === "undefined") return text.length * 8;
  canvas ??= document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 8;
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function truncateToPixelWidth(text: string, maxWidth: number, font: string, useCanvas: boolean): string {
  if (measureWidth(text, font, useCanvas) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && measureWidth(`${truncated}…`, font, useCanvas) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated.trimEnd()}…`;
}

// Rough approximations of Google's desktop SERP constraints.
export const SERP_TITLE_MAX_PX = 600;
export const SERP_TITLE_FONT = "20px Arial";
export const SERP_DESCRIPTION_MAX_PX = 920;
export const SERP_DESCRIPTION_FONT = "14px Arial";
