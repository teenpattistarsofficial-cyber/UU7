import Link from "next/link";
import { eq } from "drizzle-orm";
import { Plus, Search, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { seoMeta } from "@/lib/db/schema";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/admin/filter-select";
import { computeSeoScore } from "@/lib/seo/score";
import { toTiptapDoc } from "@/lib/editor/doc";
import { cn } from "@/lib/utils";
import { STATUS_ICONS } from "@/lib/admin/status-tabs";
import { PagesTable, type PageRow } from "./pages-table";

const STATUS_TABS = [
  { value: "all", label: "All Pages", icon: STATUS_ICONS.all },
  { value: "published", label: "Published", icon: STATUS_ICONS.published },
  { value: "draft", label: "Draft", icon: STATUS_ICONS.draft },
  { value: "scheduled", label: "Scheduled", icon: STATUS_ICONS.scheduled },
  { value: "archived", label: "Archived", icon: STATUS_ICONS.archived },
];

const RANGE_OPTIONS = [
  { value: "all", label: "All Dates" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; range?: string }>;
}) {
  const { status = "all", q = "", range = "all" } = await searchParams;

  const [allPages, seoRows] = await Promise.all([
    db.query.pages.findMany({ orderBy: (p, { desc }) => desc(p.updatedAt) }),
    db.select().from(seoMeta).where(eq(seoMeta.entityType, "page")),
  ]);

  const seoByPageId = new Map(seoRows.map((s) => [s.entityId, s]));

  const counts = {
    all: allPages.length,
    published: allPages.filter((p) => p.status === "published").length,
    draft: allPages.filter((p) => p.status === "draft").length,
    scheduled: allPages.filter((p) => p.status === "scheduled").length,
    archived: allPages.filter((p) => p.status === "archived").length,
  };

  const cutoff = RANGE_DAYS[range] ? Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000 : null;
  const needle = q.trim().toLowerCase();

  const rows: PageRow[] = allPages
    .filter((p) => status === "all" || p.status === status)
    .filter((p) => !cutoff || p.updatedAt.getTime() >= cutoff)
    .filter((p) => !needle || p.title.toLowerCase().includes(needle) || p.template.toLowerCase().includes(needle))
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      template: p.template,
      seoScore: computeSeoScore({ title: p.title, slug: p.slug, content: toTiptapDoc(p.content), seo: seoByPageId.get(p.id) }),
    }));

  function tabHref(tabStatus: string) {
    const params = new URLSearchParams();
    if (tabStatus !== "all") params.set("status", tabStatus);
    if (q) params.set("q", q);
    if (range !== "all") params.set("range", range);
    const qs = params.toString();
    return qs ? `/admin/pages?${qs}` : "/admin/pages";
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Pages</h1>
          <p className="mt-1 text-muted-foreground">Manage your site's static pages.</p>
        </div>
        <Link href="/admin/pages/new" className={cn(buttonVariants({ size: "lg" }), "gap-1.5 rounded-full")}>
          <Plus className="size-4" />
          Create New
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.value}
              href={tabHref(tab.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground hover:bg-accent",
              )}
            >
              <Icon className="size-3.5" />
              {tab.label} ({counts[tab.value as keyof typeof counts]})
            </Link>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="w-48">
          <FilterSelect
            paramName="range"
            options={RANGE_OPTIONS}
            defaultValue="all"
            icon={<CalendarDays className="size-4 shrink-0 text-muted-foreground" />}
          />
        </div>
        <form method="GET" className="relative min-w-[260px] flex-1">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {range !== "all" && <input type="hidden" name="range" value={range} />}
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search by title or template…" className="pl-9" />
        </form>
      </div>

      <PagesTable rows={rows} />
    </div>
  );
}
