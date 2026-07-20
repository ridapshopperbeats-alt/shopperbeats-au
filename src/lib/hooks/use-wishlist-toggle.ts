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
}

/**
 * Encapsulates the wishlist heart-toggle behaviour used by ProductCard:
 * derives the wishlisted state from the passed-in wishlist items, applies an
 * optimistic override while the mutation is in flight, and rolls back on error.
 */
export function useWishlistToggle({
  productId,
  variantId = null,
  wishlistItems = [],
}: UseWishlistToggleArgs) {
  const [createWishlist, { isLoading: isAddingToWishlist }] =
    useCreateWishlistMutation();

  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] =
    useRemoveFromWishlistMutation();

  const wishlistedFromProp = useMemo(() => {
    return wishlistItems.some((item) => {
      if (!productId) return false;
      return (
        item.product_id === productId &&
        item.variant_id === (variantId ?? null)
      );
    });
  }, [wishlistItems, productId, variantId]);

  const [wishlistOverride, setWishlistOverride] = useState<boolean | null>(null);
  const isWishlisted = wishlistOverride ?? wishlistedFromProp;

  const isLoading = isAddingToWishlist || isRemovingFromWishlist;

  const toggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId || isLoading) return;

    const wasWishlisted = isWishlisted;
    setWishlistOverride(!wasWishlisted);

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
      toast.error("Failed to update wishlist.");
    }
  };

  return { isWishlisted, isLoading, toggle };
}
