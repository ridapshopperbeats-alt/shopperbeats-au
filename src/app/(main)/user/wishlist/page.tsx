"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import ProductCard from "@/components/common/ProductCard";
import {
  useGetWishlistQuery,
  useAddToCartMutation,
  useRemoveFromWishlistMutation,
} from "@/lib/redux/apis/cart-api";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { getPriceDetails, getImageUrl } from "@/lib/utils/main-utils";
export default function WishlistPage() {
  const {
    data: wishlist,
    isLoading,
    isFetching,
  } = useGetWishlistQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [addToCart] = useAddToCartMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const { postcode } = useGlobalPostcode();
  const [isTransferring, setIsTransferring] = useState(false);

  const items = wishlist?.items ?? [];

  const wishlistKeys = items.map((item) => ({
    product_id: item.product_id,
    variant_id: item.variant_id,
  }));

  const handleAddAllToCart = async () => {
    // Guard against double-clicks/re-entrancy and an empty wishlist.
    if (isTransferring || items.length === 0) return;

    setIsTransferring(true);
    try {
      const inStockItems = items.filter(
        (item) => (item.available_stock ?? item.stock ?? 0) > 0,
      );

      const results = await Promise.allSettled(
        inStockItems.map((item) =>
          addToCart({
            productId: item.product_id,
            quantity: 1,
            variant_id: item.variant_id,
            vendor_id: item.vendor_id,
            postcode,
          }).unwrap(),
        ),
      );

      const movedItems = inStockItems.filter(
        (_, index) => results[index].status === "fulfilled",
      );

      await Promise.allSettled(
        movedItems.map((item) =>
          removeFromWishlist({
            product_id: item.product_id,
            variant_id: item.variant_id ?? undefined,
          }).unwrap(),
        ),
      );

      const failedCount = inStockItems.length - movedItems.length;
      if (movedItems.length > 0) {
        toast.success(`Added ${movedItems.length} item(s) to cart`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to add ${failedCount} item(s) to cart.`);
      }
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="w-full flex-row items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4">
        <div className="min-w-0">
          <h4 className="font-montserrat text-[clamp(0.875rem,0.875rem,0.875rem)] font-bold leading-[19.5px] text-[#211E22] whitespace-nowrap">
            My Wishlist
          </h4>
          <p className="font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-normal leading-[16.5px] text-[#99A1AF] whitespace-nowrap">
            {items.length} items saved
          </p>
        </div>

        <Button
          onClick={handleAddAllToCart}
          className="flex shrink-0 items-center justify-center gap-1.5 sm:gap-2 rounded-[10px] bg-sb-red px-3.5 sm:px-5 py-2 sm:py-2.5 text-[0.75rem]! sm:text-[0.75rem] font-normal text-white whitespace-nowrap cursor-pointer"
          debounceDelay={500}
          disabled={items.length === 0 || isTransferring}
        >
          <ShoppingBag size={14} />
          Add All to Cart
        </Button>
      </Card>

      {isLoading || isFetching ? (
        <Card className="w-full items-center p-10 text-center">
          <p className="text-sm text-gray-400">Loading your wishlist...</p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="w-full items-center p-10 text-center">
          <p className="text-sm text-gray-400">Your wishlist is empty.</p>
        </Card>
      ) : (
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const priceInfo = getPriceDetails(item);

            return (
              <div
                key={`${item.product_id}-${item.variant_id ?? "default"}`}
                className="w-full [&>div]:max-h-none! [&>div]:h-auto! [&_a]:max-h-none! [&_a]:h-auto!"
              >
                <ProductCard
                  wishlistItems={wishlistKeys}
                  image={getImageUrl(item, "plpcard")}
                  title={item.title || item.product_name}
                  brand_name={item.brand_name}
                  mainPrice={priceInfo.mainPrice}
                  wasPrice={priceInfo.wasPrice}
                  showWasPrice={priceInfo.showWasPrice}
                  discountPercentage={priceInfo.discountPercentage}
                  saveAmount={priceInfo.saveAmount}
                  id={item.product_id}
                  unique_code={item.unique_code || item.product_id}
                  defaultVariantId={item.variant_id}
                  variants={item.variants}
                  promotion_name={item.promotion_name}
                  stock={item.available_stock ?? item.stock}
                  vendor_id={item.vendor_id}
                  rating={item.review_stats?.average_rating || 0}
                  reviewCount={item.review_stats?.total_reviews || 0}
                  tags={item.tags}
                  ships_from_location={item.ships_from_location}
                  handling_time_days={item.handling_time_days}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
