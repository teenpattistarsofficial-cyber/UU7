import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { AuthorForm } from "../../author-form";
import { updateAuthor } from "@/lib/actions/authors";

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = await db.query.authors.findFirst({ where: eq(authors.id, id) });
  if (!author) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit author</h1>
      <AuthorForm action={updateAuthor.bind(null, id)} defaultValues={author} />
    </div>
  );
}
