"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateSiteSettings, setAiWidgetEnabled } from "@/lib/actions/site-settings";
import { ControlCard } from "@/components/admin/control-card";

export function AiWidgetSettings({
  initial,
}: {
  initial: { enabled: boolean; welcomeMessage: string | null };
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [welcomeMessage, setWelcomeMessage] = useState(initial.welcomeMessage ?? "");
  const [pending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    setEnabled(checked);
    startTransition(async () => {
      try {
        await setAiWidgetEnabled(checked);
        toast.success(checked ? "Ask-AI widget enabled" : "Ask-AI widget disabled");
      } catch (err) {
        setEnabled(!checked);
        toast.error(err instanceof Error ? err.message : "Failed to update Ask-AI widget");
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("aiWidgetWelcomeMessage", welcomeMessage);
    startTransition(async () => {
      try {
        await updateSiteSettings(fd);
        toast.success("Welcome message saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save welcome message");
      }
    });
  }

  return (
    <ControlCard
      icon={MessageCircle}
      iconClassName="bg-blue-500/10 text-blue-600"
      title="Ask-AI Widget"
      description="Hides the floating chat button sitewide when off."
      onHeaderClick={pending ? undefined : () => handleToggle(!enabled)}
      action={<Switch id="aiWidgetEnabled" checked={enabled} onCheckedChange={handleToggle} disabled={pending} />}
    >
      <form onSubmit={handleSubmit} className="space-y-2.5 border-t border-border p-5">
        <Label htmlFor="aiWidgetWelcomeMessage" className="text-base">
          Welcome message
        </Label>
        <Input
          id="aiWidgetWelcomeMessage"
          className="h-10 bg-background text-base"
          placeholder="Ask a question about content on this site."
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
        />
        <Button type="submit" variant="brand" disabled={pending}>
          {pending ? "Saving…" : "Save welcome message"}
        </Button>
      </form>
    </ControlCard>
  );
}
