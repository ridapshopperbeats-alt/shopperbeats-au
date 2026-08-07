import React from "react";
import StaticProductCarousel from "../common/StaticProductCarousel";
import { Product } from "@/types/product";
import { getPriceDetails, getImageUrl } from "@/lib/utils/main-utils";
import { getStaticProductShippingCost } from "@/lib/utils/staticCategoryData";

const EMPTY_VARIANTS: never[] = [];

export default function StaticRecommendedForYou({
  products,
}: {
  products?: Product[] | null;
}) {
  if (!products || products.length === 0) {
    return null;
  }

  const transformedProducts = products.map((product) => {
    const priceInfo = getPriceDetails(product);

    return {
      image: getImageUrl(product, "plpcard"),
      title: product.title,
      brand_name: product.brand_name,
      mainPrice: priceInfo.mainPrice,
      wasPrice: priceInfo.wasPrice,
      showWasPrice: priceInfo.showWasPrice,
      discountPercentage: priceInfo.discountPercentage,
      saveAmount: priceInfo.saveAmount,
      id: product.id,
      unique_code: product.unique_code,
      defaultVariantId: product.variants?.[0]?.id,
      variants: product.variants ?? EMPTY_VARIANTS,
      promotion_name: product.promotion_name,
      stock: product.stock,
      vendor_id: product.vendor_id,
      rating: product.review_stats?.average_rating || 0,
      reviewCount: product.review_stats?.total_reviews || 0,
      tags: product.tags,
      ships_from_location: product.ships_from_location,
      handling_time_days: product.handling_time_days,
      shippingCharge: getStaticProductShippingCost(product),
    };
  });

  return (
    <StaticProductCarousel
      title={
        <div className="fluid-text-14-26 leading-[18px] font-bold text-[#FD151B]">
          Products <span className="text-[#012A62]">related to this item</span>
        </div>
      }
      products={transformedProducts}
    />
  );
}
