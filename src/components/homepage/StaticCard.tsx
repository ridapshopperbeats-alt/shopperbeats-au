"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import StarRating from "../common/StarRating";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import StarIcon from "@mui/icons-material/Star";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { useStaticCart } from "@/lib/hooks/useStaticCart";
import { useStaticWishlist } from "@/lib/hooks/useStaticWishlist";
import type { StaticProduct } from "@/lib/utils/staticStorage";

function limitWords(text: string, limit = 7) {
  const words = text.split(" ");
  return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
}
const staticProducts = [
  {
    id: 1,
    slug: "static-1",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&h=600&q=80",
    brand_name: "Zara",
    title: "Women's Floral Dress",
    mainPrice: 79.99,
    wasPrice: 99.99,
    saveAmount: 20,
    rating: 4.8,
    reviewCount: 218,
    shippingCharge: 0,
    isOutOfStock: false,
    tag: "new",
  },

  {
    id: 3,
    slug: "static-3",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&h=600&q=80",
    brand_name: "Forever 21",
    title: "Women's Summer Dress",
    mainPrice: 59.99,
    wasPrice: 79.99,
    saveAmount: 25,
    rating: 4.6,
    reviewCount: 132,
    shippingCharge: 0,
    isOutOfStock: false,
    tag: "bestseller",
  },
  {
    id: 4,
    slug: "static-4",
    image:
      "https://images.unsplash.com/photo-1525550133628-43e58e551e6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW4lMjB0b3BzfGVufDB8fDB8fHww",
    brand_name: "Mango",
    title: "Women's Fashion Top",
    mainPrice: 49.99,
    wasPrice: 69.99,
    saveAmount: 29,
    rating: 4.8,
    reviewCount: 198,
    shippingCharge: 5,
    isOutOfStock: false,
    tag: "new",
  },

  {
    id: 5,
    slug: "static-5",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=600&h=600&q=80",
    brand_name: "Pandora",
    title: "Silver Jewelry Set",
    mainPrice: 189.99,
    wasPrice: 239.99,
    saveAmount: 21,
    rating: 4.9,
    reviewCount: 310,
    shippingCharge: 10,
    isOutOfStock: false,
    tag: "hotseller",
  },
  {
    id: 6,
    slug: "static-6",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&h=600&q=80",
    brand_name: "Ray-Ban",
    title: "Classic Sunglasses",
    mainPrice: 149.99,
    wasPrice: 189.99,
    saveAmount: 21,
    rating: 4.7,
    reviewCount: 175,
    shippingCharge: 0,
    isOutOfStock: false,
    tag: "bestseller",
  },
  {
    id: 7,
    slug: "static-25",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&h=600&q=80",
    brand_name: "Dior",
    title: "Luxury Perfume",
    mainPrice: 109.99,
    wasPrice: 139.99,
    saveAmount: 21,
    rating: 4.8,
    reviewCount: 120,
    shippingCharge: 0,
    isOutOfStock: false,
    tag: "new",
  },
  {
    id: 8,
    slug: "static-9",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=600&q=80",
    brand_name: "GUESS",
    title: "Men's Stylish Jacket",
    mainPrice: 119.99,
    wasPrice: 149.99,
    saveAmount: 20,
    rating: 4.9,
    reviewCount: 289,
    shippingCharge: 0,
    isOutOfStock: false,
    tag: "hotseller",
  },
  {
    id: 9,
    slug: "static-8",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&h=600&q=80",
    brand_name: "H&M",
    title: "Women's Casual Dress",
    mainPrice: 59.99,
    wasPrice: 79.99,
    saveAmount: 25,
    rating: 4.8,
    reviewCount: 218,
    shippingCharge: 0,
    isOutOfStock: false,
    tag: "new",
  },
  {
    id: 10,
    slug: "static-10",
    image:
      "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVuaW0lMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D",
    brand_name: "Levi's",
    title: "Slim Fit Denim Jacket",
    mainPrice: 89.99,
    wasPrice: 119.99,
    saveAmount: 25,
    rating: 4.9,
    reviewCount: 304,
    shippingCharge: 5,
    isOutOfStock: false,
    tag: "bestseller",
  },
  {
    id: 11,
    slug: "static-1",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&h=600&q=80",
    brand_name: "Zara",
    title: "Women's Floral Dress",
    mainPrice: 79.99,
    wasPrice: 99.99,
    saveAmount: 20,
    rating: 4.8,
    reviewCount: 218,
    shippingCharge: 0,
    isOutOfStock: false,
    tag: "new",
  },
];

