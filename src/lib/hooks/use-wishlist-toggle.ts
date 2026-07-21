import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  useCreateWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/lib/redux/apis/cart-api";
import { WishlistKey } from "@/types/wishlist";

interface UseWishlistToggleArgs {
  productId?: string;
  variantId?: string | null;
  wishlistItems?: WishlistKey[];
  syncWishlistItems?: React.Dispatch<React.SetStateAction<WishlistKey[]>>;
  requireVariant?: boolean;
  hasVariants?: boolean;
  matchAnyVariant?: boolean;
}

export function useWishlistToggle({
  productId,
  variantId = null,
  wishlistItems = [],
  syncWishlistItems,
  requireVariant = false,
  hasVariants = false,
  matchAnyVariant = false,
}: UseWishlistToggleArgs) {
  const [createWishlist, { isLoading: isAddingToWishlist }] =
    useCreateWishlistMutation();

  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] =
    useRemoveFromWishlistMutation();

  const wishlistedFromProp = useMemo(() => {
    return wishlistItems.some((item) => {
      if (!productId) return false;
      if (matchAnyVariant) return item.product_id === productId;
      return (
        item.product_id === productId &&
        item.variant_id === (variantId ?? null)
      );
    });
  }, [wishlistItems, productId, variantId, matchAnyVariant]);

  const [wishlistOverride, setWishlistOverride] = useState<boolean | null>(null);
  const isWishlisted = wishlistOverride ?? wishlistedFromProp;

  const isLoading = isAddingToWishlist || isRemovingFromWishlist;

  const toggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId || isLoading) return;

    if (requireVariant && hasVariants && !variantId) {
      toast.error("Choose your preferred option before adding to wishlist!");
      return;
    }

    const wasWishlisted = isWishlisted;
    setWishlistOverride(!wasWishlisted);

    if (syncWishlistItems) {
      syncWishlistItems((prev) =>
        wasWishlisted
          ? prev.filter(
              (item) =>
                !(item.product_id === productId && item.variant_id === variantId),
            )
          : [...prev, { product_id: productId, variant_id: variantId }],
      );
    }

    try {
      if (wasWishlisted) {
        await removeFromWishlist({
          product_id: productId,
          variant_id: variantId ?? undefined,
        }).unwrap();
        toast.success("Product removed from wishlist!");
      } else {
        await createWishlist({
          product_id: productId,
          variant_id: variantId ?? undefined,
        }).unwrap();
        toast.success("Product added to wishlist!");
      }
    } catch {
      setWishlistOverride(wasWishlisted);
      if (syncWishlistItems) {
        syncWishlistItems((prev) =>
          wasWishlisted
            ? [...prev, { product_id: productId, variant_id: variantId }]
            : prev.filter(
                (item) =>
                  !(item.product_id === productId && item.variant_id === variantId),
              ),
        );
      }
      toast.error("Failed to update wishlist.");
    }
  };

  return { isWishlisted, isLoading, toggle };
}
