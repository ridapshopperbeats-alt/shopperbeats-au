import { MegaMenuCategory } from "@/types/megamenu";
import { Category } from "@/types/product";
import { getRawCategories } from "@/lib/utils/get-raw-categories";

const MAIN_CATEGORY_ORDER = [
  "Home & Garden",
  "Furniture",
  "Health & Beauty",
  "Toys & Games",
  "Baby & Kids",
  "Sports & Outdoor",
  "Appliances",
  "Electronics",
  "Rugs",
  "Tools & Equipment",
  "Hobbies & Entertainment",
  "Fashion",
  "Food & Beverages",
  "Vehicles & Parts",
  "Business & Industrial",
  "Books & Media",
];


function transformCategory(category: Category, level = 1): MegaMenuCategory {
  const slug = category.slug ?? "";
  const children: Category[] = category.subcategories ?? [];

  return {
    name: category.name,
    id: category.id,
    slug,
    product_count: category.product_count ?? 0,
    href: `/category/${slug}`,
    ...(level > 1 && { viewAll: `/category/${slug}` }),
    subcategories: children
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((sub) => transformCategory(sub, level + 1)),
    links: children
      .filter((child) => !child.subcategories?.length)
      .map((child) => ({
        name: child.name,
        href: `/category/${child.slug ?? ""}`,
        product_count: child.product_count ?? 0,
      })),
  };
}


export async function getMegaMenuData() {
  const data: Category[] = await getRawCategories();

  if (!data.length) return [];

  const orderedMainCategories = [
    ...MAIN_CATEGORY_ORDER
      .map((name) => data.find((cat) => cat.name?.toLowerCase().includes(name.toLowerCase())))
      .filter((cat): cat is Category => !!cat),
    ...data.filter((cat) => !MAIN_CATEGORY_ORDER.includes(cat.name)),
  ];

  return orderedMainCategories.map((category) => transformCategory(category));
}
