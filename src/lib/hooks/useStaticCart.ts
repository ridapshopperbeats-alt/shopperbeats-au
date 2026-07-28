"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STATIC_CART_EVENT,
  addStaticProductToCart,
  getStaticCartItems,
  removeStaticCartItem,
  updateStaticCartItemQuantity,
  type StaticCartItem,
  type StaticProduct,
} from "@/lib/utils/staticStorage";

export function useStaticCart() {
  const [items, setItems] = useState<StaticCartItem[]>([]);

  useEffect(() => {
    setItems(getStaticCartItems());

    const sync = () => setItems(getStaticCartItems());
    window.addEventListener(STATIC_CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STATIC_CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addToCart = useCallback((product: StaticProduct) => {
    setItems(addStaticProductToCart(product));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems(updateStaticCartItemQuantity(productId, quantity));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(removeStaticCartItem(productId));
  }, []);

  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  return { items, addToCart, updateQuantity, removeItem, count };
}
