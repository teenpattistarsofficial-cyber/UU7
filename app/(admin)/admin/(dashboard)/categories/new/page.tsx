import { CategoryForm } from "../category-form";
import { createCategory } from "@/lib/actions/categories";

export default function NewCategoryPage() {
  return <CategoryForm action={createCategory} />;
}
