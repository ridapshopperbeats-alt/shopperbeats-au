import { CategoryItem } from "@/types/megamenu";
import { getRawCategories } from "@/lib/utils/main-utils";

function sortCategories(categories: CategoryItem[]): CategoryItem[] {
  return categories
    .slice()
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    )
    .map((cat) => ({
      ...cat,
      subcategories: cat.subcategories
        ? sortCategories(cat.subcategories)
        : [],
    }));
}

export async function getCategoryData(
  parentSlug?: string
): Promise<CategoryItem[]> {
  const data = (await getRawCategories()) as unknown as CategoryItem[];

  // Sort full tree first
  const sortedData = sortCategories(data);

  if (!parentSlug) {
    return sortedData;
  }

  const findCategory = (
    categories: CategoryItem[],
    slug: string
  ): CategoryItem | null => {
    for (const cat of categories) {
      if (cat.slug === slug) return cat;
      if (cat.subcategories?.length) {
        const found = findCategory(cat.subcategories, slug);
        if (found) return found;
      }
    }
    return null;
  };

  const category = findCategory(sortedData, parentSlug);

  // Return already sorted subcategories
  return category?.subcategories || [];
}
