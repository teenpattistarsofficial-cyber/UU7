import { Palette } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { BrandingSettings } from "@/components/admin/branding-settings";
import { SettingsSectionHeader } from "@/components/admin/settings-section-header";

// No params/searchParams here for Next to infer dynamic rendering from, so
// without this, `next build` tries to statically prerender it — which runs
// a live DB query (getSiteSettings) at build time with no DATABASE_URL
// available (see the Dockerfile's comment on this exact failure mode).
export const dynamic = "force-dynamic";

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
