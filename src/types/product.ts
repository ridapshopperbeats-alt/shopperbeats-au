import type * as React from "react";
import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import { WishlistKey } from "./wishlist";
import type { AccordionItem } from "./ui";
import type { Brand as MainBrand } from "./main";

export interface Variant {
  id: string;
  status?: string;
  price: number;
  rrp_price?: string;
  stock: number;
  sku?: string;
  image_url?: string | null;
  images?:
    | { image_url: string; is_main?: boolean; image_order?: number }[]
    | string;
  attributes: { name: string; value: string }[];
  key_features?: string;
  length?: number;
  width?: number;
  weight?: number;
  height?: number;
  precautionary_note?: string;
  care_instructions?: string;
  warranty?: string;
}

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_profile_image?: string | null;
  images?: string[] | null;
  updated_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  image_url: string | null;
  is_active?: boolean;
  slug?: string;
}

export interface BundleProduct {
  product_id: string;
  unique_code?: string;
  variant_id: string;
  title: string;
  price: number;
  rrp_price: number;
  images: ProductImage[];
  variant_attributes: { name: string; value: string }[];
  promotion_name?: string | null;
  tags?: string[];
}

export interface Product {
  status?: string;
  thumbnail?: string;
  id?: string;
  unique_code?: string;
  title?: string;
  category_id?: string;
  description?: string;
  slug?: string;
  sale_price?: string;
  price?: string;
  length?: string;
  width?: string;
  weight?: string;
  height?: string;
  rrp_price?: string;
  category?: string;
  category_name?: string;
  category_slug?: string;
  brand_name?: string;
  images?:
    | string
    | { image_url: string; is_main: boolean; image_order?: number }[];
  image?: string;
  discount_percentage?: number;
  discounted_price?: number;
  free_shipping?: boolean;
  precautionary_note?: string;
  care_instructions?: string;
  warranty?: string;
  review_stats?: {
    average_rating: number;
    total_reviews: number;
  };
  handling_time_days?: number;
  handling_time_max_days?: number | null;
  variants?: Variant[];
  reviews?: Review[];
  return_policy?: string | null;
  oldPrice?: string;
  discount?: string;
  freeShipping?: boolean;
  fast_dispatch?: boolean;
  rating?: number;
  reviewCount?: number;
  size?: string;
  color?: string;
  quantity?: number;
  key_features?: string;
  variant_id?: string;
  variant_price?: number;
  variant_rrp_price?: number;
  sku?: string;
  bundle_group_code?: string;
  bundle_products?: BundleProduct[];
  ships_from_location?: string;
  brand_id?: string;
  brand_slug?: string;
  stock?: number;
  promotion_name?: string | null;
  vendor_id?: string;
  tags?: string[];
  product_unique_code?: string;
}

interface CategoryLink {
  name: string;
  href: string;
}

export interface Category {
  name: string;
  product_count?: number;
  subcategories?: Category[];
  id: string;
  parent_id?: string | null;
  links?: CategoryLink[];
  slug?: string;
  image_url?: string | null;
  icon_url?: string;
}

/** The only fields the schema.org ItemList entries read off a product. */
export interface JsonLdProduct {
  title?: string;
  unique_code?: string;
  slug?: string;
}

export interface Filter {
  attribute: string;
  values: string[];
}

export interface ProductImage {
  id?: string;
  image_url: string;
  is_main?: boolean;
  order?: number;
  image_order?: number;
  added_by?: string;
  variant_id?: string;
  video_url?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface ProductsResponse {
  data: (Product & { attributes: { name: string; value: string }[] })[];
  filters: Filter[];
  totalItems: number;
}

export interface ProductApiResponse {
  id: string;
  unique_code?: string;
  brand_name: string;
  brand_slug: string;
  sku: string;
  title: string;
  description: string;
  slug: string;
  price: string;
  image?: string;
  images?: { image_url: string; is_main: boolean }[];
  rrp_price: string;
  status: string;
  unit: string;
  supplier: string;
  country_of_origin: string;
  ean: null;
  handling_time_days?: number;
  handling_time_max_days?: number | null;
  asin: null;
  mpn: null;
  free_shipping: boolean;
  fast_dispatch: boolean;
  category_id: string;
  brand_id: string;
  stock: number;
  promotion_name: string | null;
  vendor_id?: string;
  discount_percentage: number;
  discounted_price: number;
  height: string;
  width: string;
  weight: string;
  length: string;
  precautionary_note?: string;
  care_instructions?: string;
  warranty?: string;
  review_stats: {
    average_rating: number;
    total_reviews: number;
  };
  tags?: string[];

