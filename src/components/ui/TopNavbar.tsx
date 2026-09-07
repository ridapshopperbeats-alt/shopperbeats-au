"use client";

import Link from "next/link";
import {
  Leaf,
  Armchair,
  HandbagIcon,
  HeartPulse,
  Gem,
  Sparkles,
} from "lucide-react";

interface TopNavbarProps {
  activeTopCategorySlug: string;
  isFashionAccessoriesActive: boolean;
  pathname: string;
}

const TopNavbar = ({
  activeTopCategorySlug,
  isFashionAccessoriesActive,
  pathname,
}: TopNavbarProps) => {
  return (
    <nav className="navbar" id="menu">
      <ul className="menu">
        <li>
          <Link
            className={`link flex items-center xl:gap-2 hover:text-red-500 ${
              activeTopCategorySlug === "home-garden" ? "active" : ""
            }`}
            href="/category/home-garden"
          >
            <Leaf
              size={16}
              className="inline-block text-center icons-size"
            />
            Home & Garden
          </Link>
        </li>

        <li>
          <Link
            className={`link flex items-center xl:gap-2 hover:text-red-500 ${
              activeTopCategorySlug === "furniture" ? "active" : ""
            }`}
            href="/category/furniture"
          >
            <Armchair size={16} className="inline-block icons-size" />
            Furniture
          </Link>
        </li>

        <li>
          <Link
            className={`link flex items-center xl:gap-2 hover:text-red-500 ${
              isFashionAccessoriesActive ? "active" : ""
            }`}
            href="/category/fashion-accessories"
          >
            <HandbagIcon
              size={16}
              className="inline-block icons-size"
            />
            Fashion & Accessories
          </Link>
        </li>

        <li>
          <Link
            className={`link flex items-center xl:gap-2 hover:text-red-500 ${
              pathname === "/category/health-beauty" ||
              pathname?.startsWith("/category/health-beauty/")
                ? "active"
                : ""
            }`}
            href="/category/health-beauty"
          >
            <HeartPulse
              size={16}
              className="inline-block icons-size"
            />
            Health & Beauty
          </Link>
        </li>

        <li>
          <Link
            className={`link flex items-center xl:gap-2 hover:text-red-500 ${
              pathname === "/category/outdoor-patio" ||
              pathname?.startsWith("/category/outdoor-patio/")
                ? "active"
                : ""
            }`}
            href="/category/outdoor-patio"
          >
            <Armchair size={16} className="inline-block icons-size" />
            Outdoor & Patio
          </Link>
        </li>

        <li>
          <Link
            className={`link flex items-center xl:gap-2 hover:text-red-500 ${
              pathname === "/product-listing/best-sellers"
                ? "active"
                : ""
            }`}
            href="/product-listing/best-sellers"
          >
            <Gem size={16} className="inline-block icons-size" />
            Best Sellers
          </Link>
        </li>

        <li>
          <Link
            className={`link flex items-center xl:gap-2 hover:text-red-500 ${
              pathname === "/product-listing/whats-on-sale"
                ? "active"
                : ""
            }`}
            href="/product-listing/whats-on-sale"
          >
            <Sparkles
              size={16}
              className="inline-block icons-size"
            />
            What&apos;s On Sale
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default TopNavbar;