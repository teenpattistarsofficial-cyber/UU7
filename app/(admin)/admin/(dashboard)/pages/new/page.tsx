import { PageForm } from "../page-form";
import { createPage } from "@/lib/actions/pages";

export default function NewPagePage() {
  return <PageForm action={createPage} />;
}
