// Client-side only. Uses sendBeacon so the click is recorded even though
// the <a> it's attached to opens in a new tab / navigates away immediately
// after — a regular fetch() could get cancelled mid-flight by that
// navigation, sendBeacon is specifically designed to survive it.
export function trackCtaClick(ctaId: string, ctaLabel: string) {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
  const payload = JSON.stringify({ ctaId, ctaLabel, path: window.location.pathname });
  navigator.sendBeacon("/api/track/cta", new Blob([payload], { type: "application/json" }));
}
