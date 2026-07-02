import { AuthorForm } from "../author-form";
import { createAuthor } from "@/lib/actions/authors";

export default function NewAuthorPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New author</h1>
      <AuthorForm action={createAuthor} />
    </div>
  );
}
