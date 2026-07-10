import { SettingsTabs } from "@/components/admin/settings-tabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Site identity, SEO defaults, contact info, and system controls.
      </p>

      <SettingsTabs />

      <div className="mt-6">{children}</div>
    </div>
  );
}
