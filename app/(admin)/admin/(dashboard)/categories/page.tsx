import Link from "next/link";
import { eq, isNull } from "drizzle-orm";
import { Plus, Search, Layers, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { seoMeta, posts } from "@/lib/db/schema";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeSeoScore } from "@/lib/seo/score";
import { cn } from "@/lib/utils";
import { AdminPagination, paginate, parsePerPage } from "@/components/admin/pagination";
import { CategoriesTable, type CategoryRow } from "./categories-table";

const STATUS_TABS = [
  { value: "all", label: "All Categories", icon: Layers },
  { value: "trash", label: "Trash", icon: Trash2 },
];

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; perPage?: string }>;
}) {
  const { status = "all", q = "", page: rawPage, perPage: rawPerPage } = await searchParams;
  const perPage = parsePerPage(rawPerPage);

  const [allCategories, seoRows, allPosts] = await Promise.all([
    db.query.categories.findMany({ orderBy: (c, { asc }) => asc(c.name) }),
    db.select().from(seoMeta).where(eq(seoMeta.entityType, "category")),
    // Live posts only — matches exactly what the trash guard in
    // lib/actions/categories.ts checks. Counting trashed posts too would
    // show a nonzero count for a category that's actually safe to trash,
    // confusing an editor about why the guard doesn't fire.
    db.select({ categoryId: posts.categoryId }).from(posts).where(isNull(posts.deletedAt)),
  ]);

  const seoByCategoryId = new Map(seoRows.map((s) => [s.entityId, s]));
  const postCountByCategoryId = new Map<string, number>();
  for (const post of allPosts) {
    if (!post.categoryId) continue;
    postCountByCategoryId.set(post.categoryId, (postCountByCategoryId.get(post.categoryId) ?? 0) + 1);
  }

  const live = allCategories.filter((c) => !c.deletedAt);
  const trashed = allCategories.filter((c) => c.deletedAt);

  const counts = { all: live.length, trash: trashed.length };
  const needle = q.trim().toLowerCase();

  const rows: CategoryRow[] = (status === "trash" ? trashed : live)
    .filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.slug.toLowerCase().includes(needle))
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      postCount: postCountByCategoryId.get(c.id) ?? 0,
      deletedAt: c.deletedAt,
      seoScore: computeSeoScore({ title: c.name, slug: c.slug, content: undefined, seo: seoByCategoryId.get(c.id) }),
    }));

  const { pageRows, currentPage, totalPages, totalItems } = paginate(rows, rawPage, perPage);

  function tabHref(tabStatus: string) {
    const params = new URLSearchParams();
    if (tabStatus !== "all") params.set("status", tabStatus);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/categories?${qs}` : "/admin/categories";
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{status === "trash" ? "Trash" : "Categories"}</h1>
          <p className="mt-1 text-muted-foreground">
            {status === "trash"
              ? "Categories moved to Trash — restore them or delete permanently."
              : "Organize guides into the site's top-level sections."}
          </p>
        </div>
        <Link href="/admin/categories/new" className={cn(buttonVariants({ variant: "brand", size: "lg" }), "gap-1.5 rounded-full")}>
          <Plus className="size-4" />
          New category
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
          <Input name="q" defaultValue={q} placeholder="Search by name or slug…" className="pl-9" />
        </form>
      </div>

      <CategoriesTable rows={pageRows} isTrashView={status === "trash"} />
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        basePath="/admin/categories"
        params={{ status: status !== "all" ? status : undefined, q: q || undefined, perPage: rawPerPage }}
      />
    </div>
  );
}
