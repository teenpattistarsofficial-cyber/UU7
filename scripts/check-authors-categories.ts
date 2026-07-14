import { db } from "@/lib/db";
import { authors, categories } from "@/lib/db/schema";

async function main() {
  const allAuthors = await db.select().from(authors);
  console.log("AUTHORS:");
  for (const a of allAuthors) console.log(`  ${a.id} | slug: ${a.slug} | ${a.displayName}`);
  const allCategories = await db.select().from(categories);
  console.log("CATEGORIES:");
  for (const c of allCategories) console.log(`  ${c.id} | slug: ${c.slug} | ${c.name}`);
  process.exit(0);
}
main();
