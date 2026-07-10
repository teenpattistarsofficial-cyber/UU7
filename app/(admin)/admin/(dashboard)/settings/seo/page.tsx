import { Search } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { GlobalSeoSettings } from "@/components/admin/global-seo-settings";
import { SettingsSectionHeader } from "@/components/admin/settings-section-header";

export default async function GlobalSeoSettingsPage() {
  const siteSettingsRow = await getSiteSettings();

  return (
    <div>
      <SettingsSectionHeader
        icon={Search}
        title="Global SEO"
        description="Site-wide title, description, keywords, and search-engine verification — the fallback for the homepage and any page/post/category that doesn't set its own."
      />
      <GlobalSeoSettings
        initial={{
          siteTitle: siteSettingsRow?.siteTitle ?? null,
          metaDescription: siteSettingsRow?.metaDescription ?? null,
          metaKeywords: siteSettingsRow?.metaKeywords ?? null,
          googleSiteVerification: siteSettingsRow?.googleSiteVerification ?? null,
          twitterHandle: siteSettingsRow?.twitterHandle ?? null,
          canonicalUrl: siteSettingsRow?.canonicalUrl ?? null,
        }}
      />
    </div>
  );
}
