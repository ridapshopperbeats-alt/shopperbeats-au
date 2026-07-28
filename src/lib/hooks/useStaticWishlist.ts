"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STATIC_WISHLIST_EVENT,
  getStaticWishlistItems,
  removeStaticWishlistItem,
  toggleStaticWishlistItem,
  type StaticProduct,
  type StaticWishlistItem,
} from "@/lib/utils/staticStorage";

export function useStaticWishlist() {
  const [items, setItems] = useState<StaticWishlistItem[]>([]);

  useEffect(() => {
    setItems(getStaticWishlistItems());

    const sync = () => setItems(getStaticWishlistItems());
    window.addEventListener(STATIC_WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STATIC_WISHLIST_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleItem = useCallback((product: StaticProduct) => {
    setItems(toggleStaticWishlistItem(product));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(removeStaticWishlistItem(productId));
  }, []);

  const isWishlisted = useCallback(
    (productId: string | number) =>
      items.some((item) => item.product_id === `static-${productId}`),
    [items],
  );

  return { items, toggleItem, removeItem, isWishlisted, count: items.length };
}
