import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages, seoMeta } from "@/lib/db/schema";
import { PageForm } from "../../page-form";
import { updatePage } from "@/lib/actions/pages";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, seo] = await Promise.all([
    db.query.pages.findFirst({ where: eq(pages.id, id) }),
    db.query.seoMeta.findFirst({ where: and(eq(seoMeta.entityType, "page"), eq(seoMeta.entityId, id)) }),
  ]);
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit page</h1>
      <PageForm action={updatePage.bind(null, id)} defaultValues={{ ...page, seo }} />
    </div>
  );
}
