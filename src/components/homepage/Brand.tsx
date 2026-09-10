'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Brand as BrandType } from "@/types/product";
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

const Brand = () => {
  const [brands, setBrands] = useState<BrandType[]>([]);

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

        const mappedBrands: BrandType[] = items.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          logo_url: item.image ? applyImageVariant(item.image, "public") : null,
          image_url: null,
        }));

        setBrands(mappedBrands);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <div className="pb-40">
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg sm:text-xl font-semibold !pb-4">
            Shop By Brand
          </h3>

          <Link
            href="/brand"
            className="btn btn-white w-[100px] py-2 text-center !mb-4"
          >
            See All
          </Link>
        </div>


        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {brands.map((brand, index) => {
            const imageUrl =
              brand.logo_url || brand.image_url || "/images/home/Group1.png";

            return (
              <Link
                key={brand.id || index}
                href={`/brand/${brand.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[158px] h-[160px] flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <div className="relative w-[150px] h-[100px]">
                  <Image
                    src={imageUrl}
                    alt={brand.name || "brand"}
                    fill
                    sizes="150px"
                    className="object-contain"
                    unoptimized={!imageUrl.startsWith("/")}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Brand;
