"use client";

import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import DynamicImportLoader from "@/components/ui/loaders/DynamicImportLoader";

const ProductCard = dynamic(() => import("@/components/ui/ProductCard"), {
  loading: DynamicImportLoader,
});

const EMPTY_VARIANTS: never[] = [];

import Pagination from "@/components/ui/Pagination";
import { Product } from "@/types/product";
import { WishlistKey } from "@/types/wishlist";
import { getPriceDetails } from "@/lib/utils/get-price-details";
import { formatPriceFixed2 } from "@/lib/utils/format-price";
import { getImageUrl } from "@/lib/utils/image-utils";
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";
import {
  useCreateWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/lib/redux/apis/cart-api";

import { toast } from "react-toastify";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { Filter, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NoProductsFound from "../NoProductFound";
import Button from "../ui/Button";
import MobileSortSheet from "./MobileSortSheet";

interface ProductDisplayProps {
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
  infiniteScroll?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
  hideSortAndPagination?: boolean;
  wishlistItems?: WishlistKey[];
  onToggleSidebar: () => void;
  tags?: { key: string; label: string; onRemove: () => void }[];
  onClearFilters?: () => void;
  hideFilterButton?: boolean;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  products: initialProducts,
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  sortBy,
  onSortChange,
  isLoading = false,
  infiniteScroll = false,
  hasMore = false,
  onLoadMore,
  isFetchingMore = false,
  hideSortAndPagination = false,
  wishlistItems = [],
  tags = [],
  onClearFilters,
  onToggleSidebar,
  hideFilterButton = false,
}) => {
  const products = initialProducts;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [viewMode] = useState<"grid" | "list">("grid");
  const [showMobileSort, setShowMobileSort] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [createWishlist] = useCreateWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  useIntersectionObserver({
    target: loadMoreRef as React.RefObject<Element>,
    onIntersect: () => {
      if (
        infiniteScroll &&
        hasMore &&
        !isFetchingMore &&
        onLoadMore &&
        initialProducts.length < 20
      ) {
        onLoadMore();
      }
    },
    enabled:
      infiniteScroll &&
      hasMore &&
      !isFetchingMore &&
      initialProducts.length < 20,
    rootMargin: "100px",
  });

  const handleWishlist = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const isWishlisted = wishlistItems.some(
      (item) =>
        item.product_id === product.id &&
        item.variant_id === (product.variants?.[0]?.id ?? null),
    );

    try {
      if (isWishlisted) {
        await removeFromWishlist({
          product_id: product.id as string,
          variant_id: product.variants?.[0]?.id,
        }).unwrap();

        toast.success("Removed from wishlist");
      } else {
        await createWishlist({
          product_id: product.id as string,
          variant_id: product.variants?.[0]?.id as string,
        }).unwrap();

        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Wishlist update failed");
    }
  };
  return (
    <div className="w-full  flex-1 pb-16 lg:pb-0">
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

      {!isLoading && !isFetchingMore && products.length === 0 ? (
        <div className="flex flex-col items-center w-full py-10">
          <NoProductsFound />
        </div>
      ) : (
        <>
          {viewMode === "grid" && (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-5  ">
              {products.map((product) => {
                const priceInfo = getPriceDetails(product);

                return (
                  <ProductCard
                    key={product.id}
                    wishlistItems={wishlistItems}
                    image={getImageUrl(product)}
                    title={product.title}
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
          )}

          {viewMode === "list" && (
            <div className="flex flex-col gap-4 mt-6">
              {products.map((product) => {
                const priceInfo = getPriceDetails(product);

                return (
                  <Link
                    href={`/product/${product.unique_code}`}
                    key={product.id}
                    className="relative w-full bg-white flex flex-col md:flex-row gap-[25px] rounded-[8px]"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={(e) => handleWishlist(e, product)}
                        className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill={
                            wishlistItems.some(
                              (item) =>
                                item.product_id === product.id &&
                                item.variant_id ===
                                  (product.variants?.[0]?.id ?? null),
                            )
                              ? "red"
                              : "none"
                          }
                          stroke="red"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                    </div>

                    <div className="w-[350px] shrink-0">
                      <div className="relative w-[350px] h-full max-h-[371px] !rounded-[8px] overflow-hidden">
                        <Image
                          src={getImageUrl(product)}
                          alt={product?.title || ""}
                          height={371}
                          width={263}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center flex-1 xl:max-w-[55%] 2xl:max-w-full">
                      <div className="flex items-center gap-2 mb-3 px-4 md:px-0">
                        <span className="h-[34px] w-[120px] inline-flex items-center justify-center rounded-[50px] border border-[#FD151B] text-[#FD151B] leading-[13px] text-[13px] font-semibold">
                          Free Shipping
                        </span>

                        {priceInfo.saveAmount && (
                          <span className="bg-red-500 text-white text-[13px] font-semibold  px-2 py-[4px]">
                            Save ${formatPriceFixed2(priceInfo.saveAmount)}
                          </span>
                        )}
                      </div>

                      <div className="px-4 md:px-0 text-[1.2rem]  leading-[31px] font-semibold text-black">
                        {product?.title || ""}
                      </div>

                      <div className="mt-4">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              product?.description
                                ?.match(/<ul>([\s\S]*?)<\/ul>/)?.[0]
                                ?.replace(/<\/?strong>/g, "")
                                ?.replace(
                                  /<ul>([\s\S]*?)<\/ul>/,
                                  (_, content) =>
                                    `<ul class="list-wrapper">${
                                      content
                                        .match(/<li>[\s\S]*?<\/li>/g)
                                        ?.slice(0, 4)
                                        .join("") || ""
                                    }</ul>`,
                                )
                                ?.replace(/<li>/g, `<li class="list-disc">`) ||
                              "",
                            ),
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2 text-center xl:pt-4 px-4 md:px-0">
                        <span className="text-[20px] lg:text-[32px] font-bold text-[#FD151B]">
                          ${priceInfo.mainPrice}
                        </span>

                        {priceInfo.showWasPrice && (
                          <span className="text-[16px] lg:text-[20px] font-semibold text-[#726969] line-through">
                            ${priceInfo.wasPrice}
                          </span>
                        )}

                        {priceInfo.saveAmount && (
                          <span className="bg-red-500 text-white text-[13px] font-semibold  px-2 py-[4px]">
                            Save ${formatPriceFixed2(priceInfo.saveAmount)}
                          </span>
                        )}
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {infiniteScroll && hasMore && initialProducts.length < 20 && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center"
        >
          {isFetchingMore && (
            <p className="text-sm text-gray-500">Loading more...</p>
          )}
        </div>
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

export default ProductDisplay;
