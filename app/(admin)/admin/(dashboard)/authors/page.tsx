import Link from "next/link";
import { isNull } from "drizzle-orm";
import { Plus, Search, Layers, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AdminPagination, paginate, parsePerPage } from "@/components/admin/pagination";
import { AuthorsTable, type AuthorRow } from "./authors-table";

const STATUS_TABS = [
  { value: "all", label: "All Authors", icon: Layers },
  { value: "trash", label: "Trash", icon: Trash2 },
];

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; perPage?: string }>;
}) {
  const { status = "all", q = "", page: rawPage, perPage: rawPerPage } = await searchParams;
  const perPage = parsePerPage(rawPerPage);

  const [allAuthors, allPosts] = await Promise.all([
    db.query.authors.findMany({ orderBy: (a, { asc }) => asc(a.displayName) }),
    // Live posts only, matching what actually shows on the author's public
    // profile page, not a count inflated by trashed posts.
    db.select({ authorId: posts.authorId }).from(posts).where(isNull(posts.deletedAt)),
  ]);

  const postCountByAuthorId = new Map<string, number>();
  for (const post of allPosts) {
    if (!post.authorId) continue;
    postCountByAuthorId.set(post.authorId, (postCountByAuthorId.get(post.authorId) ?? 0) + 1);
  }

  const live = allAuthors.filter((a) => !a.deletedAt);
  const trashed = allAuthors.filter((a) => a.deletedAt);

  const counts = { all: live.length, trash: trashed.length };
  const needle = q.trim().toLowerCase();

  const rows: AuthorRow[] = (status === "trash" ? trashed : live)
    .filter(
      (a) =>
        !needle ||
        a.displayName.toLowerCase().includes(needle) ||
        a.slug.toLowerCase().includes(needle) ||
        a.roleTitle?.toLowerCase().includes(needle),
    )
    .map((a) => ({
      id: a.id,
      displayName: a.displayName,
      slug: a.slug,
      roleTitle: a.roleTitle,
      avatarUrl: a.avatarUrl,
      postCount: postCountByAuthorId.get(a.id) ?? 0,
      deletedAt: a.deletedAt,
    }));

  const { pageRows, currentPage, totalPages, totalItems } = paginate(rows, rawPage, perPage);

  function tabHref(tabStatus: string) {
    const params = new URLSearchParams();
    if (tabStatus !== "all") params.set("status", tabStatus);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/authors?${qs}` : "/admin/authors";
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{status === "trash" ? "Trash" : "Authors"}</h1>
          <p className="mt-1 text-muted-foreground">
            {status === "trash"
              ? "Authors moved to Trash — restore them or delete permanently."
              : "Bylines and trust signals for the site's content."}
          </p>
        </div>
        <Link href="/admin/authors/new" className={cn(buttonVariants({ variant: "brand", size: "lg" }), "gap-1.5 rounded-full")}>
          <Plus className="size-4" />
          New author
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
          <Input name="q" defaultValue={q} placeholder="Search by name, slug, or role…" className="pl-9" />
        </form>
      </div>

      <AuthorsTable rows={pageRows} isTrashView={status === "trash"} />
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        basePath="/admin/authors"
        params={{ status: status !== "all" ? status : undefined, q: q || undefined, perPage: rawPerPage }}
      />
    </div>
  );
}
