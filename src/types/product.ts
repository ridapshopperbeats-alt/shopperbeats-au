import { WishlistKey } from "./wishlist";

export interface Variant {
  id: string;
  status?: string;
  price: number;
  rrp_price?: string;
  stock: number;
  sku?: string;
  image_url?: string | null;
  images?: { image_url: string; is_main?: boolean, image_order?: number }[] | string;
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
  sale_price?: string,
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
  images?: string | { image_url: string, is_main: boolean, image_order?: number }[];
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
  data: (Product & { attributes: { name: string; value: string; }[]; })[];
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

export interface ProductLikeCardProps {
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
  rating: number;
  reviewCount: number;
  linkHref: string;
  discountPercentage?: number;
  saveAmount?: number;
  productId: string;
  variantId?: string;
}
