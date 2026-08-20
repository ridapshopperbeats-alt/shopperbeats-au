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

import { Check, Heart } from "lucide-react";
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
  discountPercentage,
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

  const isInCart = false;

  const currentVariant = variants.find((v) => v.id === defaultVariantId);

  const isOutOfStock =
    variants.length > 0
      ? currentVariant !== undefined && Number(currentVariant.stock) <= 0
      : stock !== undefined && stock !== null && Number(stock) <= 0;

  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    handleWishlistButtonClick(e);
  };

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

  // const renderTag = useMemo(() => {
  //   // Check if dynamic tags exist, otherwise use fallback values based on product ID
  //   const activeTag =
  //     tags?.[0]?.toLowerCase() ||
  //     (Number(id) % 3 === 0
  //       ? "hotseller"
  //       : Number(id) % 3 === 1
  //         ? "new"
  //         : "bestseller");

  //   switch (activeTag) {
  //     case "hotseller":
  //       return (
  //         <div className="absolute bg-[#01295F] text-white w-[60px] h-[18px] md:w-[100px] md:h-[19px] top-[10px] left-[10px] text-[10px] md:text-[12px] font-medium flex items-center justify-center z-10 rounded-[5px] leading-[18px]">
  //           <ThumbUpIcon className="!w-[13px] !h-[13px] md:!w-[12px] md:!h-[12px]" />
  //           Bestselle
  //         </div>
  //       );
  //     case "new":
  //       return (
  //         <div className="absolute bg-[#787FFF] text-white w-[60px] h-[18px] md:w-[100px] md:h-[19px] top-[10px] left-[10px] text-[10px] md:text-[12px] font-medium flex items-center justify-center   z-10 rounded-[5px] leading-[18px]">
  //           <StarIcon className="!w-[10px] !h-[10px] md:!w-[12px] md:!h-[12px]" />
  //           New
  //         </div>
  //       );
  //     case "bestseller":
  //       return (
  //         <div className="absolute top-[10px] left-[10px] z-10 flex h-[18px] w-[80px] items-center justify-center gap-1 rounded-[5px] bg-[#FFB30F] text-[10px] font-medium leading-[18px] text-white md:h-[19px] md:w-[100px] md:text-[12px]">
  //           <WhatshotIcon className="!w-[13px] !h-[13px] md:!w-[12px] md:!h-[12px]" />
  //           Hotseller
  //         </div>
  //       );
  //     default:
  //       return null;
  //   }
  // }, [tags, id]);

  return (
    <>
      <div className="group relative w-full h-full max-h-[530px] mx-auto flex flex-col justify-start overflow-hidden  rounded-[7px]">
        {/* {renderTag} */}

        <button
          onClick={handleWishlistClick}
          disabled={isWishlistLoading}
          aria-label={
            isOutOfStock
              ? "Out of stock"
              : isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
          }
          title={
            isOutOfStock
              ? "Out of stock"
              : isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
          }
          className="absolute top-3 right-3 sm:top-[9px] sm:right-3 w-4 h-4 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center shadow-md z-20 transition-all hover:scale-105 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed border border-[#E0E0E0] cursor-pointer"
        >
          <Heart
            className="h-[9px] w-[9px] md:h-4 md:w-4"
            fill={!isOutOfStock && isWishlisted ? "#FD151B" : "none"}
            stroke={!isOutOfStock && isWishlisted ? "#FD151B" : "#012A61"}
            strokeWidth={2}
          />
        </button>

        <Link
          href={`/product/${unique_code || id}`}
          className="flex min-h-[350px] md:min-h-[465px] flex-col no-underline text-inherit"
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
              <h4 className="text-[12px] md:text-[14px] font-bold text-black">
                {brand_name || ""}
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
                
                {discountPercentage && (
                  <span className="text-[9px] md:text-[12px] font-semibold text-[#008F11]">
                    {formatPrice(discountPercentage)}% OFF
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
            </div>

            <div className="w-full px-2 lg:px-3 flex justify-center">
              <button
                onClick={handleAddToCartClick}
                disabled={isAddingToCart || isOutOfStock}
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

export default memo(ProductCard);
