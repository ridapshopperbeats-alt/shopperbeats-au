"use client";

import React from "react";
import ReusableSlider from "../ui/ReusableSlider";

import Image from "next/image";
import Link from "next/link";

interface Deal {
  image: string;
  title: string;
  href?: string;
}

const DealBlock: React.FC<Deal> = ({ image, title, href }) => {
  const content = (
    <div className="deals-block my-10">
      <div className="deals-img bg-white">
        <Image src={image} alt={title} width={120} height={120} />
      </div>
      <h5 className="align-center mt-18 !text-black">{title}</h5>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }
  return content;
};

export default function TopDeals() {
  const deals: Deal[] = [
    { image: "/images/home/todays-deals.png", title: "Today Deals", href: "/product-listing/today-s-deal" },
    { image: "/images/home/coupons.png", title: "Coupons", href: "/product-listing/coupons" },
    { image: "/images/home/top-seller.png", title: "Top Sellers", href: "/product-listing/best-sellers" },
    { image: "/images/home/price-drop.png", title: "Price Drop", href: "/product-listing/price-drop" },
    { image: "/images/home/free-shipping.png", title: "Free Shipping", href: "/product-listing/free-shipping" }, // Routed via list-products with free-shipping filter as a page param
    { image: "/images/home/top-rated.png", title: "Top Rated", href: "/product-listing/top-rated" },
  ];


  return (
    <div className="top-deals">
      <div className="container">
        <ReusableSlider
          items={deals}
          slidesToShow={6}
          slidesToScroll={4}
          centered={false}
          speed={800}
          infinite={false}
          autoplaySpeed={0}
          arrows={true}
          gap={20}
          autoResponsive
          slideClassName="product-carousel-slide"
          renderItem={(deal) => <DealBlock key={deal.title} {...deal} />}
        />
      </div>
    </div>
  );
}
