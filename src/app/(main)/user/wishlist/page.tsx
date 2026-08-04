"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import "../../../../styles/Cart.css";
import "../../../../styles/auth.css";
import { formatPrice, formatReadableDate } from "@/lib/utils/main-utils";
import { useStaticWishlist } from "@/lib/hooks/useStaticWishlist";
import {
  addStaticWishlistItemToCart,
  type StaticWishlistItem,
} from "@/lib/utils/staticStorage";

function formatDateDDMMYY(date: string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

// ---------------- DUMMY DATA (static, for now) ----------------
const DUMMY_WISHLIST_ITEMS = [
  {
    product_id: "prod-1",
    variant_id: undefined as string | undefined,
    sku: "SKU001",
    product_name:
      "Saint Laurent Classic Biker Leather Jacket (Black) — Signature Biker Silhouette In Supple Lambskin",
    price: 1290,
    created_at: "2026-06-15T10:00:00.000Z",
    is_active: true,
    available_stock: 15,
    images: [
      {
        image_url:
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      },
    ],
  },
  {
    product_id: "prod-2",
    variant_id: "var-2",
    sku: "SKU002",
    product_name:
      "GUCCI Ace Sneaker (Tan Leather, Gold Buckle) — Low-Top Lace-Up Sneaker With Signature",
    price: 450,
    created_at: "2026-07-01T10:00:00.000Z",
    is_active: true,
    available_stock: 5,
    images: [
      {
        image_url:
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80",
      },
    ],
  },
  {
    product_id: "prod-3",
    variant_id: undefined as string | undefined,
    sku: "SKU003",
    product_name: "Classic Leather Wallet",
    price: 89.99,
    created_at: "2026-07-10T10:00:00.000Z",
    is_active: true,
    available_stock: 0,
    images: [
      {
        image_url:
          "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
      },
    ],
  },
];

export default function WishlistPage() {
  const router = useRouter();

  const [wishlistItems, setWishlistItems] = useState(DUMMY_WISHLIST_ITEMS);
  const { items: staticWishlistItems, removeItem: removeStaticWishlistItemById } =
    useStaticWishlist();
  const combinedWishlistItems = useMemo(
    () => [
      ...(wishlistItems as unknown as StaticWishlistItem[]),
      ...staticWishlistItems,
    ],
    [wishlistItems, staticWishlistItems],
  );
  const [cartProductIds, setCartProductIds] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isInCart = (productId: string) => cartProductIds.includes(productId);

  const handleAddToCart = async (item: StaticWishlistItem) => {
    if (item.product_id.startsWith("static-")) {
      addStaticWishlistItemToCart(item);
      setCartProductIds((prev) => [...prev, item.product_id]);
      toast.success("Added to cart");
      return;
    }
    setIsAddingToCart(true);
    setTimeout(() => {
      setCartProductIds((prev) => [...prev, item.product_id]);
      toast.success("Added to cart");
      setIsAddingToCart(false);
    }, 300);
  };

  const handleRemove = async (productId: string) => {
    if (productId.startsWith("static-")) {
      removeStaticWishlistItemById(productId);
      toast.success("Removed from wishlist");
      return;
    }
    setIsRemoving(true);
    setTimeout(() => {
      setWishlistItems((prev) =>
        prev.filter((item) => item.product_id !== productId),
      );
      toast.success("Removed from wishlist");
      setIsRemoving(false);
    }, 300);
  };

  if (!combinedWishlistItems.length)
    return (
      <div className="wishlist-content">
        <h4>Wishlist</h4>
        <p>Your wishlist is empty.</p>
      </div>
    );

  return (
    <div className="wishlist-content">
      <h4 className="wishlist-title fluid-text-xl">Wishlist</h4>
      <div className="wishlist-table-header">
        <div className="wishlist-col-product">Product</div>
        <div className="wishlist-col-span-2">Price</div>
        <div className="wishlist-col-span-2">Date Added</div>
        <div className="wishlist-col-span-2">Stock Status</div>
        <div className="wishlist-col-span-2 flex items-center justify-center">
          Action
        </div>      </div>

      <div className="wishlist-container">
        {combinedWishlistItems.map((item) => {
          const outOfStock =
            !item.is_active ||
            (item.available_stock !== undefined &&
              item.available_stock <= 0);

          return (
            <div
              key={item.product_id}
              className="wishlist-card"
            >
              <div className="wishlist-item-media">
                <div
                  className="wishlist-item-image"
                  style={{
                    backgroundImage: `url(${item.images?.[0]?.image_url || "/images/image-coming-soon.jpg"
                      })`,
                  }}
                />

                <span className="wishlist-item-name">
                  {item.product_name}
                </span>
              </div>

              <div className="wishlist-cell">
                <span className="wishlist-mobile-label">Price</span>

                <p className="wishlist-price">
                  ${formatPrice(item.price)}
                </p>
              </div>

              <div className="wishlist-date-cell">
                <span className="wishlist-mobile-label">
                  Date Added
                </span>

                <span className="wishlist-align-cell">
                  {formatReadableDate(item.created_at)}
                </span>
              </div>

              <div className="wishlist-cell">
                <span className="wishlist-mobile-label">Stock</span>

                <div className="wishlist-align-cell">
                  {outOfStock ? (
                    <span className="wishlist-out-of-stock">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="wishlist-in-stock">
                      In Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="wishlist-action-cell">
                <span className="wishlist-action-mobile-label">
                  Action
                </span>

                <div className="wishlist-action-buttons">
                  <Button
                    disabled={isAddingToCart}
                    onClick={() =>
                      isInCart(item.product_id)
                        ? router.push("/cart")
                        : handleAddToCart(item)
                    }
                    className="wishlist-add-to-cart-btn"
                  >
                    {isInCart(item.product_id)
                      ? "Go to Cart"
                      : "Add to Cart"}
                  </Button>

                  <Button
                    className="wishlist-remove-btn"
                    disabled={isRemoving}
                    isLoading={isRemoving}
                    onClick={() =>
                      handleRemove(item.product_id)
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
