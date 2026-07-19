import { db } from "@/lib/db";
import { contactChannels } from "@/lib/db/schema";
import { getContactChannelHref } from "@/lib/contact-channels";
import { getSiteSettings } from "@/lib/settings";
import { DEFAULT_LOGO_URL } from "@/lib/site";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { AskAiWidget } from "@/components/ask-ai/chat-widget";
import { InjectedScript } from "@/components/site/custom-scripts";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // First by position — whatever the admin has ranked highest in
  // Settings → Contact Channels — used as the Ask-AI widget's "talk to a
  // human" escalation link. `null` (no channels configured yet) just hides
  // that link rather than falling back to a hardcoded default.
  const [primaryChannel, siteSettingsRow] = await Promise.all([
    db.select().from(contactChannels).orderBy(contactChannels.position).limit(1).then((rows) => rows[0]),
    getSiteSettings(),
  ]);
  const contactChannel = primaryChannel
    ? { href: getContactChannelHref(primaryChannel.kind, primaryChannel.value), label: primaryChannel.label }
    : null;
  const logoUrl = siteSettingsRow?.logoUrl || DEFAULT_LOGO_URL;

  return (
    <div className="flex min-h-screen flex-col">
      <InjectedScript html={siteSettingsRow?.headScripts} />
      <SiteHeader logoUrl={logoUrl} />
      <div className="flex-1">{children}</div>
      <SiteFooter logoUrl={logoUrl} />
      <AskAiWidget
        contactChannel={contactChannel}
        enabled={siteSettingsRow?.aiWidgetEnabled ?? true}
        welcomeMessage={siteSettingsRow?.aiWidgetWelcomeMessage}
      />
      <InjectedScript html={siteSettingsRow?.footerScripts} />
    </div>
  );
}