const renderTag = (tag: string) => {
  switch (tag) {
    case "hotseller":
      return (
        <div className="absolute bg-[#01295F] text-white w-[70px] h-[18px] md:w-[90px] md:h-[19px] top-[10px] left-[10px] text-[10px] md:text-[12px] font-medium flex items-center justify-center z-10 rounded-[5px] leading-[18px] gap-1">
          <ThumbUpIcon sx={{ fontSize: { xs: "10px", md: "11px" } }} />
          Bestseller
        </div>
      );

    case "new":
      return (
        <div className="absolute bg-[#787FFF] text-white w-[60px] h-[18px] md:w-[60px] md:h-[19px] top-[10px] left-[10px] text-[10px] md:text-[12px] font-medium flex items-center justify-center z-10 rounded-[5px] leading-[18px] gap-1">
          <StarIcon sx={{ fontSize: { xs: "10px", md: "11px" } }} />
          New
        </div>
      );

    case "bestseller":
      return (
        <div className="absolute top-[10px] left-[10px] z-10 flex h-[18px] w-[80px] items-center justify-center gap-1 rounded-[5px] bg-[#FFB30F] text-[10px] font-medium leading-[18px] text-white md:h-[19px] md:w-[80px] md:text-[12px]">
          <WhatshotIcon sx={{ fontSize: { xs: "10px", md: "11px" } }} />
          Hotseller
        </div>
      );

    default:
      return null;
  }
};

type StaticProductCardsProps = {
  heading: string;
  viewAllHref?: string;
};

