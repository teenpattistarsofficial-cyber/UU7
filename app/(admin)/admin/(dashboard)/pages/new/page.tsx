import { PageForm } from "../page-form";
import { createPage } from "@/lib/actions/pages";

export default function NewPagePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New page</h1>
      <PageForm action={createPage} />
    </div>
  );
}
