"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useAddToCartMutation,
  useGetCartQuery,
} from "@/lib/redux/apis/cartApi";

import { toast } from "react-toastify";
import { formatPrice } from "@/lib/utils/formatPrice";
import { VariantAttribute } from "@/types/product";
import { getPriceDetails } from "@/lib/utils/getPriceDetails";
import Button from "@/components/ui/Button";
import { formatReadableDate } from "@/lib/utils/dateUtils";
import { WishlistItem } from "@/types/wishlist";
import Loader from "@/components/ui/loaders/Loader";

import "../../../../styles/Cart.css";

import { useGlobalPostcode } from "@/lib/hooks/useGlobalPostcode";
import { useCalculateShippingMutation } from "@/lib/redux/apis/orderApi";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import { pincode as pincodeValidation } from "@/lib/hooks/useYupValidation";

import * as yup from "yup";

export default function WishlistPage() {
  const router = useRouter();

  // ---------------- Wishlist ----------------
  const {
    data: wishlistData,
    isLoading,
    isError,
    error,
  } = useGetWishlistQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const wishlistItems = wishlistData?.items || []; // ✅ FIXED

  // ---------------- Mutations ----------------
  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();

  const [addToCart] = useAddToCartMutation();

  const { data: cart } = useGetCartQuery(undefined);

  const [calculateShipping, { isLoading: isCalculatingShipping }] =
    useCalculateShippingMutation();

  // ---------------- Postcode ----------------
  const { postcode } = useGlobalPostcode();

  const schema = yup.object().shape({
    pincode: pincodeValidation,
  });

  const { setFormData } = useFormValidation(schema, {
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

  // ---------------- Helpers ----------------
  const isInCart = (productId: string, variantId?: string) => {
    return cart?.items?.some(
      (c) =>
        c.product_id === productId &&
        (variantId ? c.variant_id === variantId : true)
    );
  };

  // ---------------- Actions ----------------
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

  // ---------------- UI States ----------------
  if (isLoading) return <Loader />;

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

  // ---------------- UI ----------------
  return (
    <div className="wishlist-content">
      <h4 className="mb-30">Wishlist</h4>

      {/* <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Date Added</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {wishlistItems.map((item: any) => {
            const { mainPrice, wasPrice, hasDiscount } = getPriceDetails(item);

            const outOfStock =
              !item.is_active ||
              (item.available_stock !== undefined &&
                item.available_stock <= 0);

            return (
              <tr key={`${item.product_id}-${item.variant_id || "nv"}`}>
                {/* Product 
                <td className="item-info">
                  <Link
                    href={`/product/${item.unique_code || item.product_id}`}
                  >
                    <div
                      className="w-[136px] h-[136px] bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${
                          item.images?.[0]?.image_url ||
                          "https://via.placeholder.com/136"
                        })`,
                      }}
                    />
                  </Link>

                  <div>
                    <h3>
                      <Link
                        href={`/product/${item.unique_code || item.product_id}`}
                      >
                        {item.product_name}
                      </Link>
                    </h3>
                  </div>
                </td>

                {/* Price 
                <td>
                  <span>${formatPrice(mainPrice)}</span>
                  {hasDiscount && (
                    <span className="old-price">
                      ${formatPrice(wasPrice)}
                    </span>
                  )}
                </td>

                {/* Date *
                <td>{formatReadableDate(item.created_at)}</td>

                {/* Stock 
                <td>
                  {outOfStock ? (
                    <p className="out-of-stock">Out of Stock</p>
                  ) : (
                    <p className="in-stock">In Stock</p>
                  )}
                </td>

                {/* Actions 
                <td>
                  <div className="btn-action">
                    <Button
                      disabled={isCalculatingShipping}
                      onClick={() =>
                        isInCart(item.product_id, item.variant_id)
                          ? router.push("/cart")
                          : handleAddToCart(item)
                      }
                    >
                      {isInCart(item.product_id, item.variant_id)
                        ? "Go to Cart"
                        : "Add to Cart"}
                    </Button>

                    <Button
                      disabled={isRemoving}
                      isLoading={isRemoving}
                      onClick={() =>
                        handleRemove(item.product_id, item.variant_id)
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table> */}
      {/* Headers (desktop only) */}
<div className="hidden md:grid md:grid-cols-12 items-center gap-4 bg-gray-100 p-4 font-semibold text-sm rounded-md mb-3">
  <div className="md:col-span-4">Product</div>
  <div className="md:col-span-2">Price</div>
  <div className="md:col-span-2">Date Added</div>
  <div className="md:col-span-2">Stock</div>
  <div className="md:col-span-2">Action</div>
</div>

{/* Wishlist Cards */}
<div className="wishlist-container">
  {wishlistItems.map((item: any) => {
    const outOfStock =
      !item.is_active ||
      (item.available_stock !== undefined &&
        item.available_stock <= 0);

    return (
      <div
        key={item.product_id}
        className="wishlist-card grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-gray-300 p-4 mb-4 rounded-lg bg-white"
      >
        {/* Product */}
        <div className="flex items-center gap-3 md:col-span-4">
          <div
            className="w-[80px] h-[80px] bg-cover bg-center rounded shrink-0"
            style={{
              backgroundImage: `url(${
                item.images?.[0]?.image_url || "/images/image-coming-soon.jpg"
              })`,
            }}
          />

          <span className="font-bold text-[14px] leading-[20px]">
            {item.product_name}
          </span>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 md:block md:col-span-2 items-center">
          <span className="font-semibold md:hidden">Price</span>

          <p className="font-bold text-right md:text-left">
            {/* change price format */}
            ${formatPrice(item.price)}
          </p>
        </div>

        {/* Date */}
        <div className="grid grid-cols-2 md:block md:col-span-2 items-center font-bold text-sm text-black">
          <span className="font-semibold md:hidden">
            Date Added
          </span>

          <span className="text-right md:text-left">
            {formatReadableDate(item.created_at)}
          </span>
        </div>

        {/* Stock */}
        <div className="grid grid-cols-2 md:block md:col-span-2 items-center">
          <span className="font-semibold md:hidden">Stock</span>

          <div className="text-right md:text-left">
            {outOfStock ? (
              <span className="text-red-500 font-bold">
                Out of Stock
              </span>
            ) : (
              <span className="text-green-600 font-bold">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="grid grid-cols-2 md:flex md:flex-col gap-2 md:col-span-2 items-start">
          <span className="font-semibold md:hidden pt-3">
            Action
          </span>

          <div className="flex flex-col gap-2 w-full">
            <Button
              disabled={isCalculatingShipping}
              onClick={() =>
                isInCart(item.product_id, item.variant_id)
                  ? router.push("/cart")
                  : handleAddToCart(item)
              }
              className="bg-red-500 text-white rounded-2xl font-bold p-4 cursor-pointer w-full"
              style={{
                color: "white",
                padding: "10px",
                borderRadius: "20px",
              }}
            >
              {isInCart(item.product_id, item.variant_id)
                ? "Go to Cart"
                : "Add to Cart"}
            </Button>

            <Button
              className="border border-red-500 p-4 rounded-2xl font-bold cursor-pointer w-full"
              style={{
                border: "1px solid red",
                borderRadius: "50px",
                padding: "10px",
              }}
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
