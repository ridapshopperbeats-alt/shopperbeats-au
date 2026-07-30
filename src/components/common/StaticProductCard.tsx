"use client";

import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { toast } from "react-toastify";

import { formatPrice } from "@/lib/utils/main-utils";

import { ProductCardProps } from "@/types/product";

import { Heart } from "lucide-react";
import { useStaticCart } from "@/lib/hooks/useStaticCart";
import { useStaticWishlist } from "@/lib/hooks/useStaticWishlist";
import type { StaticProduct } from "@/lib/utils/staticStorage";
import getEstimatedDeliveryRange from "@/lib/utils/get-estimated-delivery-range";
import StarRating from "./StarRating";

function limitWords(text: string | undefined, limit = 6) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
}

const StaticProductCard: React.FC<ProductCardProps> = ({
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
  const { addToCart } = useStaticCart();
  const { toggleItem, isWishlisted: checkWishlisted } = useStaticWishlist();

  const productKey = String(unique_code || id);
  const isWishlisted = checkWishlisted(productKey);

  const currentVariant = variants.find((v) => v.id === defaultVariantId);

  const isOutOfStock =
    variants.length > 0
      ? currentVariant !== undefined && Number(currentVariant.stock) <= 0
      : stock !== undefined && stock !== null && Number(stock) <= 0;

  const toStaticProduct = (): StaticProduct => ({
    id: productKey,
    image,
    brand_name: brand_name || "No Brand",
    title: title || "",
    mainPrice: mainPrice || 0,
    wasPrice: wasPrice || 0,
    saveAmount: saveAmount || 0,
    shippingCharge: shippingCharge || 0,
    isOutOfStock,
  });

  const handleWishlistButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWishlisted = isWishlisted;
    toggleItem(toStaticProduct());
    toast.success(
      wasWishlisted
        ? "Product removed from wishlist!"
        : "Product added to wishlist!",
    );
  };

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart(toStaticProduct());
    toast.success("Added to cart successfully!");
  };

  return (
    <>
      <div className="group relative w-full h-full max-h-[450px] mx-auto flex flex-col justify-start overflow-hidden  rounded-[7px]">
        <button
          onClick={handleWishlistButtonClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 sm:top-[9px] sm:right-3 w-4 h-4 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center shadow-md z-20 transition-all hover:scale-105 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed border border-[#E0E0E0] cursor-pointer"
        >
          <Heart
            className="h-[9px] w-[9px] md:h-4 md:w-4"
            fill={isWishlisted ? "#FD151B" : "none"}
            stroke={isWishlisted ? "#FD151B" : "#012A61"}
            strokeWidth={2}
          />
        </button>
        <Link
          href={`/static-product/${unique_code || id}`}
          className="flex h-full max-h-[450px] flex-col no-underline text-inherit"
        >
          <div className="relative w-full h-[150px] md:h-[260px] shrink-0 overflow-hidden">
            <Image
              src={image}
              alt={title || "Product Image"}
              fill
              sizes="(max-width: 768px) 180px, 270px"
              loading="lazy"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" />
          </div>

          <div className="flex flex-1 flex-col justify-between w-full">
            <div className="flex flex-col  pt-1 md:pt-2">
              <h4 className="text-[14px] font-bold text-black">
                {brand_name || "No Brand"}
              </h4>

              <p className="text-[14px] leading-4.5 text-[#878787] font-normal">
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

              {!isOutOfStock && (
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
              )}
            </div>

            <div className="w-full px-2 lg:px-3 flex justify-center mt-2">
              <button
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
                className="w-full h-[30px] bg-[#849324] text-white text-[14px] font-medium rounded-[32px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isOutOfStock ? "Out of Stock" : "Add To Cart"}
              </button>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default memo(StaticProductCard);
