let canvas: HTMLCanvasElement | null = null;

/** Approximates Google's pixel-width-based truncation (it doesn't truncate
 * by character count) using a canvas measureText call with a font similar
 * to what desktop search results render with. Falls back to a
 * character-count heuristic when no canvas is available (SSR). */
function measureWidth(text: string, font: string): number {
  if (typeof document === "undefined") return text.length * 8;
  canvas ??= document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 8;
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function truncateToPixelWidth(text: string, maxWidth: number, font: string): string {
  if (measureWidth(text, font) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && measureWidth(`${truncated}…`, font) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated.trimEnd()}…`;
}

// Rough approximations of Google's desktop SERP constraints.
export const SERP_TITLE_MAX_PX = 600;
export const SERP_TITLE_FONT = "20px Arial";
export const SERP_DESCRIPTION_MAX_PX = 920;
export const SERP_DESCRIPTION_FONT = "14px Arial";
