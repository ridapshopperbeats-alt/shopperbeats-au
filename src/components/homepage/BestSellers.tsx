"use client";

import React, { useState, useEffect } from "react";
import ProductCarousel from "../ui/ProductCarousel";
import { Product } from "@/types/product";
import { transformProductData } from "@/lib/utils/transform-product-data";

export default function BestSellers({ bestSellers }: { bestSellers: Product[] }) {
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClientLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const transformedProducts = transformProductData(bestSellers);
  
  return (
    <ProductCarousel
      title="Best Sellers"
      subtitle="Most Loved by Shoppers"
      products={transformedProducts}
      link="/product-listing/best-sellers"
      isLoading={isClientLoading}
    />
  );
}
