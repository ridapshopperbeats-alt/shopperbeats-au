export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  product_count: number;
  image_url: string;
  subcategories: CategoryItem[];
  icon_url: string;
}

export interface MegaMenuLink {
  children: import("react").JSX.Element;
  name: string;
  href: string;
  product_count: number;
}

export interface MegaMenuCategory {
  id: string;
  name: string;
  slug: string;
  product_count: number;
  href: string;
  viewAll?: string;
  subcategories: MegaMenuCategory[];
  links: MegaMenuLink[];
}

export interface MegaMenuSubcategory {
  name: string;
  id: string;
  slug?: string;
  links: {
    name: string;
    href: string;
    children?: { name: string; href: string }[];
  }[];
  subcategories?: MegaMenuSubcategory[];
  viewAll?: string;
}
