"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setOpenAiApiKey } from "@/lib/actions/site-settings";
import { ControlCard } from "@/components/admin/control-card";

export function OpenAiKeySettings({
  initial,
}: {
  initial: { configured: boolean; preview: string | null };
}) {
  const [configured, setConfigured] = useState(initial.configured);
  const [preview, setPreview] = useState(initial.preview);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    startTransition(async () => {
      try {
        const result = await setOpenAiApiKey(value);
        setConfigured(result.configured);
        setPreview(result.preview);
        setValue("");
        toast.success("OpenAI API key saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save API key");
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      try {
        const result = await setOpenAiApiKey(null);
        setConfigured(result.configured);
        setPreview(result.preview);
        toast.success("OpenAI API key removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove API key");
      }
    });
  }

  return (
    <ControlCard
      icon={KeyRound}
      iconClassName="bg-emerald-500/10 text-emerald-600"
      title="OpenAI API Key"
      description="Powers the Ask-AI widget's answers. Takes priority over the OPENAI_API_KEY environment variable when set."
      action={
        <Badge variant={configured ? "default" : "outline"} className={configured ? "bg-emerald-500/10 text-emerald-600" : ""}>
          {configured ? `Configured · sk-…${preview}` : "Not set"}
        </Badge>
      }
    >
      <form onSubmit={handleSave} className="space-y-2.5 border-t border-border p-5">
        <Label htmlFor="openaiApiKey" className="text-base">
          {configured ? "Replace key" : "API key"}
        </Label>
        <div className="flex flex-wrap gap-2">
          <Input
            id="openaiApiKey"
            type="password"
            autoComplete="off"
            className="h-10 min-w-[240px] flex-1 bg-background text-base font-mono"
            placeholder="sk-..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button type="submit" variant="brand" className="rounded-full px-5" disabled={pending || !value.trim()}>
            {pending ? "Saving…" : "Save"}
          </Button>
          {configured && (
            <Button type="button" variant="outline" onClick={handleRemove} disabled={pending}>
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Never shown again once saved — only the last 4 characters are displayed above, for confirmation.
        </p>
      </form>
    </ControlCard>
  );
}
