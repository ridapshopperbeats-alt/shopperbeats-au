"use client";

import React, { useState, useEffect } from "react";
import ProductCarousel from "../ui/ProductCarousel";
import { getPriceDetails } from "@/lib/utils/get-price-details";
import { Product } from "@/types/product";
import { getImageUrl } from "@/lib/utils/image-utils";

export default function Personalized({ personalized }: { personalized: Product[] }) {
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClientLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const transformedProducts = personalized.map((product) => {
    const priceInfo = getPriceDetails(product);

    return {
      ...product,
      mainPrice: priceInfo.mainPrice,
      wasPrice: priceInfo.wasPrice,
      tags: product.tags,
      showWasPrice: priceInfo.showWasPrice,
      discountPercentage: priceInfo.discountPercentage,
      saveAmount: priceInfo.saveAmount,
      image: getImageUrl(product),
      unique_code: product.unique_code || product.product_unique_code,
      promotion_name: product.promotion_name,
    };
  });

  return (
    <ProductCarousel
      subtitle="Picked Based on You"
      title="Top Rated"
      products={transformedProducts}
      link="/product-listing/personalized"
      isLoading={isClientLoading}
    />
  );
}
