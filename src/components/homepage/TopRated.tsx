"use client";

import React, { useState, useEffect } from "react";
import ProductCarousel from "../ui/ProductCarousel";
import { Product } from "@/types/product";
import { transformProductData } from "@/lib/utils/transform-product-data";

export default function TopRated({ topRated }: { topRated: Product[] }) {
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClientLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const transformedProducts = transformProductData(topRated);
  return (
    <ProductCarousel
      title="Top Rated"
      subtitle="High Rated by Users"
      products={transformedProducts}
      link="/product-listing/top-rated"
      isLoading={isClientLoading}
    />
  );
}
