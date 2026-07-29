import Script from "next/script";
import { parseInjectedHtml } from "@/lib/site/parse-injected-scripts";

/** Renders an admin-configured script setting (components/admin/custom-scripts-settings.tsx)
 * on every public page — headScripts near the top of <body>, footerScripts
 * at the end. Each <script> tag found in the pasted HTML is handed to
 * next/script individually (strategy="afterInteractive") instead of
 * executing inertly inside a raw dangerouslySetInnerHTML div, so analytics
 * scripts like GA4/Ahrefs can't contend with the page's initial render —
 * anything left over (e.g. a <noscript> GTM fallback) still renders as
 * raw HTML exactly as before. `id` must be unique per <Script> instance;
 * `location` disambiguates the two call sites (head vs footer) so the
 * same script pasted in both fields doesn't collide. */
export function InjectedScript({ html, location }: { html?: string | null; location: "head" | "footer" }) {
  if (!html) return null;
  const { externalScripts, inlineScripts, rest } = parseInjectedHtml(html);

  return (
    <>
      {externalScripts.map((script, i) => (
        <Script key={`${location}-ext-${i}`} id={`${location}-ext-${i}`} strategy="afterInteractive" {...script.attrs} />
      ))}
      {inlineScripts.map((script, i) => (
        <Script key={`${location}-inline-${i}`} id={`${location}-inline-${i}`} strategy="afterInteractive" {...script.attrs}>
          {script.content}
        </Script>
      ))}
      {rest && <div dangerouslySetInnerHTML={{ __html: rest }} />}
    </>
  );
}
