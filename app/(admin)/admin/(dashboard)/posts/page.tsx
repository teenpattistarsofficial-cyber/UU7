import Link from "next/link";
import { eq } from "drizzle-orm";
import { Plus, Search, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { authors, categories, seoMeta, tags, postTags } from "@/lib/db/schema";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterSelect } from "@/components/admin/filter-select";
import { computeSeoScore } from "@/lib/seo/score";
import { toTiptapDoc } from "@/lib/editor/doc";
import { cn } from "@/lib/utils";
import { STATUS_ICONS } from "@/lib/admin/status-tabs";
import { AdminPagination, paginate, parsePerPage } from "@/components/admin/pagination";
import { PostsTable, type PostRow } from "./posts-table";

// searchParams alone doesn't reliably force dynamic rendering in this
// Next.js/Turbopack build — confirmed empirically (see the Dockerfile's
// comment on this failure mode). Every admin page doing a live DB read
// needs its own explicit force-dynamic.
export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { value: "all", label: "All Posts", icon: STATUS_ICONS.all },
  { value: "published", label: "Published", icon: STATUS_ICONS.published },
  { value: "draft", label: "Draft", icon: STATUS_ICONS.draft },
  { value: "scheduled", label: "Scheduled", icon: STATUS_ICONS.scheduled },
  { value: "archived", label: "Archived", icon: STATUS_ICONS.archived },
  { value: "trash", label: "Trash", icon: STATUS_ICONS.trash },
];

const RANGE_OPTIONS = [
  { value: "all", label: "All Dates" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; range?: string; page?: string; perPage?: string }>;
}) {
  const { status = "all", q = "", range = "all", page: rawPage, perPage: rawPerPage } = await searchParams;
  const perPage = parsePerPage(rawPerPage);

  const [allPosts, categoryRows, authorRows, seoRows, tagJoinRows] = await Promise.all([
    db.query.posts.findMany({ orderBy: (p, { desc }) => desc(p.updatedAt) }),
    db.select().from(categories),
    db.select().from(authors),
    db.select().from(seoMeta).where(eq(seoMeta.entityType, "post")),
    db.select({ postId: postTags.postId, name: tags.name }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)),
  ]);

  const categoryById = new Map(categoryRows.map((c) => [c.id, c]));
  const authorById = new Map(authorRows.map((a) => [a.id, a]));
  const seoByPostId = new Map(seoRows.map((s) => [s.entityId, s]));
  const tagsByPostId = new Map<string, string[]>();
  for (const row of tagJoinRows) {
    tagsByPostId.set(row.postId, [...(tagsByPostId.get(row.postId) ?? []), row.name]);
  }

  const live = allPosts.filter((p) => !p.deletedAt);
  const trashed = allPosts.filter((p) => p.deletedAt);

  const counts = {
    all: live.length,
    published: live.filter((p) => p.status === "published").length,
    draft: live.filter((p) => p.status === "draft").length,
    scheduled: live.filter((p) => p.status === "scheduled").length,
    archived: live.filter((p) => p.status === "archived").length,
    trash: trashed.length,
  };

  const cutoff = RANGE_DAYS[range] ? Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000 : null;
  const needle = q.trim().toLowerCase();

  const rows: PostRow[] = (status === "trash" ? trashed : live)
    .filter((p) => status === "trash" || status === "all" || p.status === status)
    .filter((p) => !cutoff || p.updatedAt.getTime() >= cutoff)
    .filter((p) => {
      if (!needle) return true;
      const category = p.categoryId ? categoryById.get(p.categoryId)?.name : "";
      const author = p.authorId ? authorById.get(p.authorId)?.displayName : "";
      return [p.title, category, author].some((v) => v?.toLowerCase().includes(needle));
    })
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      deletedAt: p.deletedAt,
      featuredImageUrl: p.featuredImageUrl,
      categoryName: p.categoryId ? (categoryById.get(p.categoryId)?.name ?? null) : null,
      categorySlug: p.categoryId ? (categoryById.get(p.categoryId)?.slug ?? null) : null,
      authorName: p.authorId ? (authorById.get(p.authorId)?.displayName ?? null) : null,
      tagNames: tagsByPostId.get(p.id) ?? [],
      seoScore: computeSeoScore({
        title: p.title,
        slug: p.slug,
        content: toTiptapDoc(p.content),
        seo: seoByPostId.get(p.id),
        featuredImageUrl: p.featuredImageUrl,
      }),
    }));

  const { pageRows, currentPage, totalPages, totalItems } = paginate(rows, rawPage, perPage);

  function tabHref(tabStatus: string) {
    const params = new URLSearchParams();
    if (tabStatus !== "all") params.set("status", tabStatus);
    if (q) params.set("q", q);
    if (range !== "all") params.set("range", range);
    const qs = params.toString();
    return qs ? `/admin/posts?${qs}` : "/admin/posts";
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{status === "trash" ? "Trash" : "All Posts"}</h1>
          <p className="mt-1 text-muted-foreground">
            {status === "trash"
              ? "Posts moved to Trash — restore them or delete permanently."
              : "Manage, edit, or delete your blog content."}
          </p>
        </div>
        <Link href="/admin/posts/new" className={cn(buttonVariants({ variant: "brand", size: "lg" }), "gap-1.5 rounded-full")}>
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
                  ? "bg-brand text-brand-foreground"
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
          {rawPerPage && <input type="hidden" name="perPage" value={rawPerPage} />}
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search by title, category, or author…" className="pl-9" />
        </form>
      </div>

      <PostsTable rows={pageRows} isTrashView={status === "trash"} />
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        basePath="/admin/posts"
        params={{
          status: status !== "all" ? status : undefined,
          q: q || undefined,
          range: range !== "all" ? range : undefined,
          perPage: rawPerPage,
        }}
      />
    </div>
  );
}
