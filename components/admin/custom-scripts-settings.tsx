"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Code2, ArrowDownToLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import { ControlCard } from "@/components/admin/control-card";

export function CustomScriptsSettings({
  initial,
}: {
  initial: { headScripts: string | null; footerScripts: string | null };
}) {
  const [headScripts, setHeadScripts] = useState(initial.headScripts ?? "");
  const [footerScripts, setFooterScripts] = useState(initial.footerScripts ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("headScripts", headScripts);
    fd.set("footerScripts", footerScripts);
    startTransition(async () => {
      try {
        await updateSiteSettings(fd);
        toast.success("Custom scripts saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save custom scripts");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <ControlCard
        icon={Code2}
        iconClassName="bg-slate-500/10 text-slate-600"
        title="Head Scripts"
        description="Renders near the top of every public page, before other content — for tracking/analytics snippets (e.g. Google Analytics, GTM) that should load early. This is real executable JavaScript, never paste anything from a source you don't fully trust."
      >
        <div className="border-t border-border p-5">
          <Textarea
            id="headScripts"
            rows={12}
            className="bg-background font-mono text-sm"
            placeholder={`<script async src="https://www.googletagmanager.com/gtag/js?id=..."></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  ...\n</script>`}
            value={headScripts}
            onChange={(e) => setHeadScripts(e.target.value)}
          />
        </div>
      </ControlCard>

      <ControlCard
        icon={ArrowDownToLine}
        iconClassName="bg-amber-500/10 text-amber-600"
        title="Footer Scripts"
        description="Renders at the very end of every public page, after all content — for things meant to load last (chat widgets, deferred scripts, a GTM <noscript> fallback). Also real executable JavaScript."
      >
        <div className="border-t border-border p-5">
          <Textarea
            id="footerScripts"
            rows={8}
            className="bg-background font-mono text-sm"
            placeholder={`<script>\n  // loads after all page content\n</script>`}
            value={footerScripts}
            onChange={(e) => setFooterScripts(e.target.value)}
          />
        </div>
      </ControlCard>

      <Button type="submit" variant="brand" className="rounded-full px-6" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save custom scripts"}
      </Button>
    </form>
  );
}
