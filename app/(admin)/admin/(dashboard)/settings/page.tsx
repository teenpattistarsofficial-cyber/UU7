import { headers } from "next/headers";
import { User, Mail, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { SettingsSectionHeader } from "@/components/admin/settings-section-header";
import { ProfileSettings } from "@/components/admin/profile-settings";

// headers() usage alone doesn't reliably force dynamic rendering in this
// Next.js/Turbopack build — confirmed empirically elsewhere in this app
// (see the Dockerfile's comment on this failure mode).
export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div>
      <SettingsSectionHeader
        icon={User}
        title="Account"
        description="Your signed-in identity, photo, and password for this admin."
      />

      <div className="max-w-2xl space-y-5">
        <ProfileSettings initial={{ name: session?.user?.name ?? "", image: session?.user?.image ?? null }} />

        <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
          <InfoRow icon={Mail} label="Email" value={session?.user?.email ?? ""} />
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <ShieldCheck className="size-4" />
              </span>
              <p className="text-sm font-semibold text-foreground">Role</p>
            </div>
            <Badge variant="brand" className="h-6 px-3 text-sm uppercase">
              {session?.user?.role as string}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Icon className="size-4" />
        </span>
        <p className="text-sm font-semibold text-foreground">{label}</p>
      </div>
      <span className="text-base font-medium text-foreground">{value}</span>
    </div>
  );
}
