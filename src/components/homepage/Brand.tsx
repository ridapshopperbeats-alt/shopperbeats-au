'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Brand as BrandType } from "@/types/product";

interface BrandProps {
  brands: BrandType[];
}

const Brand = ({ brands }: BrandProps) => {

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
