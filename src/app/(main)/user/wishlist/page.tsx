"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import StaticProductCard from "@/components/common/StaticProductCard";
import { useStaticCart } from "@/lib/hooks/useStaticCart";
import { ProductCardProps } from "@/types/product";

// ---------------- DUMMY DATA (static, for now — mirrors homepage StaticCard.tsx) ----------------
const STATIC_WISHLIST_PRODUCTS: ProductCardProps[] = [
  {
    id: "wishlist-1",
    unique_code: "wishlist-1",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
    brand_name: "Terractive",
    title: "Stretchie Tank Top - Super-Soft, Sweat-Wicking & Stretchy",
    mainPrice: 89,
    wasPrice: 249,
    showWasPrice: true,
    saveAmount: 64,
    rating: 4.5,
    reviewCount: 128,
    stock: 15,
    shippingCharge: 0,
    tags: ["hotseller"],
  },
  {
    id: "wishlist-2",
    unique_code: "wishlist-2",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
    brand_name: "Glow",
    title: "Glow Makeup Essentials Kit - Glow With Beauty Essentials",
    mainPrice: 119,
    wasPrice: 299,
    showWasPrice: true,
    saveAmount: 60,
    rating: 4.5,
    reviewCount: 76,
    stock: 24,
    shippingCharge: 0,
    tags: ["new"],
  },
  {
    id: "wishlist-3",
    unique_code: "wishlist-3",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&q=80",
    brand_name: "ShopperBeats",
    title: "Rose Gold Minimal Watch - Timeless Style With Luxury Touch",
    mainPrice: 199,
    wasPrice: 499,
    showWasPrice: true,
    saveAmount: 60,
    rating: 4.5,
    reviewCount: 54,
    stock: 8,
    shippingCharge: 0,
    tags: ["bestseller"],
  },
  {
    id: "wishlist-4",
    unique_code: "wishlist-4",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
    brand_name: "ShopperBeats",
    title: "Luxury Quilted Chain Bag - Elegant Bags For Modern Looks",
    mainPrice: 79,
    wasPrice: 199,
    showWasPrice: true,
    saveAmount: 60,
    rating: 4.5,
    reviewCount: 32,
    stock: 0,
    shippingCharge: 0,
  },
  {
    id: "wishlist-5",
    unique_code: "wishlist-5",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80",
    brand_name: "Terractive",
    title: "Stretchie Tank Top - Super-Soft, Sweat-Wicking & Stretchy",
    mainPrice: 89,
    wasPrice: 249,
    showWasPrice: true,
    saveAmount: 64,
    rating: 4.5,
    reviewCount: 128,
    stock: 15,
    shippingCharge: 0,
    tags: ["hotseller"],
  },
  {
    id: "wishlist-6",
    unique_code: "wishlist-6",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&q=80",
    brand_name: "ShopperBeats",
    title: "Rose Gold Minimal Watch - Timeless Style With Luxury Touch",
    mainPrice: 199,
    wasPrice: 499,
    showWasPrice: true,
    saveAmount: 60,
    rating: 4.5,
    reviewCount: 54,
    stock: 8,
    shippingCharge: 0,
    tags: ["bestseller"],
  },
];

export default function WishlistPage() {
  const { addToCart } = useStaticCart();

  const items = STATIC_WISHLIST_PRODUCTS;

  const handleAddAllToCart = () => {
    const inStockItems = items.filter((item) => (item.stock ?? 0) > 0);

    inStockItems.forEach((item) =>
      addToCart({
        id: String(item.unique_code || item.id),
        image: item.image,
        brand_name: item.brand_name || "No Brand",
        title: item.title || "",
        mainPrice: item.mainPrice || 0,
        wasPrice: item.wasPrice || 0,
        saveAmount: item.saveAmount || 0,
        shippingCharge: item.shippingCharge || 0,
        isOutOfStock: false,
      }),
    );

    toast.success(`Added ${inStockItems.length} item(s) to cart`);
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
        >
          <ShoppingBag size={14} />
          Add All to Cart
        </Button>
      </Card>

      {items.length === 0 ? (
        <Card className="w-full items-center p-10 text-center">
          <p className="text-sm text-gray-400">Your wishlist is empty.</p>
        </Card>
      ) : (
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="w-full [&>div]:max-h-none! [&>div]:h-auto! [&_a]:max-h-none! [&_a]:h-auto!"
            >
              <StaticProductCard {...item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
