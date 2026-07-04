export type CtaData = { heading: string; description: string | null; buttonText: string; buttonUrl: string };

/** The actual commercial mechanism this whole site exists for — contextual
 * links to the main site. Deliberately NOT nofollowed (unlike
 * SourceCitations' external links) since passing authority is the point.
 * Uses `--primary` (globally defined), not the admin-only `--brand` token
 * — this renders on the public site, which never has `.admin-theme`
 * applied, so `--brand` would resolve to nothing there. */
export function CtaBlock({ heading, description, buttonText, buttonUrl }: CtaData) {
  return (
    <div className="my-8 rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
      <h3 className="text-lg font-semibold">{heading}</h3>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      <a
        href={buttonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {buttonText}
      </a>
    </div>
  );
}
