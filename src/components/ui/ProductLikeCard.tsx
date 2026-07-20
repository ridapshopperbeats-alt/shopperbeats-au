

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCreateWishlistMutation } from "@/lib/redux/apis/cart-api";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format-price";

interface ProductLikeCardProps {
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
  rating: number;
  reviewCount: number;
  linkHref: string;
  discountPercentage?: number;
  saveAmount?: number;
  productId: string;
  variantId?: string;
}

export default function ProductLikeCard({
  image,
  title,
  price,
  oldPrice,
  rating,
  linkHref,
  productId,
  variantId,
}: ProductLikeCardProps) {
  const [createWishlist, { isLoading: isAddingToWishlist }] =
    useCreateWishlistMutation();
  const handleWishlistButtonClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await createWishlist({
        product_id: productId,
        variant_id: variantId,
      }).unwrap();
      toast.success("Product added to wishlist!");
    } catch {
      toast.error("Failed to add product to wishlist.");
    }
  };
  const limitCharacters = (text: string, limit = 50) => {
    if (!text) return "";

    return text.length > limit
      ? text.slice(0, limit) + "..."
      : text;
  };
  return (
    <Link href={linkHref}>
      <div className="flex items-center gap-4  bg-white  border border-[#D9D2D2] rounded-[8px]  transition relative w-[343px] mx-auto">
        <div className="w-[143px] h-[132px] overflow-hidden rounded-tl-[8px] rounded-bl-[8px] justify-center flex">
          <Image
            src={image}
            alt="Product"
            height={120}
            width={120}
            loading="lazy"
            className="object-contain"
          />
        </div>

        <div className="flex-1 flex flex-col gap-2 w-[143px] h-full" >
          <h4 className=" font-medium leading-tight min-h-[40px] max-w-[160px]" style={{ fontSize: "14px", color: "#000" }}>
            {limitCharacters(title, 40)}
          </h4>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-red-500 font-semibold text-sm">
              ${formatPrice(price)}
            </span>

            {oldPrice && (
              <span className="text-gray-400 text-xs line-through">
                WAS: ${formatPrice(oldPrice)}
              </span>
            )}
          </div>

          {rating > 0 && (
            <div className="flex text-gray-300 font-bold text-[13px] items-center gap-1">
              {rating}
            </div>
          )}
        </div>

        {/* Wishlist button, revealed on hover */}
        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 group-hover:opacity-100 transition">
          <Button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleWishlistButtonClick}
            disabled={isAddingToWishlist}
            isLoading={isAddingToWishlist}
            debounceDelay={500}
          >
            {isAddingToWishlist ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Image
                src="/images/wishlist.svg"
                alt="wishlist"
                width={18}
                height={18}
              />
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
