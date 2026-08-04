import Script from "next/script";
import { parseInjectedHtml } from "@/lib/site/parse-injected-scripts";

/** Renders an admin-configured script setting (components/admin/custom-scripts-settings.tsx)
 * on every public page — headScripts near the top of <body>, footerScripts
 * at the end. Each <script> tag found in the pasted HTML is handed to
 * next/script individually instead of executing inertly inside a raw
 * dangerouslySetInnerHTML div; anything left over (e.g. a <noscript> GTM
 * fallback) still renders as raw HTML exactly as before. `id` must be
 * unique per <Script> instance; `location` disambiguates the two call
 * sites (head vs footer) so the same script pasted in both fields doesn't
 * collide.
 *
 * strategy="lazyOnload", not "afterInteractive" — a live throttled-network
 * capture against production (matching PageSpeed's mobile lab conditions)
 * showed `afterInteractive` only defers *execution*; Next's own next/script
 * internals (node_modules/next/dist/client/script.js) call
 * `ReactDOM.preload()` for it unconditionally, so the script's bytes still
 * fetch immediately regardless of strategy. Confirmed GTM's script alone is
 * 165KB — over 3x the hero image's own size — and was measured directly
 * contending with it for bandwidth on the same throttled connection (hero
 * image: 51KB, ~250ms alone on paper, actually took 2.8s under this
 * contention). `lazyOnload` is the only strategy that defers the fetch
 * itself (not just execution) until after the `window.load` event. Known,
 * accepted tradeoff: a visitor who navigates away before `load` fires won't
 * be counted by GA4/Ahrefs — narrower now than when this was first
 * considered, since the page itself loads faster post-fix. */
export function InjectedScript({ html, location }: { html?: string | null; location: "head" | "footer" }) {
  if (!html) return null;
  const { externalScripts, inlineScripts, rest } = parseInjectedHtml(html);

  return (
    <>
      {externalScripts.map((script, i) => (
        <Script key={`${location}-ext-${i}`} id={`${location}-ext-${i}`} strategy="lazyOnload" {...script.attrs} />
      ))}
      {inlineScripts.map((script, i) => (
        <Script key={`${location}-inline-${i}`} id={`${location}-inline-${i}`} strategy="lazyOnload" {...script.attrs}>
          {script.content}
        </Script>
      ))}
      {rest && <div dangerouslySetInnerHTML={{ __html: rest }} />}
    </>
  );
}
