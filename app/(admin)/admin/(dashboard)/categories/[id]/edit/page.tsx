import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, seoMeta } from "@/lib/db/schema";
import { CategoryForm } from "../../category-form";
import { updateCategory } from "@/lib/actions/categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, seo] = await Promise.all([
    db.query.categories.findFirst({ where: eq(categories.id, id) }),
    db.query.seoMeta.findFirst({ where: and(eq(seoMeta.entityType, "category"), eq(seoMeta.entityId, id)) }),
  ]);
  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit category</h1>
      <CategoryForm action={updateCategory.bind(null, id)} defaultValues={{ ...category, seo }} />
    </div>
  );
}
