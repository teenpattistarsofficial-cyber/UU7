import Image from "next/image";
import Link from "next/link";

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "Twitter/X",
  x: "Twitter/X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  website: "Website",
};

/** Module 13 (Author & Trust) — the trust signal readers and AI crawlers
 * both look for: who wrote this, what makes them credible, where to
 * verify them. Rendered at the end of the article, distinct from the
 * inline byline at the top. */
export function AuthorBox({
  displayName,
  slug,
  avatarUrl,
  roleTitle,
  bio,
  expertiseTags,
  socialLinks,
}: {
  displayName: string;
  slug: string;
  avatarUrl?: string | null;
  roleTitle?: string | null;
  bio?: string | null;
  expertiseTags?: string[] | null;
  socialLinks?: Record<string, string> | null;
}) {
  const links = Object.entries(socialLinks ?? {}).filter(([, url]) => url);

  return (
    <section className="mt-10 flex gap-4 rounded-xl border border-border bg-muted/30 p-5">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-muted">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={displayName} fill unoptimized className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Written by</p>
        <Link href={`/authors/${slug}`} className="font-semibold hover:underline">
          {displayName}
        </Link>
        {roleTitle && <p className="text-sm text-muted-foreground">{roleTitle}</p>}
        {bio && <p className="mt-2 text-sm">{bio}</p>}
        {expertiseTags && expertiseTags.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">Expertise: {expertiseTags.join(", ")}</p>
        )}
        {links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3">
            {links.map(([key, url]) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-foreground/80 hover:underline">
                {SOCIAL_LABELS[key.toLowerCase()] ?? key}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
