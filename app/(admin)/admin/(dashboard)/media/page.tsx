import { db } from "@/lib/db";
import { MediaGrid } from "./media-grid";

// No params/searchParams here for Next to infer dynamic rendering from, so
// without this, `next build` tries to statically prerender it — which runs
// this DB query at build time with no DATABASE_URL available (see the
// Dockerfile's comment on this exact failure mode).
export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const rows = await db.query.media.findMany({ orderBy: (m, { desc }) => desc(m.createdAt) });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="mt-1 text-muted-foreground">Upload and manage images used across posts and pages.</p>
      </div>
      <MediaGrid initialRows={rows} />
    </div>
  );
}
