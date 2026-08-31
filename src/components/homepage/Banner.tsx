"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { applyImageVariant } from "@/lib/utils/imageUtils";

interface HeroBannerContent {
  image: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
}

interface HeroBannerItem {
  content: HeroBannerContent[];
}

interface BannerSlide {
  id: number;
  image: string;
}

// const FALLBACK_BANNERS: BannerSlide[] = [
//   { id: 1, image: "/images/HomeBanner0.svg" },
//   { id: 2, image: "/images/HomeBanner1.svg" },
//   { id: 3, image: "/images/HomeBanner2.svg" },
//   { id: 4, image: "/images/HomeBanner3.svg" },
//   { id: 5, image: "/images/HomeBanner4.svg" },
//   { id: 6, image: "/images/HomeBanner5.svg" },
// ];

function getSlideOffset(index: number, currentBanner: number, total: number) {
  let diff = index - currentBanner;
  const half = total / 2;

  if (diff > half) diff -= total;
  else if (diff < -half) diff += total;

  return diff;
}

export default function SingleBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const prevBannerRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    async function loadHeroBanner() {
      try {
        const url = `${API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(
          API_ENDPOINTS.PRODUCTS.HERO_BANNER,
        )}`;

        const res = await fetch(url);

        if (!res.ok) return;

        const data: { config?: { items?: HeroBannerItem[] } } = await res.json();

        const items = Array.isArray(data?.config?.items) ? data.config.items : [];

        const mappedBanners = items
          .map((item, index) => ({
            id: index + 1,
            image: applyImageVariant(item.content?.[0]?.image ?? "", "public"),
          }))
          .filter((banner) => banner.image);

        if (!isMounted || mappedBanners.length === 0) return;

        setBanners(mappedBanners);
        setCurrentBanner(0);
      } catch (error) {
        console.error("Error fetching hero banner:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHeroBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    prevBannerRef.current = currentBanner;
  }, [currentBanner]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 10000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleDotClick = (index: number) => {
    if (index === currentBanner) return;

    prevBannerRef.current = currentBanner;
    setCurrentBanner(index);
  };

  return (
    <div className="container lg:pt-3">
      {/* Banner */}
      <div className="relative hidden lg:flex w-full aspect-1694/540 overflow-hidden rounded-lg">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        {!isLoading && banners.map((banner, index) => {
          const isTransitioning =
            index === currentBanner || index === prevBannerRef.current;

          return (
            <Image
              key={banner.id || index}
              src={banner.image}
              alt={`Banner ${index + 1}`}
              fill
              // priority={index === 0}
              loading={index === 0 ? undefined : "eager"}
              quality={100}
              // sizes="100vw"
              className={`absolute inset-0 object-cover ease-in-out ${
                isTransitioning ? "transition-transform duration-1500" : ""
              } ${index === currentBanner ? "" : "pointer-events-none"}`}
              style={{
                transform: `translateX(calc(${getSlideOffset(index, currentBanner, banners.length) * 100}% + ${
                  getSlideOffset(index, currentBanner, banners.length) * 24
                }px))`,
              }}
            />
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
