"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const brands = [
  {
    id: 1,
    title: "Allen Solly",
    subtitle: "Under $100",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  },
  {
    id: 2,
    title: "Hivvago",
    subtitle: "Under $80",
    image:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80",
  },
  {
    id: 3,
    title: "FASHNZFAB",
    subtitle: "Under $60",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
  },
  {
    id: 4,
    title: "TRUEDAMES",
    subtitle: "Under $90",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
  },
  {
    id: 5,
    title: "BreeBe",
    subtitle: "Under $50",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  },
  {
    id: 6,
    title: "Zara",
    subtitle: "Under $150",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: 7,
    title: "Levis",
    subtitle: "Under $120",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
  },
  {
    id: 8,
    title: "Nike",
    subtitle: "Under $180",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: 9,
    title: "Puma",
    subtitle: "Under $140",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
  },
  {
    id: 10,
    title: "Adidas",
    subtitle: "Under $170",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
  },
];

export default function TopBrands() {
  const sliderRef = useRef<HTMLDivElement>(null);

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

        <button className="flex items-center gap-1 text-[#FD151B] text-sm font-semibold">
          See All Brands
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-2 gap-4 lg:hidden pt-3">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="relative h-[120px] w-[180px] rounded-[8px] overflow-hidden group"
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

      {/* Desktop */}
      <div className="relative hidden lg:block pt-5">
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
                className="object-cover "
              />

              <div className="absolute inset-0 bg-linear-to-b from-[#050B1E]/0 to-[#050B1E]/80" />

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
          className="hidden lg:flex absolute left-[-20] top-1/2 -translate-y-2/4 z-20 w-9 h-9 rounded-full bg-white border border-gray-200  items-center justify-center cursor-pointer"
        >
          <ChevronLeft size={18} className="text-[#979797]" />
        </button>

        <button
          onClick={nextSlide}
          className="hidden lg:flex absolute right-[-20] top-1/2 -translate-y-2/4 z-20 w-9 h-9 rounded-full bg-white border border-gray-200  items-center justify-center cursor-pointer"
        >
          <ChevronRight size={18} className="text-[#979797]" />
        </button>
      </div>
    </section>
  );
}
