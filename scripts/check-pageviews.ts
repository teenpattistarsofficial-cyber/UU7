import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(pageViews);
  console.log("Total page views logged:", count);

  const [{ count: last7d }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pageViews)
    .where(sql`created_at > now() - interval '7 days'`);
  console.log("Page views in last 7 days:", last7d);

  const top = await db
    .select({ path: pageViews.path, count: sql<number>`count(*)::int` })
    .from(pageViews)
    .where(sql`created_at > now() - interval '7 days'`)
    .groupBy(pageViews.path)
    .orderBy(sql`count(*) desc`)
    .limit(10);
  console.log("Top paths (last 7 days):", top);
  process.exit(0);
}
main();
