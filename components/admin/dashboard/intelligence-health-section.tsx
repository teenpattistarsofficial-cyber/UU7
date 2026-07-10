import { ShieldCheck, Activity, CheckCircle2 } from "lucide-react";
import { CircularGauge } from "@/components/admin/dashboard/circular-gauge";

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <CheckCircle2 className={value === 0 ? "size-4 text-emerald-500" : "size-4 text-amber-500"} />
      </div>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function ServiceRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className="size-2 rounded-full bg-emerald-500" />
        {label}
      </span>
      <span className="text-sm font-semibold text-emerald-600">{status}</span>
    </div>
  );
}

function CountRow({ label, value, tone }: { label: string; value: number | string; tone: "emerald" | "amber" | "destructive" | "muted" }) {
  const dotClass = { emerald: "bg-emerald-500", amber: "bg-amber-500", destructive: "bg-destructive", muted: "bg-muted-foreground" }[tone];
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className={`size-1.5 rounded-full ${dotClass}`} />
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export function IntelligenceHealthSection({
  intelligence,
  dbOk,
  health,
  publishedThisMonth,
  commentApprovalRate,
}: {
  intelligence: { avgSeoScore: number; missingTitles: number; missingMeta: number; missingImages: number; staleDrafts: number };
  dbOk: boolean;
  health: { publishedPosts: number; draftPosts: number; trashedPosts: number; totalComments: number };
  publishedThisMonth: number;
  commentApprovalRate: number | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <ShieldCheck className="size-3.5 text-brand" />
          Content Intelligence
        </h3>
        <div className="flex items-center gap-4">
          <CircularGauge value={intelligence.avgSeoScore} />
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Avg SEO Score</p>
            <p className="text-2xl font-bold">
              {intelligence.avgSeoScore}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {intelligence.avgSeoScore >= 80 ? "Content is well-optimized" : "Some content needs attention"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat label="Missing SEO Titles" value={intelligence.missingTitles} />
          <MiniStat label="Missing Meta Desc" value={intelligence.missingMeta} />
          <MiniStat label="Missing Images" value={intelligence.missingImages} />
          <MiniStat label="Stale Drafts (14d+)" value={intelligence.staleDrafts} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Activity className="size-3.5 text-brand" />
          Site Health
        </h3>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">System Services</p>
        <div className="space-y-2">
          <ServiceRow label="API Server" status="Online" />
          <ServiceRow label="Database" status={dbOk ? "Connected" : "Error"} />
          <ServiceRow label="Media Storage" status="Operational" />
        </div>
        <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Content</p>
        <div className="space-y-2">
          <CountRow label="Published Posts" value={health.publishedPosts} tone="emerald" />
          <CountRow label="Draft Posts" value={health.draftPosts} tone="amber" />
          <CountRow label="Trashed Posts" value={health.trashedPosts} tone="destructive" />
          <CountRow label="Total Comments" value={health.totalComments} tone="muted" />
        </div>
        <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Engagement</p>
        <div className="space-y-2">
          <CountRow label="Published This Month" value={publishedThisMonth} tone="emerald" />
          <CountRow label="Comment Approval Rate" value={commentApprovalRate === null ? "No data yet" : `${commentApprovalRate}%`} tone="emerald" />
        </div>
      </div>
    </div>
  );
}
