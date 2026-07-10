"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSiteCache } from "@/lib/actions/site-settings";
import { ControlCard } from "@/components/admin/control-card";

export function CacheControls({
  initialVersion,
  initialClearedAt,
}: {
  initialVersion: number;
  initialClearedAt: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClear() {
    startTransition(async () => {
      try {
        const { version } = await clearSiteCache();
        toast.success(`Site cache cleared — now on version ${version}`);
        // revalidatePath() invalidates the server cache, but this
        // component's version/clearedAt props were rendered once on the
        // initial request — refresh() is what actually re-fetches them.
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to clear cache");
      }
    });
  }

  return (
    <ControlCard
      icon={Trash2}
      iconClassName="bg-brand/10 text-brand"
      title="Clear Site Cache"
      description="Purges every cached page so the next visit anywhere on the site re-renders fresh from the database."
      action={
        <Button
          type="button"
          variant="brand"
          onClick={handleClear}
          disabled={pending}
          className="gap-1.5 rounded-full px-5"
        >
          <Activity className={pending ? "size-4 animate-spin" : "size-4"} />
          {pending ? "Clearing…" : "Clear now"}
        </Button>
      }
    >
      <div className="border-t border-border px-5 py-4">
        <div className="flex items-center justify-between gap-4 rounded-lg bg-background px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Cache version {initialVersion}</p>
            <p className="text-xs text-muted-foreground">Bumped on every clear — proof it actually ran.</p>
          </div>
          <span className="font-mono text-sm font-medium text-foreground">
            {initialClearedAt ? new Date(initialClearedAt).toLocaleString() : "never cleared"}
          </span>
        </div>
      </div>
    </ControlCard>
  );
}
