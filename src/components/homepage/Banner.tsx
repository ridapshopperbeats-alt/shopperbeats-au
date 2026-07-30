"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const banners = [
  { id: 1, image: "/images/HomeBanner0.svg" },
  { id: 2, image: "/images/HomeBanner1.svg" },
  { id: 3, image: "/images/HomeBanner2.svg" },
  { id: 4, image: "/images/HomeBanner3.svg" },
  { id: 5, image: "/images/HomeBanner4.svg" },
  { id: 6, image: "/images/HomeBanner5.svg" },
];

function getSlideOffset(index: number, currentBanner: number, total: number) {
  let diff = index - currentBanner;
  const half = total / 2;

  if (diff > half) diff -= total;
  else if (diff < -half) diff += total;

  return diff;
}

export default function SingleBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);

  const prevBannerRef = useRef(0);

  useEffect(() => {
    prevBannerRef.current = currentBanner;
  }, [currentBanner]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    if (index === currentBanner) return;

    prevBannerRef.current = currentBanner;
    setCurrentBanner(index);
  };

  return (
    <div className="container lg:pt-3">
      {/* Banner */}
      <div className="relative hidden lg:flex w-full aspect-1694/540 overflow-hidden rounded-lg">
        {banners.map((banner, index) => {
          const isTransitioning =
            index === currentBanner || index === prevBannerRef.current;

          return (
            <Link href="/static-category" key={banner.id|| index}>
              <Image
                key={banner.id}
                src={banner.image}
                alt={`Banner ${index + 1}`}
                fill
                priority={index === 0}
                loading={index === 0 ? undefined : "eager"}
                quality={100}
                sizes="100vw"
                className={`absolute inset-0 object-cover ease-in-out cursor-pointer ${
                  isTransitioning ? "transition-transform duration-1500" : ""
                } ${index === currentBanner ? "" : "pointer-events-none"}`}
                style={{
                  transform: `translateX(calc(${getSlideOffset(index, currentBanner, banners.length) * 100}% + ${
                    getSlideOffset(index, currentBanner, banners.length) * 24
                  }px))`,
                }}
              />
            </Link>
          );
        })}
      </div>

      {/* Dots */}
      <div className="hidden lg:flex justify-center items-center gap-2 mt-5">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleDotClick(index)}
            aria-label={`Go to banner ${index + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              currentBanner === index ? "bg-[#FD151B]" : "bg-[#D9D9D9]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
