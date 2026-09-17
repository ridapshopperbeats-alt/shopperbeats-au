"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { applyImageVariant } from "@/lib/utils/imageUtils";

interface BrandApiItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  cta_link?: string;
  cta_text?: string;
  subtitle?: string;
}

interface BrandCard {
  id: string | number;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

const FALLBACK_IMAGE = "/images/home/brand-card.svg";

// const FALLBACK_BRANDS: BrandCard[] = [
//   {
//     id: 1,
//     title: "Allen Solly",
//     subtitle: "Under $100",
//     image: "/images/home/brand-card.svg",
//     href: "/brand",
//   },
//   {
//     id: 2,
//     title: "Hivvago",
//     subtitle: "Under $80",
//     image: "/images/home/brand-card2.svg",
//     href: "/brand",
//   },
//   {
//     id: 3,
//     title: "FASHNZFAB",
//     subtitle: "Under $60",
//     image: "/images/home/brand-card3.svg",
//     href: "/brand",
//   },
//   {
//     id: 4,
//     title: "TRUEDAMES",
//     subtitle: "Under $90",
//     image: "/images/home/brand-card4.svg",
//     href: "/brand",
//   },
//   {
//     id: 5,
//     title: "BreeBe",
//     subtitle: "Under $50",
//     image: "/images/home/brand-card5.svg",
//     href: "/brand",
//   },
//   {
//     id: 6,
//     title: "Zara",
//     subtitle: "Under $150",
//     image: "/images/home/brand-card6.svg",
//     href: "/brand",
//   },
//   {
//     id: 7,
//     title: "Levis",
//     subtitle: "Under $120",
//     image: "/images/home/brand-card.svg",
//     href: "/brand",
//   },
//   {
//     id: 8,
//     title: "Nike",
//     subtitle: "Under $180",
//     image: "/images/home/brand-card2.svg",
//     href: "/brand",
//   },
//   {
//     id: 9,
//     title: "Puma",
//     subtitle: "Under $140",
//     image: "/images/home/brand-card3.svg",
//     href: "/brand",
//   },
//   {
//     id: 10,
//     title: "Adidas",
//     subtitle: "Under $170",
//     image: "/images/home/brand-card4.svg",
//     href: "/brand",
//   },
// ];

export default function TopBrands() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [brands, setBrands] = useState<BrandCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBrands() {
      try {
        const url = `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(
          API_ENDPOINTS.PRODUCTS.BRANDS,
        )}`;

        const res = await fetch(url);

        if (!res.ok) return;

        const data: { config?: { items?: BrandApiItem[] } } = await res.json();

        const items = Array.isArray(data?.config?.items) ? data.config.items : [];

        if (!isMounted || items.length === 0) return;

        const mappedBrands: BrandCard[] = items.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: item.subtitle || "",
          image: item.image ? applyImageVariant(item.image, "public") : FALLBACK_IMAGE,
          href: item.cta_link || `/brand/${item.slug}`,
        }));

        setBrands(mappedBrands);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  const mobileBrands = showAll ? brands : brands.slice(0, 2);

  const nextSlide = () => {
    sliderRef.current?.scrollBy({
      left: 295,
      behavior: "smooth",
    });
  };

  const prevSlide = () => {
    sliderRef.current?.scrollBy({
      left: -295,
      behavior: "smooth",
    });
  };

  return (
    <section className="container flex flex-col lg:gap-4.5">
      {/* Heading */}
      <div className="flex items-center justify-between md:pt-2">
        <h2 className="font-montserrat fluid-text-18-32 font-bold leading-[normal] capitalize text-black self-center">
          Top Brands
        </h2>

        <Link
          href="/brand"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 fluid-text-sm tracking-normal text-[#FD151B] font-bold no-underline self-center"
        >
          See All Brands
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:hidden pt-3 lg:pt-2">
        {isLoading &&
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`mobile-brand-skeleton-${index}`}
              className="relative h-[120px] w-full rounded-[8px] bg-gray-200 animate-pulse"
            />
          ))}

        {!isLoading && mobileBrands.map((brand) => (
          <Link
            key={brand.id}
            href={brand.href}
            className="relative h-[120px] w-full rounded-[8px] overflow-hidden group block"
          >
            <Image
              src={brand.image}
              alt={brand.title}
              fill
              sizes="100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,30,0.1)_0%,rgba(5,11,30,0.65)_100%)]" />

            <div className="absolute left-4 bottom-3 w-[226px] flex flex-col ">
              <h3 className="text-white fluid-text-13-14 font-bold">
                {brand.title}
              </h3>

              <p className="text-white fluid-text-2xs font-medium">
                {brand.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile-only toggle to reveal the remaining brands */}
      {!showAll && (
        <div className="relative flex justify-center -translate-y-4 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            aria-label="Show more categories"
            className="relative z-50 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center cursor-pointer"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* Desktop */}
      <div className="relative hidden lg:block lg:mb-4">
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`desktop-brand-skeleton-${index}`}
                className="relative shrink-0 w-[275px] h-[360px] rounded-[12px] bg-gray-200 animate-pulse"
              />
            ))}

          {!isLoading && brands.map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              className="relative shrink-0 w-[275px] h-[360px] rounded-[12px] overflow-hidden group cursor-pointer block"
            >
              <Image
                src={brand.image}
                alt={brand.title}
                fill
                sizes="275px"
                className="object-cover group-hover:scale-[1.5] transition-transform duration-600 ease-in-out"
              />

              <div className="banner-gradient-overlay" />   

              <div className="absolute p-6 w-[226px] flex flex-col ">
                <h3 className="text-white fluid-text-13-18 font-bold">
                  {brand.title}
                </h3>

                <p className="text-white text-[10px] md:text-[12px] font-medium">
                  {brand.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="hidden lg:flex @apply !absolute -left-2 top-1/2 -translate-y-1/2 !z-[999] items-center justify-center w-9 h-9 bg-white text-black rounded-full border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed translate-x-[-12px] cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={nextSlide}
          className="hidden lg:flex @apply !absolute !right-0 top-1/2 -translate-y-1/2 translate-x-1/2 !z-[999] items-center justify-center w-9 h-9 bg-white text-black rounded-full border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
