"use client";

import Breadcrumb from "@/components/common/Breadcrumb";

import ProductDetailSidebar from "./ProductDetailSidebar";
import ProductDetailContent from "./ProductDetailContent";
import type { ProductDetailMainProps } from "@/types/product";



export default function ProductDetailMain(props: ProductDetailMainProps) {
  return (
    <div className="lg:px-[40px]">
      <Breadcrumb />
      <div className="pdp-columns flex flex-wrap lg:flex-nowrap justify-start lg:gap-3 lg:items-start">
        <ProductDetailContent {...props} />
        <ProductDetailSidebar {...props} />
      </div>
    </div>
  );
}
