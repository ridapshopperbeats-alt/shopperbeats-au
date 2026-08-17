"use client";

import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { toast } from "react-toastify";

import { formatPrice } from "@/lib/utils/main-utils";

import { ProductCardProps } from "@/types/product";

import { Check, Heart } from "lucide-react";
import { useStaticCart } from "@/lib/hooks/useStaticCart";
import { useStaticWishlist } from "@/lib/hooks/useStaticWishlist";
import type { StaticProduct } from "@/lib/utils/staticStorage";
import getEstimatedDeliveryRange from "@/lib/utils/get-estimated-delivery-range";
import StarRating from "./StarRating";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import StarIcon from "@mui/icons-material/Star";
import WhatshotIcon from "@mui/icons-material/Whatshot";

function limitWords(text: string | undefined, limit = 6) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
}

const renderTag = (tag: string | undefined) => {
  switch (tag) {
    case "hotseller":
      return (
        <div className="absolute bg-[#01295F] text-white w-[80px] h-[18px] md:w-[90px] md:h-[19px] top-[10px] left-[10px] text-[10px] md:text-[12px] font-medium flex items-center justify-center z-10 rounded-[5px] leading-[18px] gap-1">
          <ThumbUpIcon sx={{ fontSize: { xs: "10px", md: "11px" } }} />
          Bestseller
        </div>
      );

    case "new":
      return (
        <div className="absolute bg-[#787FFF] text-white w-[50px] h-[18px] md:w-[60px] md:h-[19px] top-[10px] left-[10px] text-[10px] md:text-[12px] font-medium flex items-center justify-center z-10 rounded-[5px] leading-[18px] gap-1">
          <StarIcon sx={{ fontSize: { xs: "10px", md: "11px" } }} />
          New
        </div>
      );

    case "bestseller":
      return (
        <div className="absolute top-[10px] left-[10px] z-10 flex h-[18px] w-[70px] items-center justify-center gap-1 rounded-[5px] bg-[#FFB30F] text-[10px] font-medium leading-[18px] text-white md:h-[19px] md:w-[80px] md:text-[12px]">
          <WhatshotIcon sx={{ fontSize: { xs: "10px", md: "11px" } }} />
          Hotseller
        </div>
      );

    default:
      return null;
  }
};

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
  stock,
  ships_from_location,
  handling_time_days,
  shippingCharge,
  tags,
}) => {
  const { items: cartItems, addToCart } = useStaticCart();
  const { toggleItem, isWishlisted: checkWishlisted } = useStaticWishlist();

  const productKey = String(unique_code || id);
  const isWishlisted = checkWishlisted(productKey);
  const isInCart = cartItems.some(
    (cartItem) => cartItem.product_id === `static-${productKey}`,
  );

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
      <div className="group relative w-full min-h-[300px] md:min-h-[400px] mx-auto flex flex-col justify-start overflow-hidden  rounded-[7px]">
        {renderTag(tags?.[0])}

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
          className="flex min-h-[300px] md:min-h-[400px] flex-col no-underline text-inherit"
        >
          <div className="relative w-full h-[150px] md:h-[260px] shrink-0 overflow-hidden rounded-t-[8px] bg-[rgba(233,233,233,0.60)]">
            <Image
              src={image}
              alt={title || "Product Image"}
              fill
              sizes="(max-width: 768px) 180px, 270px"
              loading="lazy"
              className="object-cover"
            />
            {/* <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" /> */}

            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5]/60">
                <span className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#211E22] shadow-md">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between w-full">
            <div className="flex flex-col gap-[2px] pt-1 md:pt-2">
              <h4 className="text-[14px] font-bold text-black">
                {brand_name || "No Brand"}
              </h4>

              <p className="text-[13px] md:text-[14px] leading-4.5 text-[#878787] font-normal">
                {limitWords(title, 7) || "MakeupKit"}
              </p>

              <div className="flex items-center gap-2 h-4 py-3">
                <span className="text-[16px] md:text-[20px] font-semibold text-[#052B56]">
                  ${formatPrice(mainPrice)}
                </span>

                {showWasPrice && wasPrice && (
                  <span className="text-[11px] font-light text-[#535766] line-through">
                    ${formatPrice(wasPrice)}
                  </span>
                )}

                {saveAmount && (
                  <span className="text-[9px] md:text-[12px] font-semibold text-[#008F11]">
                    {formatPrice(saveAmount)}% OFF
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

              {/* <div className="min-h-[46px] fluid-text-xs leading-[18px] text-[#535252] flex flex-col">
                {!isOutOfStock && (
                  <div className="leading-[18px] flex flex-col gap-[2px]">
                    <p className="font-normal text-[#535252]">
                      Delivery Fee -
                      <span className="font-medium">
                        ${formatPrice(shippingCharge)}
                      </span>
                    </p>

                    <p className="font-normal text-[#535766]">
                      Estimated delivery between{" "}
                      <span className="font-medium">
                        {getEstimatedDeliveryRange(
                          ships_from_location,
                          handling_time_days || 0,
                        )}
                      </span>
                    </p>
                  </div>
                )}

                <p className="mt-1 font-normal text-[#FF4400]">
                  Extra 10% Off With Code: SHBS10
                </p>
              </div> */}
            </div>

            <div className="w-full flex justify-center mt-2 sm:mt-3">
              <button
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
                className={
                  isOutOfStock
                    ? "w-full h-[30px] !bg-[#F3F4F6] !text-[#9CA3AF] !opacity-100 text-[12px] sm:text-[14px] font-medium rounded-[32px] flex items-center justify-center whitespace-nowrap cursor-not-allowed"
                    : isInCart
                      ? "w-full h-[30px] bg-white text-[#FD151B] text-[12px] sm:text-[14px] font-medium rounded-[32px] border border-[#FD151B] flex items-center justify-center gap-1 whitespace-nowrap transition-colors cursor-pointer"
                      : "w-full h-[30px] bg-[#FD151B] text-white text-[12px] sm:text-[14px] font-medium rounded-[32px] flex items-center justify-center whitespace-nowrap transition-colors cursor-pointer"
                }
                style={
                  isOutOfStock
                    ? {
                        backgroundColor: "#F3F4F6",
                        color: "#9CA3AF",
                        opacity: 1,
                      }
                    : undefined
                }
              >
                {isOutOfStock ? (
                  "Out Of Stock"
                ) : isInCart ? (
                  <>
                    <Check size={14} />
                    Add To Cart
                  </>
                ) : (
                  "Add To Cart"
                )}
              </button>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default memo(StaticProductCard);
