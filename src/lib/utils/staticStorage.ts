export const STATIC_CART_STORAGE_KEY = "sb_static_cart_items";
export const STATIC_WISHLIST_STORAGE_KEY = "sb_static_wishlist_items";
export const STATIC_CART_EVENT = "static-cart-updated";
export const STATIC_WISHLIST_EVENT = "static-wishlist-updated";

export type StaticProduct = {
  id: number | string;
  image: string;
  brand_name: string;
  title: string;
  mainPrice: number;
  wasPrice: number;
  saveAmount: number;
  shippingCharge: number;
  isOutOfStock: boolean;
};

export type StaticCartItem = {
  id: string;
  product_id: string;
  variant_id?: string;
  unique_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  rrp_price_snapshot: number;
  discount_percentage: number;
  discounted_price: number;
  oldPrice: number;
  discount: number;
  final_price: number;
  subtotal: number;
  promotion_discount: number;
  is_active: boolean;
  available_stock: number;
  stock: number;
  is_shippable: boolean;
  shipping_cost: number;
  handling_time_days: number;
  delivery_prefix: string;
  promoCode?: string;
  saleBadge?: string;
  images: string;
  variant_attributes: { name: string; value: string }[];
};

export type StaticWishlistItem = {
  product_id: string;
  variant_id?: string;
  sku: string;
  product_name: string;
  price: number;
  created_at: string;
  is_active: boolean;
  available_stock: number;
  images: { image_url: string }[];
};

function readItems<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeItems<T>(key: string, items: T[], eventName: string): T[] {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(eventName));
  }
  return items;
}

// ---------------- STATIC CART ----------------

export function getStaticCartItems(): StaticCartItem[] {
  return readItems<StaticCartItem>(STATIC_CART_STORAGE_KEY);
}

function buildStaticCartItem(
  productId: string,
  productName: string,
  image: string,
  unitPrice: number,
  wasPrice: number,
  saveAmount: number,
  shippingCharge: number,
  quantity: number,
): StaticCartItem {
  return {
    id: productId,
    product_id: productId,
    unique_code: productId,
    product_name: productName,
    quantity,
    unit_price: unitPrice,
    rrp_price_snapshot: wasPrice,
    discount_percentage: saveAmount,
    discounted_price: unitPrice,
    oldPrice: wasPrice,
    discount: saveAmount,
    final_price: unitPrice * quantity,
    subtotal: unitPrice * quantity,
    promotion_discount: 0,
    is_active: true,
    available_stock: 999,
    stock: 999,
    is_shippable: true,
    shipping_cost: shippingCharge,
    handling_time_days: 3,
    delivery_prefix: "Estimated delivery in",
    images: image,
    variant_attributes: [],
  };
}

function upsertStaticCartItem(item: StaticCartItem): StaticCartItem[] {
  const items = getStaticCartItems();
  const existingIndex = items.findIndex(
    (existing) => existing.product_id === item.product_id,
  );

  const nextItems =
    existingIndex >= 0
      ? items.map((existing, index) => {
          if (index !== existingIndex) return existing;
          const quantity = existing.quantity + item.quantity;
          return {
            ...existing,
            quantity,
            subtotal: existing.unit_price * quantity,
            final_price: existing.unit_price * quantity,
          };
        })
      : [...items, item];

  return writeItems(STATIC_CART_STORAGE_KEY, nextItems, STATIC_CART_EVENT);
}

export function addStaticProductToCart(product: StaticProduct): StaticCartItem[] {
  const item = buildStaticCartItem(
    `static-${product.id}`,
    `${product.brand_name} ${product.title}`,
    product.image,
    product.mainPrice,
    product.wasPrice,
    product.saveAmount,
    product.shippingCharge,
    1,
  );
  return upsertStaticCartItem(item);
}

export function addStaticWishlistItemToCart(
  wishlistItem: StaticWishlistItem,
): StaticCartItem[] {
  const item = buildStaticCartItem(
    wishlistItem.product_id,
    wishlistItem.product_name,
    wishlistItem.images?.[0]?.image_url || "/images/image-coming-soon.jpg",
    wishlistItem.price,
    wishlistItem.price,
    0,
    0,
    1,
  );
  return upsertStaticCartItem(item);
}

export function updateStaticCartItemQuantity(
  productId: string,
  quantity: number,
): StaticCartItem[] {
  const items = getStaticCartItems().map((item) =>
    item.product_id === productId
      ? {
          ...item,
          quantity,
          subtotal: item.unit_price * quantity,
          final_price: item.unit_price * quantity,
        }
      : item,
  );
  return writeItems(STATIC_CART_STORAGE_KEY, items, STATIC_CART_EVENT);
}

export function removeStaticCartItem(productId: string): StaticCartItem[] {
  const items = getStaticCartItems().filter(
    (item) => item.product_id !== productId,
  );
  return writeItems(STATIC_CART_STORAGE_KEY, items, STATIC_CART_EVENT);
}

// ---------------- STATIC WISHLIST ----------------

export function getStaticWishlistItems(): StaticWishlistItem[] {
  return readItems<StaticWishlistItem>(STATIC_WISHLIST_STORAGE_KEY);
}

export function toggleStaticWishlistItem(
  product: StaticProduct,
): StaticWishlistItem[] {
  const productId = `static-${product.id}`;
  const items = getStaticWishlistItems();
  const exists = items.some((item) => item.product_id === productId);

  const nextItems = exists
    ? items.filter((item) => item.product_id !== productId)
    : [
        ...items,
        {
          product_id: productId,
          sku: productId,
          product_name: `${product.brand_name} ${product.title}`,
          price: product.mainPrice,
          created_at: new Date().toISOString(),
          is_active: true,
          available_stock: product.isOutOfStock ? 0 : 999,
          images: [{ image_url: product.image }],
        },
      ];

  return writeItems(
    STATIC_WISHLIST_STORAGE_KEY,
    nextItems,
    STATIC_WISHLIST_EVENT,
  );
}

export function removeStaticWishlistItem(
  productId: string,
): StaticWishlistItem[] {
  const items = getStaticWishlistItems().filter(
    (item) => item.product_id !== productId,
  );
  return writeItems(
    STATIC_WISHLIST_STORAGE_KEY,
    items,
    STATIC_WISHLIST_EVENT,
  );
}