  variants: Variant[];
  reviews: Review[];
  return_policy?: string | null;
  key_features?: string;
  bundle_group_code?: string;
  bundle_products?: BundleProduct[];
  ships_from_location?: string;
  seo?: {
    page_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    canonical_url?: string;
    url_handle?: string;
  };
}

export interface ProductCardProps {
  image: string;
  brand_name?: string;
  title?: string;
  mainPrice?: number;
  wasPrice?: number;
  discountPercentage?: number;
  saveAmount?: number;
  freeShipping?: boolean;
  rating?: number;
  reviewCount?: number;
  id?: string;
  showWasPrice?: boolean;
  defaultVariantId?: string;
  variants?: Variant[];
  unique_code?: string;
  promotion_name?: string | null;
  stock?: number;
  tags?: string[];
  wishlistItems?: WishlistKey[];
  vendor_id?: string;
  ships_from_location?: string;
  handling_time_days?: number;
  handling_time_max_days?: number | null;
  shippingCharge?: number | null;
}

export interface ProductCarouselProps {
  title: React.ReactNode;
  subtitle?: string;
  products?: Product[];
  bundleProducts?: BundleProduct[];
  from?: string;
  link?: string;
  istagsVisible?: boolean;
  isLoading?: boolean;
  withoutContainer?: boolean;
}


type AttributeOption = { value: string; stock: number | undefined };

export type ProductDetailContentProps = {
  product: Product;
  productTitle: string;

  selectedVariant: Variant | null;
  selectedAttributes: Record<string, string>;
  handleAttributeChange: (attrName: string, value: string) => void;
  findVariantForAttrValue: (
    attrName: string,
    value: string,
  ) => Variant | undefined;

  isProductInWishlist: boolean;
  isWishlistLoading: boolean | undefined;
  handleWishlistButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;

  isOutOfStock: boolean;
  mainPrice: number;
  wasPrice: number;
  saveAmount: number;
  discountPercentage: number;

  hasRealColors: boolean;
  hasRealStyles: boolean;
  colorAttrName: string | undefined;
  styleAttrName: string | undefined;
  colorSwatchOptions: (AttributeOption & { image: string })[];
  realStyleOptions: AttributeOption[];
  showPopup: boolean;
  setShowPopup: Dispatch<SetStateAction<boolean>>;
  /** Attribute selectors other than colour/style, rendered by the page. */
  remainingAttributeFields: ReactNode;

  shippingCharge: number | null;
  shippingStatus: "idle" | "checking" | "available" | "unavailable";

  mounted: boolean;
  selectedLocation: {
    pincode: string;
    suburb: string;
    state?: string;
  } | null;
  postcode: string | undefined;
  suburb: string | undefined;
  setShowLocationPopup: Dispatch<SetStateAction<boolean>>;

  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;

  isAddingToCart: boolean;
  isProductInCart: boolean | undefined;
  handleCartButtonClick: () => void;
  handleDisabledAddToCart: () => void;
  handleBuyNow: () => void;

  productFeatures: string[];
  finalRecommendations: Product[] | null | undefined;
  recentlyViewed: Product[] | null | undefined;
  isRecommendedForYouLoading: boolean;

  productTabItems: { key: string; label: string }[];
  activeTab: string;
  handleTabClick: (tab: string, index: number) => void;
  handleTabKeyDown: (e: React.KeyboardEvent, index: number) => void;
  tabRefs: RefObject<(HTMLLIElement | null)[]>;
  firstHalf: AccordionItem[];
  secondHalf: AccordionItem[];
};export type ProductDetailSidebarProps = {
  product: Product;
  selectedVariant: Variant | null;

  isOutOfStock: boolean;
  mainPrice: number;
  shippingCharge: number | null;
  shippingStatus: "idle" | "checking" | "available" | "unavailable";

  mounted: boolean;
  selectedLocation: {
    pincode: string;
    suburb: string;
    state?: string;
  } | null;
  postcode: string | undefined;
  suburb: string | undefined;
  setShowLocationPopup: Dispatch<SetStateAction<boolean>>;

  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;

  isAddingToCart: boolean;
  isProductInCart: boolean | undefined;
  handleCartButtonClick: () => void;
  handleDisabledAddToCart: () => void;
  handleBuyNow: () => void;
};

/* ------------------------------------------------------------------ *
 * PDP sub-components
 * ------------------------------------------------------------------ */

export interface ProductDetailsMobileTabsProps {
  featuresContent: React.ReactNode;
  descriptionContent: React.ReactNode;
  deliveryContent: React.ReactNode;
  reviews: Review[];
}

export interface ColorAttributeOption {
  value: string;
  stock?: number;
  image: string;
}

export interface ColorPopupProps {
  open: boolean;
  onClose: () => void;
  colors: ColorAttributeOption[];
  selectedColor: string;
  onSelectColor: (value: string) => void;
}

export interface DisplayReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
  reviewer_profile_image?: string | null;
  images?: (string | { image_url?: string; url?: string })[] | null;
}

export interface CustomerRatingViewPageProps {
  reviews?: Review[];
}

/* ------------------------------------------------------------------ *
 * Category / brand / listing pages
 * ------------------------------------------------------------------ */

export interface CategorySliderItem {
  id?: string;
  slug?: string;
  title: string;
  image: string;
  href?: string;
}

