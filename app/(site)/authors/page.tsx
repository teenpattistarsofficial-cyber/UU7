import Link from "next/link";
import type { Metadata } from "next";
import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { Breadcrumb } from "@/components/site/breadcrumb";

export const metadata: Metadata = { title: "Authors" };

// This route has no params, so without `force-dynamic` Next would try to
// statically prerender it (including at `next build` time, requiring a
// live DATABASE_URL in the Docker build). lib/actions/authors.ts already
// revalidates this path on mutations for immediacy.
export const dynamic = "force-dynamic";

export default async function AuthorsDirectoryPage() {
  const rows = await db.query.authors.findMany({ orderBy: (a, { asc }) => asc(a.displayName) });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Authors" }]} />

      <div className="mb-10 flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Users className="size-6" />
        </span>
        <div>
          <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-brand uppercase">Meet the team</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Authors</h1>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground">No authors published yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => (
            <Link
              key={a.id}
              href={`/authors/${a.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-12px_rgba(0,0,0,0.12)]"
            >
              <AuthorAvatar displayName={a.displayName} avatarUrl={a.avatarUrl} size="size-14" />
              <div className="min-w-0">
                <div className="font-heading font-semibold group-hover:text-brand">{a.displayName}</div>
                {a.roleTitle && <div className="text-sm text-muted-foreground">{a.roleTitle}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
