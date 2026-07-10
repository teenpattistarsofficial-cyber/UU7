import Link from "next/link";
import { BarChart3, Image as ImageIcon, Clock, History, LogIn, FileText, Trash2 } from "lucide-react";
import { MiniBarChart } from "@/components/admin/dashboard/mini-bar-chart";
import { Badge } from "@/components/ui/badge";
import { ActivityLogList } from "@/components/admin/dashboard/activity-log-list";

const STATUS_TONE: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-600",
  draft: "bg-amber-500/10 text-amber-600",
  scheduled: "bg-blue-500/10 text-blue-600",
  archived: "bg-muted text-muted-foreground",
};

const ACTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
};

export function iconForAction(action: string) {
  if (ACTION_ICON[action]) return ACTION_ICON[action];
  if (action.includes("deleted")) return Trash2;
  return FileText;
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function describeAction(action: string, entityLabel: string | null): string {
  const label = entityLabel ? ` "${entityLabel}"` : "";
  switch (action) {
    case "login":
      return "logged in";
    case "post.created":
      return `created a post${label}`;
    case "post.published":
      return `published a post${label}`;
    case "post.deleted":
      return `moved a post to trash${label}`;
    case "post.deleted_permanently":
      return `permanently deleted a post${label}`;
    case "page.created":
      return `created a page${label}`;
    case "page.deleted":
      return `moved a page to trash${label}`;
    case "page.deleted_permanently":
      return `permanently deleted a page${label}`;
    case "category.created":
      return `created a category${label}`;
    case "category.deleted":
      return `moved a category to trash${label}`;
    case "category.deleted_permanently":
      return `permanently deleted a category${label}`;
    case "author.created":
      return `added an author${label}`;
    case "author.deleted":
      return `moved an author to trash${label}`;
    case "author.deleted_permanently":
      return `permanently deleted an author${label}`;
    case "user.created":
      return `added a user${label}`;
    case "user.role_changed":
      return `changed a user's role${label}`;
    case "user.deleted":
      return `removed a user${label}`;
    default:
      return action;
  }
}

export function MonthlyActivityCharts({
  publishing,
  comments,
  uploads,
}: {
  publishing: { label: string; count: number }[];
  comments: { label: string; count: number }[];
  uploads: { label: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <BarChart3 className="size-3.5 text-brand" />
          Publishing Activity
        </h3>
        <MiniBarChart data={publishing} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <BarChart3 className="size-3.5 text-emerald-600" />
          Comment Activity
        </h3>
        <MiniBarChart data={comments} color="var(--color-emerald-500, #10b981)" />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <ImageIcon className="size-3.5 text-violet-600" />
          Upload Activity
        </h3>
        <MiniBarChart data={uploads} color="var(--color-violet-500, #8b5cf6)" />
      </div>
    </div>
  );
}

export function RecentPostsSection({
  posts,
}: {
  posts: { id: string; title: string; status: string; updatedAt: Date; authorName: string | null }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Clock className="size-3.5 text-brand" />
          Recent Posts
        </h3>
        <Link href="/admin/posts" className="text-xs font-medium text-brand hover:underline">
          View All →
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="space-y-1">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/40">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.title}</p>
                {p.authorName && <p className="text-xs text-muted-foreground">{p.authorName}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge className={STATUS_TONE[p.status] ?? "bg-muted text-muted-foreground"} variant="outline">
                  {p.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">{p.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivityLogSection({
  entries,
}: {
  entries: { id: string; userName: string; action: string; entityLabel: string | null; createdAt: Date }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <History className="size-3.5 text-brand" />
          Activity Log
        </h3>
        <span className="text-xs text-muted-foreground">Last {entries.length} events</span>
      </div>
      {entries.length === 0 ? <p className="text-sm text-muted-foreground">No activity recorded yet.</p> : <ActivityLogList entries={entries} />}
    </div>
  );
}
