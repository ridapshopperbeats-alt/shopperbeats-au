"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import "../../../../styles/Cart.css";
import "../../../../styles/auth.css";
import { useCalculateShippingMutation } from "@/lib/redux/apis/order-api";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { formatReadableDate, formatPrice } from "@/lib/utils/main-utils";
import { useAddToCartMutation, useGetCartQuery, useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/lib/redux/apis/cart-api";
import { wishListValidationSchema } from "@/lib/validations/form-schemas";

export default function WishlistPage() {
  const router = useRouter();
  const {
    data: wishlistData,
    isLoading,
    isError,
    error,
  } = useGetWishlistQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const wishlistItems = wishlistData?.items || [];

  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();

  const [addToCart] = useAddToCartMutation();

  const { data: cart } = useGetCartQuery(undefined);

  const [calculateShipping, { isLoading: isCalculatingShipping }] =
    useCalculateShippingMutation();

  const { postcode } = useGlobalPostcode();

  const { setFormData } = useFormValidation(wishListValidationSchema, {
    pincode: postcode || "",
  });

  useEffect(() => {
    if (postcode) {
      setFormData((prev) => ({
        ...prev,
        pincode: postcode,
      }));
    }
  }, [postcode]);

  const isInCart = (productId: string, variantId?: string) => {
    return cart?.items?.some(
      (c) =>
        c.product_id === productId &&
        (variantId ? c.variant_id === variantId : true)
    );
  };

  const handleAddToCart = async (item: any) => {
    if (postcode) {
      try {
        const res = await calculateShipping({
          postcode,
          product_identifier: item.sku || item.product_id,
        }).unwrap();

        if (!res.shipping_cost || res.shipping_cost === "ns") {
          toast.error("Item cannot be shipped to your location.");
          return;
        }
      } catch {
        toast.error("Shipping check failed.");
        return;
      }
    }

    try {
      await addToCart({
        productId: item.product_id,
        quantity: 1,
        variant_id: item.variant_id,
      }).unwrap();

      toast.success("Added to cart");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to cart");
    }
  };

  const handleRemove = async (productId: string, variantId?: string) => {
    try {
      await removeFromWishlist({
        product_id: productId,
        variant_id: variantId,
      }).unwrap();

      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (isLoading) return null;

  if (isError)
    return (
      <div className="wishlist-content">
        <h4>Error loading wishlist</h4>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );

  if (!wishlistItems.length)
    return (
      <div className="wishlist-content">
        <h4>Wishlist</h4>
        <p>Your wishlist is empty.</p>
      </div>
    );

  return (
    <div className="wishlist-content">
      <h4 className="wishlist-title">Wishlist</h4>
      <div className="wishlist-table-header">
        <div className="wishlist-col-product">Product</div>
        <div className="wishlist-col-span-2">Price</div>
        <div className="wishlist-col-span-2">Date Added</div>
        <div className="wishlist-col-span-2">Stock Status</div>
        <div className="wishlist-col-span-2">Action</div>
      </div>

      <div className="wishlist-container">
        {wishlistItems.map((item: any) => {
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
                    disabled={isCalculatingShipping}
                    onClick={() =>
                      isInCart(item.product_id, item.variant_id)
                        ? router.push("/cart")
                        : handleAddToCart(item)
                    }
                    className="wishlist-add-to-cart-btn"
                  >
                    {isInCart(item.product_id, item.variant_id)
                      ? "Go to Cart"
                      : "Add to Cart"}
                  </Button>

                  <Button
                    className="wishlist-remove-btn"
                    disabled={isRemoving}
                    isLoading={isRemoving}
                    onClick={() =>
                      handleRemove(item.product_id, item.variant_id)
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
