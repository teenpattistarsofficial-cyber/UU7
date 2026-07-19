import { Code2 } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { CustomScriptsSettings } from "@/components/admin/custom-scripts-settings";
import { SettingsSectionHeader } from "@/components/admin/settings-section-header";

// No params/searchParams here for Next to infer dynamic rendering from, so
// without this, `next build` tries to statically prerender it — which runs
// a live DB query (getSiteSettings) at build time with no DATABASE_URL
// available (see the Dockerfile's comment on this exact failure mode).
export const dynamic = "force-dynamic";

export default async function CustomScriptsSettingsPage() {
  const siteSettingsRow = await getSiteSettings();

  return (
    <div>
      <SettingsSectionHeader
        icon={Code2}
        title="Custom Scripts"
        description="Third-party tracking/analytics snippets, rendered on every public page."
      />
      <CustomScriptsSettings
        initial={{
          headScripts: siteSettingsRow?.headScripts ?? null,
          footerScripts: siteSettingsRow?.footerScripts ?? null,
        }}
      />
    </div>
  );
}
