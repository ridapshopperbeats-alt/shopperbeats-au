"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const banners = [
  { id: 1, image: "/images/HomeBanner.svg" },
  { id: 2, image: "/images/HomeBanner.svg" },
  { id: 3, image: "/images/HomeBanner.svg" },
  { id: 4, image: "/images/HomeBanner.svg" },
  { id: 5, image: "/images/HomeBanner.svg" },
];

export default function SingleBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <div className="relative">
        <Image
          src={banners[currentBanner].image}
          alt={`Banner ${currentBanner + 1}`}
          width={1694}
          height={540}
          priority
          className="w-full h-auto object-cover rounded-lg transition-all duration-500"
        />
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-2 mt-5 ">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`transition-all duration-300 cursor-pointer rounded-full ${
              currentBanner === index
                ? "w-3 h-3 bg-[#FD151B]"
                : "w-3 h-3 bg-[#D9D9D9]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}