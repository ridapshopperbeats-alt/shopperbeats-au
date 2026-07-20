import React from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

// Types
interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  image_url: string | null;
  is_active: boolean;
  total_products: number;
  active_products: number;
  inactive_products: number;
  slug: string;
}

interface BrandsResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: Brand[];
}

interface BrandsByLetter {
  [key: string]: Brand[];
}

// Alphabet letters
const alphabet = [
  "#",
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
];

async function fetchBrands() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_PRODUCTS;
    // console.log("API PRODUCT", apiUrl);

    const response = await fetch(
      `${apiUrl}/api/v1/brand/list-brands?page=1&limit=1000`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) {
      console.warn("Failed to fetch brands, status:", response.status);
      return [];
    }
    const data: BrandsResponse = await response.json();
    // console.log("Product Data", data);

    return data.data || [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

async function fetchFeaturedBrands() {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL_PRODUCTS}`;

    const response = await fetch(`${apiUrl}/api/v1/featured-brand/`, {
      next: { revalidate: 60 },
    });
    // console.log("featured", apiUrl);

    if (!response.ok) {
      console.warn("Failed to fetch featured brands, status:", response.status);
      return [];
    }

    const data = await response.json();
    console.log("featured brand", data);

    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching featured brands:", error);
    return [];
  }
}

const limitWords = (text: any, maxWords = 2) => {
  if (!text) return "";
  const words = text.split(" ");
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }
  return text;
};

export default async function BrandsSection() {
  const [allBrands, featuredBrands] = await Promise.all([
    fetchBrands(),
    fetchFeaturedBrands(),
  ]);
  // Group brands by first letter
  const brandsByLetter = allBrands.reduce((acc, brand) => {
    const firstLetter = brand.name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstLetter) ? firstLetter : "#";

    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {} as BrandsByLetter);
  return (
    <div className="container">
      {/* ======== Brands Grid Section ======== */}
      <h4 className="text-[24px] font-bold pt-3">Featured Brands</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        {featuredBrands
          .map((featuredBrand: { brand_id: string }) => {
            const brand = allBrands.find(
              (b: Brand) => b.id === featuredBrand.brand_id,
            );

            return brand;
          })
          .filter((brand: Brand | undefined) => brand && brand.logo_url)
          .map((brand: Brand) => {
            return (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="
              group
              relative
              overflow-hidden
              h-[150px]
              rounded-[28px]
              bg-white
              border border-[#ececec]
              flex items-center justify-center
              p-6
              transition-all duration-500
              hover:-translate-y-1
              hover:shadow-[0_10px_30px_rgba(1,41,97,0.08)]
              hover:border-[#01296120]
            "
              >
                {/* Background Glow */}
                <div
                  className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                transition duration-500
                bg-gradient-to-br from-[#01296108] via-transparent to-[#ff000008]
              "
                />

                {/* Logo */}
                <div className="relative z-10 flex items-center justify-center">
                  <Image
                    src={brand.logo_url!}
                    alt={brand.name}
                    width={140}
                    height={80}
                    loading="lazy"
                    className="
                  max-h-[70px]
                  w-auto
                  object-contain
                  transition duration-500
                  group-hover:scale-105
                "
                  />
                </div>

                {/* Bottom Brand Name */}
                <div
                  className="
                absolute bottom-3 left-0 right-0
                text-center
                opacity-0
                translate-y-2
                group-hover:opacity-100
                group-hover:translate-y-0
                transition-all duration-300
              "
                >
                  <span className="text-[13px] font-semibold text-[#012961]">
                    {brand.name}
                  </span>
                </div>
              </Link>
            );
          })}
      </div>

      {/* ======== Alphabetic Brands List Section ======== */}
      <div className="">
        <h1 className="pb-[30px] text-center text-[24px] font-extrabold text-black">
          ALL Brands
        </h1>

        {/* Alphabet Navigation */}
        <ul className="mb-10 flex flex-wrap justify-center gap-y-2 rounded-lg bg-[#f5f5f5] p-3.5">
          {alphabet.map((letter) => (
            <li key={letter} className="flex-1 text-center sm:flex-1">
              <a
                className="text-[16px] font-semibold text-black"
                href={`#brands-${letter}`}
                data-discover={letter !== "#" ? "true" : undefined}
              >
                {letter}
              </a>
            </li>
          ))}
        </ul>

        {/* Brands under each letter */}
        {alphabet.map((letter) => {
          const brands = brandsByLetter[letter] || [];
          if (!brands.length) return null;

          return (
            <div
              key={letter}
              className="mb-10 scroll-mt-[150px]"
              id={`brands-${letter}`}
            >
              <h5 className="mb-5 text-[20px] font-bold text-[#012961]">
                {letter}
              </h5>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
                {brands.map((brand) => {
                  // 1. Pehle pure name ka first letter Capitalize aur baaki small kiya
                  const formattedName =
                    brand.name.charAt(0).toUpperCase() +
                    brand.name.slice(1).toLowerCase();

                  return (
                    <Link
                      href={`/brand/${brand.slug}`}
                      key={brand.id}
                      className="block h-full"
                    >
                      <li className="flex h-full min-h-[52px] items-center justify-center border border-[#d9d9d9] rounded-[8px] px-3 py-2 text-center text-[15px] font-medium capitalize text-black transition-colors hover:border-[#012961] hover:bg-[#012961] hover:text-white">
                        {/* 2. Ab us formatted name par word limit (Max 2 words) apply kar di */}
                        {limitWords(formattedName, 2)}
                      </li>
                    </Link>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <ScrollToTopButton />
    </div>
  );
}
