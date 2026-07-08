import { cn } from "@/lib/utils";

/** Shared eyebrow + heading + optional description used at the top of
 * every homepage content section, echoing the hero's own eyebrow-label
 * pattern (small uppercase tracked-out label above a bold heading) so the
 * brand voice carries past the hero instead of the rest of the page
 * reading as a generic content template. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 sm:mb-10", className)}>
      <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">{eyebrow}</p>
      <h2 className="font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-xl text-muted-foreground">{description}</p>}
    </div>
  );
}
