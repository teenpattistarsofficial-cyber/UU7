import { SlidersHorizontal } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { CacheControls } from "@/components/admin/cache-controls";
import { MaintenanceModeSettings } from "@/components/admin/maintenance-mode-settings";
import { AiWidgetSettings } from "@/components/admin/ai-widget-settings";
import { OpenAiKeySettings } from "@/components/admin/openai-key-settings";
import { SystemDiagnosticsPanel } from "@/components/admin/system-diagnostics-panel";
import { SettingsSectionHeader } from "@/components/admin/settings-section-header";

// No params/searchParams here for Next to infer dynamic rendering from, so
// without this, `next build` tries to statically prerender it — which runs
// a live DB query (getSiteSettings) at build time with no DATABASE_URL
// available (see the Dockerfile's comment on this exact failure mode).
export const dynamic = "force-dynamic";

export default async function SystemControlsPage() {
  const siteSettingsRow = await getSiteSettings();

  return (
    <div>
      <SettingsSectionHeader
        icon={SlidersHorizontal}
        title="System Controls"
        description="Cache, system health, maintenance mode, and the Ask-AI widget."
      />

      <div className="max-w-2xl space-y-5">
        <SystemDiagnosticsPanel />

        <CacheControls
          initialVersion={siteSettingsRow?.cacheVersion ?? 1}
          initialClearedAt={siteSettingsRow?.cacheClearedAt?.toISOString() ?? null}
        />

        <MaintenanceModeSettings
          initial={{
            enabled: siteSettingsRow?.maintenanceMode ?? false,
            message: siteSettingsRow?.maintenanceMessage ?? null,
          }}
        />

        <OpenAiKeySettings
          initial={{
            configured: Boolean(siteSettingsRow?.openaiApiKey),
            preview: siteSettingsRow?.openaiApiKey ? siteSettingsRow.openaiApiKey.slice(-4) : null,
          }}
        />

        <AiWidgetSettings
          initial={{
            enabled: siteSettingsRow?.aiWidgetEnabled ?? true,
            welcomeMessage: siteSettingsRow?.aiWidgetWelcomeMessage ?? null,
          }}
        />
      </div>
    </div>
  );
}
