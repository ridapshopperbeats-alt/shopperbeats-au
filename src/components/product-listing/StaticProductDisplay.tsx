"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import DynamicImportLoader from "@/components/ui/loaders/DynamicImportLoader";

const StaticProductCard = dynamic(
  () => import("@/components/common/StaticProductCard"),
  { loading: DynamicImportLoader },
);

const EMPTY_VARIANTS: never[] = [];

import Pagination from "@/components/common/Pagination";
import { Product } from "@/types/product";
import { getPriceDetails, getImageUrl } from "@/lib/utils/main-utils";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../common/select";

import { Filter, X } from "lucide-react";
import Image from "next/image";
import NoProductsFound from "../NoProductFound";
import Button from "../common/Button";
import MobileSortSheet from "./MobileSortSheet";

interface StaticProductDisplayProps {
  products: Product[];
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categoryName?: string;
  isLoading?: boolean;
  hideSortAndPagination?: boolean;
  onToggleSidebar: () => void;
  tags?: { key: string; label: string; onRemove: () => void }[];
  onClearFilters?: () => void;
  hideFilterButton?: boolean;
}

const StaticProductDisplay: React.FC<StaticProductDisplayProps> = ({
  products,
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  sortBy,
  onSortChange,
  isLoading = false,
  hideSortAndPagination = false,
  tags = [],
  onClearFilters,
  onToggleSidebar,
  hideFilterButton = false,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [showMobileSort, setShowMobileSort] = useState(false);

  return (
    <div className="w-full  flex-1">
      {!hideSortAndPagination && (
        <div className="hidden lg:block mb-[20px] sticky top-0 z-[2]">
          <div className="flex justify-end">
            <div className="flex items-end  whitespace-nowrap justify-between w-full h-[31px] gap-2">
              {!hideFilterButton && (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className="lg:hidden flex items-center gap-1.5 border border-[#001325]/64 rounded-[20px] h-[32px] px-3 text-[12px] font-normal text-[#001325]/64 cursor-pointer shrink-0"
                >
                  <Filter size={14} />
                  Filters
                </button>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 ">
                  {tags.map((tag) => (
                    <span
                      key={tag.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#FD151B] text-[#FD151B] text-[13px] font-medium px-2 py-1"
                    >
                      {tag.label}
                      <button
                        type="button"
                        onClick={tag.onRemove}
                        aria-label={`Remove ${tag.label}`}
                        className="cursor-pointer flex items-center bg-[#FD151B] rounded-full h-[12px] w-[12px]"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </span>
                  ))}

                  <Button
                    type="button"
                    onClick={onClearFilters}
                    className="!px-0 mt-auto !py-0 !m-0 text-[14px] font-medium text-[#FD151B] leading-none decoration-red-500 cursor-pointer underline"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              <div className="w-[241px] md:ml-auto">
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="h-[32px] w-full rounded-[20px] border border-[#001325]/64 bg-white px-4 shadow-none focus:ring-0">
                    <div className="flex items-center gap-2 flex-1">
                      <Image
                        src="/images/sortBy.svg"
                        alt="sort"
                        width={18}
                        height={18}
                      />

                      <span className="text-[12px] font-normal text-[#001325]/64 leading-[18px] whitespace-nowrap">
                        Sort by :
                      </span>

                      <SelectValue placeholder="Price" />
                    </div>
                  </SelectTrigger>

                  <SelectContent
                    position="popper"
                    className="w-[240px] max-w-[230px] border !border-[#F6F6F6] bg-white p-2 shadow-[#000000]/25 rounded-[5px] ring-0 outline-none focus:outline-none focus:ring-0 text-[14px] font-normal leading-[17px] "
                  >
                    <SelectItem value="price_asc" className="mb-2">
                      Price: Low to High
                    </SelectItem>

                    <SelectItem value="price_desc" className="mb-2">
                      Price: High to Low
                    </SelectItem>

                    <SelectItem value="newly_added" className="mb-2">
                      Newly Added
                    </SelectItem>

                    <SelectItem value="top_rated" className="mb-2">
                      Highest Rated
                    </SelectItem>

                    <SelectItem value="biggest_saving" className="mb-2">
                      Biggest Saving
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center w-full py-10">
          <NoProductsFound />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5  ">
            {products.map((product) => {
              const priceInfo = getPriceDetails(product);

              return (
                <StaticProductCard
                  key={product.id}
                  image={getImageUrl(product, "plpcard")}
                  title={product.title}
                  brand_name={product.brand_name}
                  mainPrice={priceInfo.mainPrice}
                  wasPrice={priceInfo.wasPrice}
                  showWasPrice={priceInfo.showWasPrice}
                  discountPercentage={priceInfo.discountPercentage}
                  saveAmount={priceInfo.saveAmount}
                  id={product.id}
                  unique_code={product.unique_code}
                  defaultVariantId={product.variants?.[0]?.id}
                  variants={product.variants ?? EMPTY_VARIANTS}
                  promotion_name={product.promotion_name}
                  stock={product.stock}
                  vendor_id={product.vendor_id}
                  rating={product.review_stats?.average_rating || 0}
                  reviewCount={product.review_stats?.total_reviews || 0}
                  tags={product.tags}
                  ships_from_location={product.ships_from_location}
                  handling_time_days={product.handling_time_days}
                />
              );
            })}
          </div>
        </>
      )}

      {!hideSortAndPagination && products.length > 0 && (
        <>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            totalItems={totalItems}
          />
        </>
      )}

      {!hideSortAndPagination && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch w-full h-[47px] opacity-100 bg-white border-t border-[#EAEAEA] shadow-[0px_0px_16.1px_1px_#8E8E8E40]">
          {!hideFilterButton && (
            <button
              type="button"
              onClick={() => setShowMobileSort(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-montserrat font-normal text-[16px] leading-[18px] tracking-[0%] capitalize text-[#001325A3] cursor-pointer"
            >
              <Image
                src="/images/sortBy.svg"
                alt="sort"
                width={18}
                height={18}
              />
              Sort
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex-1 flex items-center justify-center gap-2 py-3 font-montserrat font-normal text-[16px] leading-[18px] tracking-[0%] capitalize text-[#001325A3] cursor-pointer"
          >
            <Image
              src="/images/mobileFilter.svg"
              alt="Sort"
              width={16}
              height={16}
            />
            Filter
          </button>
        </div>
      )}

      <MobileSortSheet
        open={showMobileSort}
        onClose={() => setShowMobileSort(false)}
        sortBy={sortBy}
        onSortChange={onSortChange}
      />
    </div>
  );
};

export default StaticProductDisplay;
