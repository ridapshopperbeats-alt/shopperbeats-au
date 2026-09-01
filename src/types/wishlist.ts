import { Product, Variant, VariantAttribute } from "./product";

export interface WishlistItem extends Product {
  variant_id: string;
  variant_attributes?: VariantAttribute[];
  price?: string;
  created_at?: string;
  product_name:string;
  product_id:string;
  is_active: boolean;
  available_stock?: number;
  discount_price?: number
}

export interface Wishlist {
  items: WishlistItem[];
  total_items: number;
}

export interface WishlistKey {
  product_id: string;
  variant_id: string | null;
}

// Display data captured at the moment a guest wishlists a product, since a
// logged-out wishlist lives only in localStorage and has no backend record
// to fetch full product details from later.
export interface WishlistProductSnapshot {
  image: string;
  title?: string;
  brand_name?: string;
  mainPrice?: number;
  wasPrice?: number;
  showWasPrice?: boolean;
  discountPercentage?: number;
  unique_code?: string;
  promotion_name?: string | null;
  stock?: number;
  tags?: string[];
  vendor_id?: string;
  ships_from_location?: string;
  handling_time_days?: number;
  handling_time_max_days?: number | null;
  variants?: Variant[];
  rating?: number;
  reviewCount?: number;
}

export interface UseWishlistToggleArgs {
  productId?: string;
  variantId?: string | null;
  wishlistItems?: WishlistKey[];
  syncWishlistItems?: React.Dispatch<React.SetStateAction<WishlistKey[]>>;
  requireVariant?: boolean;
  hasVariants?: boolean;
  matchAnyVariant?: boolean;
  productSnapshot?: WishlistProductSnapshot;
}