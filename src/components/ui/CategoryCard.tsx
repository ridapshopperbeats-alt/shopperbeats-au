"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CategoryCardProps {
  image: string;
  title: string;
  onClick?: () => void;
  linkHref?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  image,
  title,
  onClick,
  linkHref,
}) => {
  return (
    <Link href={linkHref || "#"}>
      <div
        className="item h-full w-full"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="w-full max-w-[260px] h-[263px] rounded-[14px] border border-gray-200 bg-[#f5f5f5] overflow-hidden mx-auto  transition-all duration-300">
          <div className="w-full h-[220px] overflow-hidden bg-white">
            <Image
              src={image}
              alt={title}
              width={259}
              height={150}
              loading="lazy"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-full h-[41px] flex justify-center items-center bg-white border-t border-[#e7e7e7]">
            <p className="text-[16px] font-semibold text-center text-black items-center w-full max-w-[250px]">
              {title}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
