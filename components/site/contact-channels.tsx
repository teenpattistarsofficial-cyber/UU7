import { db } from "@/lib/db";
import { contactChannels } from "@/lib/db/schema";
import { CONTACT_CHANNEL_ICONS, getContactChannelHref } from "@/lib/contact-channels";

// Renders whatever's configured in Settings → Contact Channels (0, 1, or
// many) — no hardcoded single-channel copy, since the admin can add/remove
// channels freely. Styled to match the homepage's SiteCta card
// (components/home/site-cta.tsx) — same brand-tinted gradient border — so
// this reads as the site's standard "commercial/contact moment" card, not
// a one-off. Renders nothing at all if no channels are configured yet,
// rather than an empty-looking card.
export async function ContactChannels() {
  const rows = await db.select().from(contactChannels).orderBy(contactChannels.position);
  if (rows.length === 0) return null;

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/10 via-brand/[0.04] to-transparent p-8 text-center sm:p-10">
      <h2 className="font-heading text-lg font-bold sm:text-xl">Get in touch</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Questions about a guide, a correction to flag, or feedback — reach us directly, whichever&apos;s easiest.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {rows.map((row) => {
          const Icon = CONTACT_CHANNEL_ICONS[row.kind];
          const href = getContactChannelHref(row.kind, row.value);
          const isExternalLink = row.kind !== "email" && row.kind !== "phone";
          return (
            <a
              key={row.id}
              href={href}
              target={isExternalLink ? "_blank" : undefined}
              rel={isExternalLink ? "noopener noreferrer" : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-brand/90"
            >
              <Icon className="size-4" />
              {row.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
