// Renders an admin-configured script setting (components/admin/custom-scripts-settings.tsx)
// verbatim, server-side, as part of the initial HTML response — <script>
// tags inside `html` execute normally because the browser's parser sees
// them as part of the document's initial parse, unlike a client-side
// `innerHTML` assignment after the fact, which would leave them inert.
// Used twice: headScripts near the top of <body>, footerScripts at the end.
export function InjectedScript({ html }: { html?: string | null }) {
  if (!html) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
