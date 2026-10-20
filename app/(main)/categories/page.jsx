import { getCategories } from "@/actions/category";
import { CategoryManager } from "./_components/category-manager";

export const metadata = { title: "Categories | Fiscora" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="px-5 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-5xl gradient-title">Categories</h1>
        <p className="text-muted-foreground mt-2">
          Default categories come with Fiscora. Add your own and they appear in the
          transaction form straight away.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
