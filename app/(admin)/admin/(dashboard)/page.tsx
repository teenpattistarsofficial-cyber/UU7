import Link from "next/link";
import { headers } from "next/headers";
import { FileText, StickyNote, FolderTree, Users, Settings, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { posts, pages, categories, authors } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function loadCounts() {
  try {
    const [postCount, pageCount, categoryCount, authorCount] = await Promise.all([
      db.$count(posts),
      db.$count(pages),
      db.$count(categories),
      db.$count(authors),
    ]);
    return { dbOk: true as const, postCount, pageCount, categoryCount, authorCount };
  } catch {
    return { dbOk: false as const, postCount: 0, pageCount: 0, categoryCount: 0, authorCount: 0 };
  }
}

export default async function AdminDashboardPage() {
  const [{ dbOk, postCount, pageCount, categoryCount, authorCount }, session] = await Promise.all([
    loadCounts(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const stats = [
    { label: "Posts", value: postCount, icon: FileText, caption: "Total posts" },
    { label: "Pages", value: pageCount, icon: StickyNote, caption: "Static pages" },
    { label: "Categories", value: categoryCount, icon: FolderTree, caption: "Content categories" },
    { label: "Authors", value: authorCount, icon: Users, caption: "Content authors" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill ok label={dbOk ? "Online" : "Degraded"} />
            <StatusPill ok={dbOk} label={dbOk ? "DB OK" : "DB error"} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as {session?.user?.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/settings" className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}>
            <Settings className="size-4" />
            Settings
          </Link>
          <Link href="/admin/posts/new" className={cn(buttonVariants(), "gap-1.5")}>
            <Plus className="size-4" />
            Write post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="group/stat border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-foreground/25 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),0_16px_32px_-16px_rgba(0,0,0,0.15)]"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </CardTitle>
                <div className="relative flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <div className="absolute inset-0 rounded-lg bg-accent-foreground/20 opacity-0 blur-md transition-opacity duration-200 group-hover/stat:opacity-100" />
                  <Icon className="relative size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.caption}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Visitor analytics, top pages, and CTA tracking land in Phase 7 once
          the Search Console/GA4 ingestion pipeline exists — intentionally
          not mocked here with fake numbers. */}
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        ok
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
          : "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      <span className={cn("size-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-destructive")} />
      {label}
    </span>
  );
}
