

"use client";

import React from "react";
import ReusableSlider from "../ui/ReusableSlider";
import { Brand } from "@/types/product";
import Link from "next/link";
import Image from "next/image";



const BrandBlock: React.FC<Brand> = ({ image_url, logo_url, name, slug }) => {
  const defaultBgImage = "/images/image-coming-soon.jpg";
  const defaultLogo = "/images/image-coming-soon.jpg";

  return (
    < Link href={`/brand/${slug}`}>
      <div className="brand-block">
        <div className="brands-bg">
          <Image
            src={image_url || defaultBgImage}
            alt={`${name} Background`}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="brand-logo">
          <Image
            src={logo_url || defaultLogo}
            alt={`${name} Logo`}
            width={70}
            height={48}
            style={{ width: '100%', height: 'auto', maxWidth: '70px', objectFit: 'contain' }}
          />
        </div>
      </div>
    </Link>
  );
};

export default function ShopByBrands({ brands }: { brands: Brand[] }) {
  return (
    <div className="brands mb-70">
      <div className="container">
        <div className="dflex justify-between mb-30 title-wrapper">
          <h3>Shop By Brands</h3>
          <Link href="/brand" className="btn btn-white">
            See All
          </Link>
        </div>

        <ReusableSlider
          items={brands}
          slidesToShow={5}
          gap={20}
          slidesToScroll={1}
          infinite={false}
          arrows={true}
          speed={800}
          pauseOnHover={true}
          autoResponsive
          slideClassName="product-carousel-slide"
          renderItem={(brand, index) => (
            <BrandBlock
              key={brand.id || index}
              id={brand.id}
              slug={brand.slug}
              name={brand.name}
              image_url={brand.image_url}
              logo_url={brand.logo_url}
            />
          )}
        />
      </div>
    </div>
  );
}
