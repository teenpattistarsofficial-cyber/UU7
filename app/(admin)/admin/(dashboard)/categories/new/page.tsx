import { CategoryForm } from "../category-form";
import { createCategory } from "@/lib/actions/categories";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New category</h1>
      <CategoryForm action={createCategory} />
    </div>
  );
}
