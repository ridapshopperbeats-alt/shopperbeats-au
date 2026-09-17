"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { transformProductData } from "@/lib/utils/main-utils";
import ProductCarousel from "../common/ProductCarousel";

export default function TrendingDeals({
  trendingDeals,
}: {
  trendingDeals?: Product[];
}) {
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClientLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const transformedProducts = trendingDeals?.length
    ? transformProductData(trendingDeals)
    : [];

  if (!isClientLoading && transformedProducts.length === 0) {
    return null;
  }

  return (
    <ProductCarousel
      title="Trending Deals"
      products={transformedProducts}
      isLoading={isClientLoading}
    />
  );
}
