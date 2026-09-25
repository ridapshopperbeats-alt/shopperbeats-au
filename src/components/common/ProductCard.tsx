"use client";

import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ProductCardProps } from "@/types/product";
import { Check, Heart } from "lucide-react";
import StarRating from "./StarRating";
import { useAddToCartMutation, useGetCartQuery } from "@/lib/redux/apis/cart-api";
import { useWishlistToggle } from "@/lib/hooks/use-wishlist-toggle";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { formatPrice } from "@/lib/utils/main-utils";


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
  shippingCharge,
  isCheckingShipping = false,
  priority = false,
  isInCart: isInCartProp,
  onImageDone,
}) => {
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const { data: cart } = useGetCartQuery(undefined, {
    skip: isInCartProp !== undefined,
  });
  const isInCart =
    isInCartProp !== undefined
      ? isInCartProp
      : cart?.items?.some(
        (cartItem) =>
          cartItem.product_id === id &&
          (defaultVariantId ? cartItem.variant_id === defaultVariantId : true),
      );

  const { isWishlisted, isLoading: isWishlistLoading, toggle: handleWishlistButtonClick } =
    useWishlistToggle({
      productId: id,
      variantId: defaultVariantId ?? null,
      wishlistItems,
    });

  const { postcode } = useGlobalPostcode();
  const router = useRouter();

  const currentVariant = variants.find((v) => v.id === defaultVariantId);

  const isOutOfStock =
    variants.length > 0
      ? currentVariant !== undefined && Number(currentVariant.stock) <= 0
      : stock !== undefined && stock !== null && Number(stock) <= 0;

  const isNotShippable = !!postcode && shippingCharge === null;


  const handleAddToCartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id || isAddingToCart || isOutOfStock) return;

    if (isNotShippable) {
      toast.error("This item can't be shipped to your selected location.");
      return;
    }

    try {
      await addToCart({
        productId: id,
        quantity: 1,
        variant_id: defaultVariantId,
        vendor_id,
        postcode,
      }).unwrap();
      toast.success("Added to cart successfully!");

      if (isWishlisted) {
        handleWishlistButtonClick(e);
      }
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
      <div className="group relative w-full h-full mx-auto flex flex-col justify-start overflow-hidden  rounded-[7px]">

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
          className="flex h-full flex-col no-underline text-inherit"
        >
          <div className="relative w-full aspect-[280/296] overflow-hidden">
            <Image
              src={image}
              alt={title || "Product Image"}
              fill
              sizes="(min-width: 1700px) 20vw, (min-width: 1200px) 33vw, (min-width: 1024px) 40vw, 50vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              className="object-cover"
              onLoad={onImageDone}
              onError={onImageDone}
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" />
          </div>

          <div className="flex flex-1 flex-col justify-between w-full">
            <div className="flex flex-col gap-[2px] pt-1 md:pt-2 min-h-[50px]">
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

                {!!discountPercentage && (
                  <span className="text-[9px] md:text-[12px] font-semibold text-[#008F11]">
                    {formatPrice(discountPercentage)}% OFF
                  </span>
                )}
              </div>

              <div className="flex text-[12px] font-medium items-center leading-[18px] gap-1">
                {rating > 0 && (
                  <>
                    <StarRating rating={rating} size={13} />
                    <span className="text-[#535766] leading-none">
                      ({reviewCount})
                    </span>
                  </>
                )}
              </div>

            </div>

            <div className="w-full px-2 lg:px-3 flex justify-center mt-2">
              <button
                onClick={
                  isInCart
                    ? (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push("/cart");
                    }
                    : handleAddToCartClick
                }
                disabled={
                  isAddingToCart ||
                  isOutOfStock ||
                  isNotShippable ||
                  isCheckingShipping
                }
                className={
                  isInCart
                    ? "w-full h-[30px] bg-white text-[#FD151B] text-[14px] font-medium rounded-[32px] border border-[#FD151B] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    : "w-full h-[30px] bg-[#FD151B] text-white text-[14px] font-medium rounded-[32px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                }
              >
                {isAddingToCart ? (
                  "Adding..."
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : isCheckingShipping ? (
                  "Checking..."
                ) : isNotShippable ? (
                  "Unavailable Here"
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