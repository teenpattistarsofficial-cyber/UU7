import Link from "next/link";
import { Globe, Link2 } from "lucide-react";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { Badge } from "@/components/ui/badge";

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
 * inline byline at the top. lucide-react ships no brand-specific social
 * glyphs (Twitter/LinkedIn icons were dropped from recent releases), so
 * every platform gets the same generic `Link2` mark except "website"
 * (`Globe`) rather than mixing real brand icons with placeholder ones. */
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
    <section className="mt-10 flex gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
      <AuthorAvatar displayName={displayName} avatarUrl={avatarUrl} size="size-14 sm:size-16" />
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">Written by</p>
        <Link href={`/authors/${slug}`} className="font-heading font-semibold hover:text-brand">
          {displayName}
        </Link>
        {roleTitle && <p className="text-sm text-muted-foreground">{roleTitle}</p>}
        {bio && <p className="mt-2 text-sm leading-relaxed">{bio}</p>}
        {expertiseTags && expertiseTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {expertiseTags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map(([key, url]) => {
              const Icon = key.toLowerCase() === "website" ? Globe : Link2;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Icon className="size-3.5" />
                  {SOCIAL_LABELS[key.toLowerCase()] ?? key}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