export default function StaticProductCards({
  heading,
  viewAllHref = "#",
}: StaticProductCardsProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const mobileSliderRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useStaticCart();
  const { toggleItem, isWishlisted } = useStaticWishlist();

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const handleMobileScroll = (direction: "left" | "right") => {
    if (!mobileSliderRef.current) return;

    mobileSliderRef.current.scrollBy({
      left: direction === "left" ? -190 : 190,
      behavior: "smooth",
    });
  };

  const handleAddToCart = (product: StaticProduct) => {
    addToCart(product);
    toast.success("Product added to cart!");
  };

  const handleToggleWishlist = (product: StaticProduct) => {
    const wasWishlisted = isWishlisted(product.id);
    toggleItem(product);
    toast.success(
      wasWishlisted ? "Removed from wishlist" : "Added to wishlist",
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between ">
        <h2 className="font-bold text-[18px] md:text-[32px] tracking-normal capitalize">
          {heading}
        </h2>

        <Link
          href={viewAllHref}
          className="flex items-center gap-1 font-bold text-[13px] tracking-normal text-[#F51721] no-underline"
        >
          View All
          <ChevronRight size={16} className="text-[#F51721]" />
        </Link>
      </div>

      <div className="relative lg:hidden">
        <button
          type="button"
          onClick={() => handleMobileScroll("left")}
          className="hidden lg:flex absolute -left-2 top-1/2 -translate-y-1/2 z-[999] items-center justify-center w-8 h-8 bg-white text-black rounded-full border border-gray-200 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} className="text-[#979797]" />
        </button>

        <button
          type="button"
          onClick={() => handleMobileScroll("right")}
          className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-[999] items-center justify-center w-8 h-8 bg-white text-black rounded-full border border-gray-200 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} className="text-[#979797]" />
        </button>

        <div
          ref={mobileSliderRef}
          className="flex gap-3 overflow-x-auto scroll-smooth no-scrollbar pt-2"
        >
          {staticProducts.map((product) => (
            <div
              key={product.id}
              className="group relative flex w-[160px] sm:w-[190px] h-[390px] sm:h-[460px] shrink-0 flex-col overflow-hidden rounded-[7px]"
            >
              {renderTag(product.tag)}

              <button
                type="button"
                onClick={() => handleToggleWishlist(product)}
                className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md z-20 border border-[#E0E0E0]"
              >
                <Heart
                  className="h-3 w-3"
                  stroke={isWishlisted(product.id) ? "#FD151B" : "#012A61"}
                  fill={isWishlisted(product.id) ? "#FD151B" : "none"}
                />
              </button>

              <Link
                href={`/static-product/${product.slug}`}
                className="flex h-full max-h-[450px] flex-col no-underline text-inherit"
              >
                <div className="relative w-full h-[150px] sm:h-[180px] shrink-0 overflow-hidden rounded-t-[7px] bg-[#F5F5F5]">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                  {/* <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" /> */}
                </div>

                <div className="flex flex-1 flex-col justify-between w-full">
                  <div className="flex flex-col gap-[2px] pt-1 md:pt-2">
                    <h4 className="text-[0.75rem] md:text-[0.875rem] font-bold text-black">
                      {product.brand_name}
                    </h4>

                    <p className="text-[14px] md:text-[14px] leading-[18px] text-[#878787] font-normal line-clamp-2 min-h-[36px]">
                      {limitWords(product.title)}
                    </p>

                    <div className="flex items-center gap-2 h-4 py-3">
                      <span className="text-[16px] md:text-[20px] font-semibold text-[#052B56]">
                        ${product.mainPrice}
                      </span>

                      <span className="text-[10px] line-through text-[#535766]">
                        ${product.wasPrice}
                      </span>

                      <span className="text-[9px] text-[#008F11]">
                        {product.saveAmount}% OFF
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[12px]">
                      <StarRating rating={product.rating} size={13} />
                      <span className="text-[#535766]">
                        ({product.reviewCount})
                      </span>
                    </div>

                    {!product.isOutOfStock && (
                      <div className="text-[11px] text-[#535252]">
                        <p>Delivery Fee - ${product.shippingCharge}</p>
                        <p className="font-medium">
                          Estimated delivery between Thu, 06 Aug - Wed, 12 Aug
                        </p>
                      </div>
                    )}

                    <p className="font-normal text-[11px] leading-[16px] text-[#ff4400]">
                      Extra 10% Off with Code: SHBS10
                    </p>
                  </div>

                  <div className="w-full px-2 flex justify-center mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="w-full h-[30px] bg-[#849324] text-white text-[14px] rounded-[32px] cursor-pointer"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleScroll("left")}
        className="hidden lg:flex @apply !absolute -left-3 top-1/2 -translate-y-1/2 !z-[999] items-center justify-center !w-10 !h-10 bg-white text-black rounded-full border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed translate-x-[-12px] cursor-pointer"
      >
        <ChevronLeft size={18} className="text-black" />
      </button>

      <button
        type="button"
        onClick={() => handleScroll("right")}
        className="hidden lg:flex @apply !absolute !right-0 top-1/2 -translate-y-1/2 translate-x-1/2 !z-[999] items-center justify-center !w-10 !h-10 bg-white text-black rounded-full border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronRight size={18} className="text-black" />
      </button>

      <div
        ref={sliderRef}
        className="hidden lg:flex gap-6 overflow-x-auto scroll-smooth no-scrollbar pt-3"
      >
        {staticProducts.map((product) => {
          return (
            <div
              key={product.id}
              className="group relative w-[220px] sm:w-[240px] md:w-[270px] shrink-0 h-[510px] flex flex-col justify-start overflow-hidden rounded-[7px]"
            >
              {renderTag(product.tag)}

              <button
                type="button"
                onClick={() => handleToggleWishlist(product)}
                className="absolute top-3 right-3 sm:top-[9px] sm:right-3 w-4 h-4 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center shadow-md z-20 border border-[#E0E0E0] cursor-pointer"
              >
                <Heart
                  className="h-[9px] w-[9px] md:h-4 md:w-4"
                  stroke={isWishlisted(product.id) ? "#FD151B" : "#012A61"}
                  fill={isWishlisted(product.id) ? "#FD151B" : "none"}
                />
              </button>

              <Link
                href={`/static-product/${product.slug}`}
                className="flex h-full flex-col no-underline"
              >
                <div className="relative w-full h-[296px] shrink-0 overflow-hidden rounded-[7px] bg-[#F5F5F5]">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                  {/* <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" /> */}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex flex-col gap-[2px] pt-1 md:pt-2">
                    <h4 className="text-[14px] font-bold text-black">
                      {product.brand_name}
                    </h4>

                    <p className="text-[14px]  text-[#878787]">
                      {limitWords(product.title)}
                    </p>

                    <div className="flex items-center gap-2 h-4 py-3">
                      <span className="text-[20px] font-semibold text-[#052B56]">
                        ${product.mainPrice}
                      </span>

                      <span className="text-[12px] line-through text-[#535766]">
                        ${product.wasPrice}
                      </span>

                      <span className="text-[12px] text-[#008F11]">
                        {product.saveAmount}% OFF
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[12px]">
                      <StarRating rating={product.rating} size={13} />
                      <span className="text-[#535766]">
                        ({product.reviewCount})
                      </span>
                    </div>

                    <div className="text-[12px] md:text-[13px] text-[#535252]">
                      <p>
                        FREE delivery Sun, 7 Jun
                        <br />
                        Or fastest delivery Tomorrow, 5 June
                      </p>

                      <p className="font-normal text-[13px] leading-[18px] text-[#ff4400]">
                        Extra 10% Off with Code: SHBS10
                      </p>
                    </div>
                  </div>

                  <div className="w-full px-2  flex justify-center mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="w-full h-[30px] bg-[#849324] text-white text-[14px] rounded-[32px] cursor-pointer"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
