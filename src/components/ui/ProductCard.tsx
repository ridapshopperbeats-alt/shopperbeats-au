"use client";

import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { toast } from "react-toastify";

import { useAddToCartMutation } from "@/lib/redux/apis/cart-api";
import { useWishlistToggle } from "@/lib/hooks/use-wishlist-toggle";

import { formatPrice } from "@/lib/utils/main-utils";
import getEstimatedDeliveryRange from "@/lib/utils/get-estimated-delivery-range";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";

import { ProductCardProps } from "@/types/product";

import { Heart } from "lucide-react";
import StarRating from "./StarRating";



function limitWords(text: string | undefined, limit = 6) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  brand_name,
  title,
  mainPrice,
  wasPrice,
  saveAmount,
  rating = 0,
  reviewCount = 0,
  id,
  showWasPrice,
  defaultVariantId,
  variants = [],
  unique_code,
  wishlistItems = [],
  vendor_id,
  stock,
  ships_from_location,
  handling_time_days,
  shippingCharge,
}) => {
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const {
    isWishlisted,
    isLoading: isWishlistLoading,
    toggle: handleWishlistButtonClick,
  } = useWishlistToggle({
    productId: id,
    variantId: defaultVariantId ?? null,
    wishlistItems,
  });

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const { postcode } = useGlobalPostcode();
  const router = useRouter();
  const pathname = usePathname();

  const currentVariant = variants.find((v) => v.id === defaultVariantId);

  const isOutOfStock =
    variants.length > 0
      ? currentVariant !== undefined && Number(currentVariant.stock) <= 0
      : stock !== undefined && stock !== null && Number(stock) <= 0;

  const handleAddToCartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!id || isAddingToCart || isOutOfStock) return;

    try {
      await addToCart({
        productId: id,
        quantity: 1,
        variant_id: defaultVariantId,
        vendor_id,
        postcode,
      }).unwrap();
      toast.success("Added to cart successfully!");
    } catch (err) {
      const error = err as {
        data?: { detail?: string; error?: string };
        message?: string;
      };
      const errorMessage =
        error?.data?.detail ||
        error?.data?.error ||
        error?.message ||
        "Failed to add product to cart.";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="group relative w-full h-full max-h-[450px] mx-auto flex flex-col justify-start overflow-hidden  rounded-[7px]">
        {/* {renderTag} */}

        <button
          onClick={handleWishlistButtonClick}
          disabled={isWishlistLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 sm:top-[9px] sm:right-[12px] w-4 h-4 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center shadow-md z-20 transition-all hover:scale-105 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed border border-[#E0E0E0] cursor-pointer"
        >
          <Heart
            className="h-[9px] w-[9px] md:h-4 md:w-4"
            fill={isWishlisted ? "#FD151B" : "none"}
            stroke={isWishlisted ? "#FD151B" : "#012A61"}
            strokeWidth={2}
          />
        </button>

        <Link
          href={`/product/${unique_code || id}`}
          className="flex h-full max-h-[450px] flex-col no-underline text-inherit"
        >
          <div className="relative w-full overflow-hidden">
            <Image
              src={image}
              alt={title || "Product Image"}
              width={280}
              height={296}
              loading="lazy"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" />
          </div>

          <div className="flex flex-1 flex-col justify-between w-full">
            <div className="flex flex-col gap-[2px] pt-1 md:pt-2">
              {brand_name && (
                <h4 className="text-[14px] md:text-[16px] leading-4.5 text-[#000000] font-bold">
                  {brand_name}
                </h4>
              )}


              <p className="text-[14px] md:text-[16px] leading-4.5 text-[#878787] font-normal">
                {limitWords(title, 7) || "MakeupKit"}
              </p>

              <div className="flex items-center gap-2 h-4 py-3">
                <span className="text-[16px] md:text-[20px] font-semibold text-[#052B56]">
                  ${formatPrice(mainPrice)}
                </span>

                {showWasPrice && wasPrice && (
                  <span className="text-[10px] md:text-[12px] font-light text-[#535766] line-through">
                    ${formatPrice(wasPrice)}
                  </span>
                )}

                {saveAmount && (
                  <span className="text-[9px] md:text-[12px] font-normal text-[#008F11]">
                    {formatPrice(saveAmount)} %OFF
                  </span>
                )}
              </div>

              {rating > 0 && (
                <div className="flex text-[12px] font-medium items-center leading-[18px] gap-1 h-[13px]">
                  <StarRating rating={rating} size={13} />
                  <span className="text-[#535766] leading-none">
                    ({reviewCount})
                  </span>
                </div>
              )}

              <div className="text-[12px] md:text-[13px] leading-[18px] text-[#535252]">
                <p className="font-normal">
                  {shippingCharge === 0
                    ? "Delivery Fee - $0"
                    : `Delivery Fee - $${formatPrice(shippingCharge)}`}
                </p>

                <p className="font-normal">
                  <span className="font-medium">
                    {getEstimatedDeliveryRange(
                      ships_from_location,
                      handling_time_days || 0,
                    )}
                  </span>
                </p>
              </div>
            </div>

            <div className="w-full px-2 lg:px-3 flex justify-center mt-2">
              <button
                onClick={handleAddToCartClick}
                disabled={isAddingToCart || isOutOfStock}
                className="w-full h-[30px] bg-[#849324] text-white text-[14px] font-medium rounded-[32px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAddingToCart
                  ? "Adding..."
                  : isOutOfStock
                    ? "Out of Stock"
                    : "Add To Cart"}
              </button>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default memo(ProductCard);
