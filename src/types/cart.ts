import type * as React from "react";
import type { Dispatch, ReactNode, Ref, RefObject, SetStateAction } from "react";
import { Product, VariantAttribute } from "./product";

export interface CartItem extends Product {
  id: string; 
  quantity: number;
  variant_id: string;
  variant_attributes: VariantAttribute[];
  unit_price: string;
  rrp_price_snapshot?: string;
  product_name: string;
  product_id: string;
  shipping_cost?: number;
  is_shippable?: boolean;
  is_active?: boolean;
  available_stock?: number;
  subtotal?: number;
  final_price?: number;
  original_price?: number;
  promotion_discount?: number;
  discount_per_unit?: number;
  discounted_unit_price?: number;
  applied_promotion_id?: string | null;
  applied_promotion_name?: string | null;
  cost_price_snapshot?: number;
  tags: string[];
  ships_from_location?: string;
  ean_code?: string | null;
  handling_time_days?: number;
  handling_time_max_days?: number | null;
  supplier?: string | null;
  brand?: string | null;
}

export interface CartState {
  items: CartItem[];
}

export interface Cart {
  items: CartItem[];
  total_price: number;
  subtotal: number;
  tax_total: number;
  items_total: number;
  items_discount: number;
  has_promotions: boolean;
  has_coupon: boolean;
  coupon_discount: number;
  coupon_usage_id: string | null;
  applied_coupon_code: string | null;
  shipping: number;
  shipping_cost: number;
  taxes: {
    name: string;
    rate: number;
    amount: string;
  }[];
  grand_total: number;
  id: string;
  applied_promo?: {
    code: string;
    discount_amount: number;
    discount_type: "percentage" | "fixed";
    discount_value: string;
  };
}

export interface PromoValidationResponse {
  is_valid: boolean;
  message: string;
  coupon_id: string | null;
  coupon_code: string | null;
  coupon_name: string | null;
  discount_type: "percentage" | "fixed" | null;
  discount_value: string | null;
  max_discount: string | null;
  reason: string | null;
}

export interface PromoData {
  new_total?: number;
  discount_amount?: number;
  code?: string;
  discount_type?: string;
  discount_value?: number;
}

export interface CapturePaymentResponse {
  status: string;
  order_id?: string;
  message?: string;
}

export interface VendorRequestPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  taxIdLabel?: string;
  business_name: string;
  business_email: string;
  tax_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  currency?: string;
  credit_limit?: string;
  website?: string;
  message?: string;
  country?: number;
}

export interface VendorRequestResponse {
  id: string;
  status: string;
  message?: string;
}

export interface CartCheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  hasShippableItem: boolean;
  localQtyMap: Record<string, string>;
  isUpdating: boolean;
  isRemoving: boolean;
  onIncrement: (item: CartItem) => void;
  onDecrement: (item: CartItem) => void;
  onRemove: (id: string, variant_id?: string) => void;
  onCheckout: () => void;
}

/* ------------------------------------------------------------------ *
 * Cart page components
 * ------------------------------------------------------------------ */

export type CartItemRowProps = {
  item: CartItem;
  /** Unit price after any promotion, from getPriceDetails(). */
  mainPrice: number;
  wasPrice: number;
  showWasPrice: boolean;
  itemSubtotal: number;
  /**
   * Rendered by the page rather than built here: the name, stock state,
   * delivery estimate and variant list are the same markup in both layouts, and
   * the quantity control needs the page's per-item mutation state.
   */
  itemInfo: ReactNode;
  qtySelector: ReactNode;
  removeLink: ReactNode;
};

export type CartItemsListProps = {
  items: CartItem[];
  /** Above xl the list is height-matched to the order summary beside it. */
  isXlUp: boolean;
  matchedHeight: number | null;

  /** Id of the row whose quantity is mid-flight, or null. */
  updatingItemId: string | null;
  isRemoving: boolean;
  /**
   * Shared with the page so a second click during an in-flight remove is
   * dropped rather than queued.
   */
  clickLockRef: RefObject<boolean>;

  /** Quantity shown while the debounced update is still pending. */
  localQtyMap: Record<string, string>;
  setLocalQtyMap: Dispatch<SetStateAction<Record<string, string>>>;

  onRemoveItem: (id: string, variant_id?: string) => void;
  onUpdateQuantity: (
    product_id: string,
    quantity: number,
    variant_id?: string,
    item_id?: string,
  ) => void;
};

export type CartOrderSummaryProps = {
  /**
   * The page measures this element to match the item list's height, so the ref
   * has to reach the outer wrapper rather than anything inside it.
   */
  summaryRef: Ref<HTMLDivElement>;
  cart: Cart;
  authChecked: boolean;
  isAuthenticated: boolean;
  totalSaveAmount: number;
  hasShippableItem: boolean;
  newTotalPrice: number | null;

  appliedPromoCode: string | null;
  discountAmount: number;
  promoCodeInput: string;
  onPromoCodeInputChange: (value: string) => void;
  promoCodeError: string | null;
  onApplyPromoCode: () => void;
  isApplyingPromo: boolean;
  onRemovePromo: () => void;
  isRemovingPromo: boolean;

  pincode: string;
  pincodeError?: string | null;
  onPincodeChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  updatePostcode: (newPostcode: string, newSuburb?: string) => void;
  onCheckDelivery: () => void;
  isCheckingDelivery: boolean;

  isXlUp: boolean;
  secureCheckoutSection: ReactNode;
};