export interface CategorySliderProps {
  title: string;
  items: CategorySliderItem[];
  className?: string;
  arrows?: boolean;
  titleClassName?: string;
  onCategoryClick?: (item: CategorySliderItem) => void;
  getHref?: (item: CategorySliderItem) => string;
}

export interface BrandPageClientProps {
  brandId: string;
  brand: MainBrand;
  products: Product[];
  filters: Filter[];
  totalItems: number;
}

export interface ProductListingClientProps {
  slug: string;
  category: Category | null;
  products: Product[];
  filters: Filter[];
  totalItems: number;
  megaMenuData: Category[];
  bannerImage?: string | null;
}

export interface ProductsPageClientProps {
  products: Product[];
  totalItems: number;
}

export interface SearchPageClientProps {
  query: string;
  products: Product[];
  filters: Filter[];
  totalItems: number;
}

/* ------------------------------------------------------------------ *
 * Product listing (gallery, filter rail, grid)
 * ------------------------------------------------------------------ */

export interface ProductGalleryProps {
  product: Product;
  selectedVariant: Variant | null;
  isWishlisted?: boolean;
  onWishlistToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isWishlistLoading?: boolean;
}

export interface ImagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  images: ProductImage[];
  initialUrl: string;
  title: string;
}

/** The filter rail on category/search/brand pages. */
export interface SidebarProps {
  filters: Filter[];
  category?: Category | null;
  onClose?: () => void;
  onExpandedChange?: (expanded: boolean) => void;
  onClearAllFilters?: () => void;
  extractedBrands?: {
    name: string;
    slug: string;
    count: number;
  }[];
  extractedCategories?: {
    name: string;
    slug: string;
    count: number;
  }[];
  selectedCategorySlugs?: string[];
  // A slug toggles that category; null clears them all ("All Categories").
  onCategorySelect?: (categorySlug: string | null) => void;
  selectedPriceRange?: string | null;
  onPriceSelect?: (priceRange: string | null) => void;
  isHighlightPage?: boolean;

  slug?: string;

  priceCounts?: {
    under50: number;
    between50and100: number;
    between100and200: number;
    above200: number;
  };

  hideHeader?: boolean;
  wrapNavigation?: (fn: () => void) => void;
}

export type MobileFilterSheetProps = Omit<
  SidebarProps,
  "onClose" | "onClearAllFilters" | "hideHeader"
> & {
  open: boolean;
  onClose: () => void;
  onClearAll?: () => void;
};

export interface MobileSortSheetProps {
  open: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export interface ProductDisplayProps {
  products: Product[];
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categoryName?: string;
  isLoading?: boolean;
  infiniteScroll?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
  hideSortAndPagination?: boolean;
  wishlistItems?: WishlistKey[];
  onToggleSidebar: () => void;
  tags?: { key: string; label: string; onRemove: () => void }[];
  onClearFilters?: () => void;
  hideFilterButton?: boolean;
}

export interface BundleSectionProps {
  bundleProducts: BundleProduct[];
}

export interface DeliveryDetailsPopupProps {
  onClose: () => void;
  freeShipping: boolean;
  handlingTimeDays: number;
  fastDelivery: boolean;
  shippingCharge?: number;
}

/* ------------------------------------------------------------------ *
 * Category page
 * ------------------------------------------------------------------ */

export interface FilterComponentProps {
  filters: Filter[];
  category: Category;
  onClose: () => void;
}

/** Distinct from the product-listing MobileFilterSheetProps above: this is the
 *  shape the category page's dynamically imported sheet is typed against. */
export interface CategoryMobileFilterSheetProps extends FilterComponentProps {
  open: boolean;
  onClearAll: () => void;
}

export interface CategoryPageClientProps {
  slug: string;
  category: Category;
  products: Product[];
  filters: Filter[];
  totalItems: number;
  megaMenuData: Category[];
}

/* ------------------------------------------------------------------ *
 * Route-level props
 * ------------------------------------------------------------------ */

export interface ProductListingPageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface AllCategoriesPageProps {
  searchParams: { parent?: string };
}

/** Distinct from ProductsResponse above: the /products route asks for the
 *  flattened attribute list alongside each product. */
export interface ProductsWithAttributesResponse {
  data: (Product & { attributes: { name: string; value: string }[] })[];
  totalItems: number;
}

/* ------------------------------------------------------------------ *
 * Rendered product HTML
 * ------------------------------------------------------------------ */

export type ParseProps = {
  htmlString: string;
};

export type ProductData = {
  description: string;
  features: string[];
  specifications: Record<string, string>;
  packageContents: string[];
};

/**
 * The PDP content column already needs every value the sidebar does, so this
 * intersection is just the content column's props — written as an intersection
 * anyway so each child component stays the source of truth for what it takes.
 */
export type ProductDetailMainProps = ProductDetailContentProps &
  ProductDetailSidebarProps;
