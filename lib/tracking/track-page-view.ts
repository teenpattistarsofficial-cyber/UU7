// Client-side only, mirrors track-cta-click.ts's sendBeacon pattern — fired
// on mount/route-change rather than blocking the page response the way the
// old proxy.ts-based tracking did.
export function trackPageView(path: string) {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
  const payload = JSON.stringify({ path });
  navigator.sendBeacon("/api/track/pageview", new Blob([payload], { type: "application/json" }));
}
