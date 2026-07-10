import Link from "next/link";
import { Eye, Users2, MousePointerClick, TrendingUp, Globe2, Sparkles } from "lucide-react";
import { StatTile } from "@/components/admin/dashboard/stat-tile";
import { RankedList } from "@/components/admin/dashboard/ranked-list";
import { MiniBarChart } from "@/components/admin/dashboard/mini-bar-chart";
import { cn } from "@/lib/utils";
import type { VisitorRange } from "@/lib/dashboard/queries";

const RANGE_TABS: { value: VisitorRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

export function VisitorAnalyticsSection({
  range,
  stats,
  dailyViews,
  topPages,
  topCtaEvents,
}: {
  range: VisitorRange;
  stats: { pageViews: number; uniqueSessions: number; ctaClicks: number };
  dailyViews: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  topCtaEvents: { label: string | null; count: number }[];
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          <TrendingUp className="size-4 text-brand" />
          Visitor Analytics
        </h2>
        <div className="flex gap-1 rounded-full border border-border bg-card p-1">
          {RANGE_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin?range=${tab.value}`}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                range === tab.value ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Eye} color="brand" value={stats.pageViews} label="Page Views" caption={RANGE_TABS.find((t) => t.value === range)?.label} accentBorder />
        <StatTile icon={Users2} color="indigo" value={stats.uniqueSessions} label="Unique Sessions" caption="Distinct visitors" accentBorder />
        <StatTile icon={MousePointerClick} color="emerald" value={stats.ctaClicks} label="CTA Clicks" caption="Tracked events" accentBorder />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="size-3.5 text-brand" />
          Page Views — Last 7 Days
        </h3>
        <MiniBarChart data={dailyViews.map((d) => ({ label: d.date.slice(5), count: d.count }))} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Globe2 className="size-3.5 text-brand" />
            Top Pages (30D)
          </h3>
          <RankedList items={topPages.map((p) => ({ label: p.path, value: p.count }))} emptyLabel="No page views tracked yet." />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <MousePointerClick className="size-3.5 text-brand" />
            Top CTA Events (30D)
          </h3>
          <RankedList
            items={topCtaEvents.map((c) => ({ label: c.label || "Untitled CTA", value: c.count }))}
            emptyLabel="No events tracked yet."
          />
        </div>
      </div>
    </div>
  );
}
