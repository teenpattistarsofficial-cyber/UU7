"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateSiteSettings, setMaintenanceMode } from "@/lib/actions/site-settings";
import { ControlCard } from "@/components/admin/control-card";

export function MaintenanceModeSettings({
  initial,
}: {
  initial: { enabled: boolean; message: string | null };
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [message, setMessage] = useState(initial.message ?? "");
  const [pending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    setEnabled(checked);
    startTransition(async () => {
      try {
        await setMaintenanceMode(checked);
        toast.success(checked ? "Maintenance mode turned on" : "Maintenance mode turned off");
      } catch (err) {
        setEnabled(!checked);
        toast.error(err instanceof Error ? err.message : "Failed to update maintenance mode");
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("maintenanceMessage", message);
    startTransition(async () => {
      try {
        await updateSiteSettings(fd);
        toast.success("Maintenance message saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save message");
      }
    });
  }

  return (
    <ControlCard
      icon={ShieldAlert}
      iconClassName="bg-amber-500/10 text-amber-600"
      title="Maintenance Mode"
      description="Shows a maintenance page on the public site for everyone, including you — the admin dashboard itself stays reachable so you can turn it back off."
      onHeaderClick={pending ? undefined : () => handleToggle(!enabled)}
      action={<Switch id="maintenanceMode" checked={enabled} onCheckedChange={handleToggle} disabled={pending} />}
    >
      <form onSubmit={handleSubmit} className="space-y-2.5 border-t border-border p-5">
        <Label htmlFor="maintenanceMessage" className="text-base">
          Message shown to visitors
        </Label>
        <Textarea
          id="maintenanceMessage"
          rows={2}
          className="bg-background text-base"
          placeholder="We'll be back shortly. Thanks for your patience."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" variant="brand" disabled={pending}>
          {pending ? "Saving…" : "Save message"}
        </Button>
      </form>
    </ControlCard>
  );
}
