import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";
import { RedirectsTable } from "./redirects-table";

// No params/searchParams here for Next to infer dynamic rendering from, so
// without this, `next build` tries to statically prerender it — which runs
// a live DB query at build time with no DATABASE_URL available (see the
// Dockerfile's comment on this exact failure mode).
export const dynamic = "force-dynamic";

export default async function RedirectsPage() {
  const rows = await db.select().from(redirects).orderBy(desc(redirects.createdAt));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Redirects</h1>
        <p className="mt-1 text-muted-foreground">Send old or changed URLs to their new destination instead of 404ing.</p>
      </div>
      <RedirectsTable initialRows={rows} />
    </div>
  );
}
