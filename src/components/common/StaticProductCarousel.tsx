"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";
import { toast } from "react-toastify";
import type { ReactNode } from "react";

import ReusableSlider from "./ReusableSlider";
import StarRating from "./StarRating";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import StarIcon from "@mui/icons-material/Star";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import getEstimatedDeliveryRange from "@/lib/utils/get-estimated-delivery-range";
import { useStaticCart } from "@/lib/hooks/useStaticCart";
import { useStaticWishlist } from "@/lib/hooks/useStaticWishlist";
import type { StaticProduct } from "@/lib/utils/staticStorage";
import { ProductCardProps } from "@/types/product";

interface StaticProductCarouselProps {
  title: ReactNode;
  products: ProductCardProps[];
  link?: string;
}

function limitWords(text: string | undefined, limit = 7) {
  if (!text) return "";
  const words = text.split(" ");
  return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
}

function renderTag(tag: string | undefined) {
  switch (tag) {
    case "hotseller":
      return (
        <div className="absolute bg-[#01295F] text-white w-[70px] h-[18px] md:w-[90px] md:h-[19px] top-[10px] left-[10px] fluid-text-2xs font-medium flex items-center justify-center z-10 rounded-[5px] leading-[18px] gap-1">
          <ThumbUpIcon sx={{ fontSize: "clamp(0.625rem, 1vw, 0.6875rem)" }} />
          Bestseller
        </div>
      );

    case "new":
      return (
        <div className="absolute bg-[#787FFF] text-white w-[60px] h-[18px] md:w-[60px] md:h-[19px] top-[10px] left-[10px] fluid-text-2xs font-medium flex items-center justify-center z-10 rounded-[5px] leading-[18px] gap-1">
          <StarIcon sx={{ fontSize: "clamp(0.625rem, 1vw, 0.6875rem)" }} />
          New
        </div>
      );

    case "bestseller":
      return (
        <div className="absolute top-[10px] left-[10px] z-10 flex h-[18px] w-[80px] items-center justify-center gap-1 rounded-[5px] bg-[#FFB30F] fluid-text-2xs font-medium leading-[18px] text-white md:h-[19px] md:w-[80px]">
          <WhatshotIcon sx={{ fontSize: "clamp(0.625rem, 1vw, 0.6875rem)" }} />
          Hotseller
        </div>
      );

    default:
      return null;
  }
}

function StaticCarouselCard(product: ProductCardProps) {
  const {
    image,
    brand_name,
    title,
    mainPrice,
    wasPrice,
    saveAmount,
    rating = 0,
    reviewCount = 0,
    id,
    defaultVariantId,
    variants = [],
    unique_code,
    stock,
    ships_from_location,
    handling_time_days,
    shippingCharge,
    tags,
  } = product;

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

  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWishlisted = isWishlisted;
    toggleItem(toStaticProduct());
    toast.success(
      wasWishlisted ? "Removed from wishlist" : "Added to wishlist",
    );
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart(toStaticProduct());
    toast.success("Product added to cart!");
  };

  return (
    <div className="group relative w-full h-full flex flex-col justify-start overflow-hidden rounded-[7px]">
      {renderTag(tags?.[0])}

      <button
        type="button"
        onClick={handleToggleWishlist}
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
        className="flex h-full flex-col no-underline text-inherit"
      >
        <div className="relative w-full h-[150px] md:h-[260px] shrink-0 overflow-hidden rounded-t-[7px] bg-[#F5F5F5]">
          <Image
            src={image}
            alt={title || "Product Image"}
            fill
            loading="lazy"
            className="object-cover"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5]/60">
              <span className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#211E22] shadow-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between w-full">
          <div className="flex flex-col gap-1 pt-1 md:pt-2">
            <h4 className="text-[14px] font-bold text-black">
              {brand_name || "No Brand"}
            </h4>

            <p className="text-[13px] md:text-[14px] leading-4.5 text-[#878787] font-normal truncate">
              {limitWords(title, 7) || "MakeupKit"}
            </p>

            <div className="flex items-center gap-2 h-4 py-3">
              <span className="text-[16px] md:text-[20px] font-semibold text-[#052B56]">
                ${mainPrice}
              </span>

              {wasPrice && (
                <span className="text-[11px] font-light text-[#535766] line-through">
                  ${wasPrice}
                </span>
              )}

              {saveAmount && (
                <span className="text-[9px] md:text-[12px] font-semibold text-[#008F11]">
                  {saveAmount}% OFF
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

            <div className="flex flex-col gap-1 min-h-[46px] text-[12px] md:text-[13px] leading-[18px] text-[#535252]">
              {!isOutOfStock && (
                <>
                  <p className="font-normal truncate">
                    {shippingCharge === 0
                      ? "Delivery Fee - $0"
                      : `Delivery Fee - $${shippingCharge}`}
                  </p>

                  <p className="font-normal ">
                    Estimated delivery between{" "}
                    <span className="font-medium">
                      {getEstimatedDeliveryRange(
                        ships_from_location,
                        handling_time_days || 0,
                      )}
                    </span>
                  </p>
                </>
              )}

              <p className="font-normal text-[#FF4400] truncate">
                Extra 10% Off With Code: SHBS10
              </p>
            </div>
          </div>

          <div className="w-full px-2 lg:px-3 flex justify-center">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={
                isOutOfStock
                  ? "w-full h-[30px] !bg-[#F3F4F6] !text-[#9CA3AF] !opacity-100 text-[12px] font-medium rounded-[32px] flex items-center justify-center cursor-not-allowed"
                  : "w-full h-[30px] bg-[#FD151B] text-white text-[12px] font-medium rounded-[32px] flex items-center justify-center transition-colors cursor-pointer"
              }
            >
              {isOutOfStock ? "Out Of Stock" : "Add To Cart"}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function StaticProductCarousel({
  title,
  products,
  link,
}: StaticProductCarouselProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full px-[10px]">
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <div className="flex flex-col gap-1 w-full my-1">
            <h3 className="font-bold text-[18px] md:text-[32px] leading-4.5 tracking-[0.78px] text-black">
              {title}
            </h3>
          </div>
        </div>

        {link && (
          <Link
            href={link}
            className="text-[13px] font-bold flex items-center text-[#F51721] whitespace-nowrap"
          >
            View All <ChevronRight size={13} />
          </Link>
        )}
      </div>

      <div className="pt-3 lg:pt-5 overflow-visible">
        <ReusableSlider<ProductCardProps>
          items={products}
          slidesToScroll={3}
          gap={20}
          speed={600}
          infinite={false}
          autoplaySpeed={0}
          arrows={true}
          autoResponsive
          className="pc-carousel"
          slideClassName=""
          keyExtractor={(product) => product.unique_code || product.id || ""}
          renderItem={(product) => (
            <div className="w-[180px] h-[380px] md:w-[271px] md:h-[520px] lg:h-[500px]">
              <StaticCarouselCard {...product} />
            </div>
          )}
        />
      </div>
    </div>
  );
}
