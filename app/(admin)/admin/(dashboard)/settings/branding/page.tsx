import { Palette } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { BrandingSettings } from "@/components/admin/branding-settings";
import { SettingsSectionHeader } from "@/components/admin/settings-section-header";

export default async function BrandingSettingsPage() {
  const siteSettingsRow = await getSiteSettings();

  return (
    <div>
      <SettingsSectionHeader
        icon={Palette}
        title="Branding"
        description="Logo, favicon, and default social share image — used across the public site and this admin."
      />
      <BrandingSettings
        initial={{
          logoUrl: siteSettingsRow?.logoUrl ?? null,
          faviconUrl: siteSettingsRow?.faviconUrl ?? null,
          ogImageUrl: siteSettingsRow?.ogImageUrl ?? null,
        }}
      />
    </div>
  );
}
