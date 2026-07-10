import Link from "next/link";
import { Search, Layers, Clock, CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AdminPagination, paginate, parsePerPage } from "@/components/admin/pagination";
import { CommentsTable, type CommentRow } from "./comments-table";

// searchParams alone doesn't reliably force dynamic rendering in this
// Next.js/Turbopack build — confirmed empirically (see the Dockerfile's
// comment on this failure mode). Every admin page doing a live DB read
// needs its own explicit force-dynamic.
export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { value: "all", label: "All", icon: Layers },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "approved", label: "Approved", icon: CheckCircle2 },
  { value: "rejected", label: "Rejected", icon: XCircle },
];

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; perPage?: string }>;
}) {
  const { status = "all", q = "", page: rawPage, perPage: rawPerPage } = await searchParams;
  const perPage = parsePerPage(rawPerPage);

  const [allComments, postRows] = await Promise.all([
    db.query.comments.findMany({ orderBy: (c, { desc }) => desc(c.createdAt) }),
    db.select({ id: posts.id, title: posts.title, slug: posts.slug }).from(posts),
  ]);

  const postById = new Map(postRows.map((p) => [p.id, p]));
  const counts = {
    all: allComments.length,
    pending: allComments.filter((c) => c.status === "pending").length,
    approved: allComments.filter((c) => c.status === "approved").length,
    rejected: allComments.filter((c) => c.status === "rejected").length,
  };

  const needle = q.trim().toLowerCase();
  const rows: CommentRow[] = allComments
    .filter((c) => status === "all" || c.status === status)
    .filter((c) => {
      if (!needle) return true;
      const post = c.postId ? postById.get(c.postId) : null;
      return [c.authorName, c.authorEmail, c.content, post?.title].some((v) => v?.toLowerCase().includes(needle));
    })
    .map((c) => {
      const post = postById.get(c.postId);
      return {
        id: c.id,
        authorName: c.authorName,
        authorEmail: c.authorEmail,
        content: c.content,
        status: c.status,
        createdAt: c.createdAt,
        postTitle: post?.title ?? "Unknown post",
        postSlug: post?.slug ?? null,
      };
    });

  const { pageRows, currentPage, totalPages, totalItems } = paginate(rows, rawPage, perPage);

  function tabHref(tabStatus: string) {
    const params = new URLSearchParams();
    if (tabStatus !== "all") params.set("status", tabStatus);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/comments?${qs}` : "/admin/comments";
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Comments</h1>
          <p className="mt-1 text-muted-foreground">Moderate visitor comments before they appear on posts.</p>
        </div>
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
                isActive ? "bg-brand text-brand-foreground" : "border border-border text-foreground hover:bg-accent",
              )}
            >
              <Icon className="size-3.5" />
              {tab.label} ({counts[tab.value as keyof typeof counts]})
            </Link>
          );
        })}
      </div>

      <div className="mb-6">
        <form method="GET" className="relative max-w-md">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {rawPerPage && <input type="hidden" name="perPage" value={rawPerPage} />}
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search by name, email, post, or content…" className="pl-9" />
        </form>
      </div>

      <CommentsTable rows={pageRows} />
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        basePath="/admin/comments"
        params={{ status: status !== "all" ? status : undefined, q: q || undefined, perPage: rawPerPage }}
      />
    </div>
  );
}
