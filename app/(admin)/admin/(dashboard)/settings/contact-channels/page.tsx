import { MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { contactChannels } from "@/lib/db/schema";
import { ContactChannelsManager } from "@/components/admin/contact-channels-manager";
import { SettingsSectionHeader } from "@/components/admin/settings-section-header";

// No params/searchParams here for Next to infer dynamic rendering from, so
// without this, `next build` tries to statically prerender it — which runs
// a live DB query at build time with no DATABASE_URL available (see the
// Dockerfile's comment on this exact failure mode).
export const dynamic = "force-dynamic";

export default async function ContactChannelsSettingsPage() {
  const contactChannelRows = await db.select().from(contactChannels).orderBy(contactChannels.position);

  return (
    <div>
      <SettingsSectionHeader
        icon={MessageSquare}
        title="Contact Channels"
        description={`Shown on the Contact page and used as the Ask-AI widget's "talk to a human" link — no code change needed to add, edit, reorder, or remove one.`}
      />
      <ContactChannelsManager initialRows={contactChannelRows} />
    </div>
  );
}
