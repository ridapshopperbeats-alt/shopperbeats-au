"use client";

import React from "react";
import ProductCarousel from "../common/ProductCarousel";
import { Product } from "@/types/product";
import { getPriceDetails, getImageUrl } from "@/lib/utils/main-utils";

export default function RecommendedForYou({
  personalized,
  recentlyViewed,
  isLoading = false,
}: {
  personalized?: Product[] | null;
  recentlyViewed?: Product[] | null;
  isLoading?: boolean;
}) {
  const productsToUse = personalized?.length ? personalized : recentlyViewed;

  if (!isLoading && (!productsToUse || productsToUse.length === 0)) {
    return null;
  }

  const transformedProducts =
    productsToUse?.map((product) => {
      const priceInfo = getPriceDetails(product);

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        unique_code: product.unique_code,
        tags: product.tags,

        brand_name: product.brand_name,
        brand_slug: product.brand_slug,

        category_name: product.category_name,
        category_slug: product.category_slug,

        image: getImageUrl(product),

        mainPrice: priceInfo.mainPrice,
        wasPrice: priceInfo.wasPrice,
        showWasPrice: priceInfo.showWasPrice,
        discountPercentage: priceInfo.discountPercentage,
        saveAmount: priceInfo.saveAmount,

        free_shipping: product.free_shipping,
        fast_dispatch: product.fast_dispatch,

        promotion_name: product.promotion_name ?? null,
        rating: product.review_stats?.average_rating ?? undefined,
        reviewsCount: product.reviews?.length ?? 0,
      };
    }) || [];

  return (
    <ProductCarousel
      title={
        <div className="text-[14px] lg:text-[26px] leading-[18px] font-bold">
          Products <span className="text-[#012A62]">related to this item</span>
        </div>
      }
      products={transformedProducts}
      isLoading={isLoading}
      withoutContainer={true}
    />
  );
}
