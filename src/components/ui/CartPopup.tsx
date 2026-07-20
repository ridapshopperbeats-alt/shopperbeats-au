"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetCartQuery } from "@/lib/redux/apis/cart-api";
import { CartItem } from "@/types/cart";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";

interface CartPopupProps {
  isVisible: boolean;
}

const CartPopup = ({ isVisible }: CartPopupProps) => {
  const { postcode } = useGlobalPostcode();
  const { data: cartData } = useGetCartQuery(
    postcode ? { postcode } : undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );


  const cartItems: CartItem[] = (cartData?.items ?? []).filter(item => item.is_active && (item.available_stock === undefined || item.available_stock > 0));

  return (
    <div className={`header-link cart ${isVisible ? "is-visible" : ""}`}>
      <Link href="/cart">
        <Image src="/images/cart.svg" alt="cart" width={24} height={24} />
      </Link>
      {cartItems.length > 0 && (
        <span className="cart-num">{cartItems.length}</span>
      )}
    </div>
  );
};

export default CartPopup;
