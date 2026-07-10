import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";
import { RedirectsTable } from "./redirects-table";

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
