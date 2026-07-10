import { MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { contactChannels } from "@/lib/db/schema";
import { ContactChannelsManager } from "@/components/admin/contact-channels-manager";
import { SettingsSectionHeader } from "@/components/admin/settings-section-header";

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
