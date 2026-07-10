import { db } from "@/lib/db";
import { MediaGrid } from "./media-grid";

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
