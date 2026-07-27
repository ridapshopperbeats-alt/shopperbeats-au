"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const brands = [
  {
    id: 1,
    title: "Allen Solly",
    subtitle: "Under $100",
    image: "/images/home/brand-card.svg",
  },
  {
    id: 2,
    title: "Hivvago",
    subtitle: "Under $80",
    image: "/images/home/brand-card2.svg",
  },
  {
    id: 3,
    title: "FASHNZFAB",
    subtitle: "Under $60",
    image: "/images/home/brand-card3.svg",
  },
  {
    id: 4,
    title: "TRUEDAMES",
    subtitle: "Under $90",
    image: "/images/home/brand-card4.svg",
  },
  {
    id: 5,
    title: "BreeBe",
    subtitle: "Under $50",
    image: "/images/home/brand-card5.svg",
  },
  {
    id: 6,
    title: "Zara",
    subtitle: "Under $150",
    image: "/images/home/brand-card6.svg",
  },
  {
    id: 7,
    title: "Levis",
    subtitle: "Under $120",
    image: "/images/home/brand-card.svg",
  },
  {
    id: 8,
    title: "Nike",
    subtitle: "Under $180",
    image: "/images/home/brand-card2.svg",
  },
  {
    id: 9,
    title: "Puma",
    subtitle: "Under $140",
    image: "/images/home/brand-card3.svg",
  },
  {
    id: 10,
    title: "Adidas",
    subtitle: "Under $170",
    image: "/images/home/brand-card4.svg",
  },
];

export default function TopBrands() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
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
    <section className="container ">
      {/* Heading */}
      <div className="flex items-center justify-between ">
        <h2 className="text-[18px] md:text-[32px]  font-extrabold text-[#1E1E1E]">
          Top Brands
        </h2>

        <Link
          href="/brand"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[13px] text-[#FD151B]  font-bold"
        >
          See All Brands
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:hidden pt-2">
        {mobileBrands.map((brand) => (
          <div
            key={brand.id}
            className="relative h-[120px] w-full rounded-[8px] overflow-hidden group"
          >
            <Image
              src={brand.image}
              alt={brand.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,30,0.1)_0%,rgba(5,11,30,0.65)_100%)]" />

            <div className="absolute left-4 bottom-3 w-[226px] flex flex-col ">
              <h3 className="text-white text-[13px] font-bold">
                {brand.title}
              </h3>

              <p className="text-white text-[10px] font-medium">
                {brand.subtitle}
              </p>
            </div>
          </div>
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
      <div className="relative hidden lg:block pt-4">
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="relative shrink-0 w-[275px] h-[360px] rounded-[12px] overflow-hidden group cursor-pointer"
            >
              <Image
                src={brand.image}
                alt={brand.title}
                fill
                className="object-cover group-hover:scale-[1.5] transition-transform duration-600 ease-in-out"
              />

              <div className="banner-gradient-overlay" />

              <div className="absolute p-6 w-[226px] flex flex-col ">
                <h3 className="text-white text-[24px] font-extrabold">
                  {brand.title}
                </h3>

                <p className="text-white text-[14px] font-semibold">
                  {brand.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="hidden lg:flex absolute left-[-20] top-1/2 -translate-y-2/4 z-20 w-[30px] h-[30px] rounded-full bg-white border border-gray-200  items-center justify-center cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={nextSlide}
          className="hidden lg:flex absolute right-[-20] top-1/2 -translate-y-2/4 z-20 w-[30px] h-[30px] rounded-full bg-white border border-gray-200  items-center justify-center cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
