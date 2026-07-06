import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Authors" };

// This route has no params, so without `force-dynamic` Next would try to
// statically prerender it (including at `next build` time, requiring a
// live DATABASE_URL in the Docker build). lib/actions/authors.ts already
// revalidates this path on mutations for immediacy.
export const dynamic = "force-dynamic";

export default async function AuthorsDirectoryPage() {
  const rows = await db.query.authors.findMany({ orderBy: (a, { asc }) => asc(a.displayName) });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-semibold">Authors</h1>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">No authors published yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((a) => (
            <Link key={a.id} href={`/authors/${a.slug}`} className="rounded-lg border p-4 hover:bg-muted/50">
              <div className="font-medium">{a.displayName}</div>
              {a.roleTitle && <div className="text-sm text-muted-foreground">{a.roleTitle}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
