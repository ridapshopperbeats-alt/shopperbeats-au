"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Percent,
  Sparkles,
  Home,
  Armchair,
  HeartPulse,
  Gamepad2,
  Baby,
} from "lucide-react";

export default function CategoryNavbar() {
  const pathname = usePathname();

  return (
    <nav className={`navbar `} id="menu">
      <ul className="menu">
        <li>
          <Link
            className={`link flex items-center gap-2 ${pathname === "/product-listing/whats-on-sale" ? "active" : ""}`}
            href="/product-listing/whats-on-sale"
          >
            <Percent size={16} className="inline-block " />
            What&apos;s On Sale
          </Link>
        </li>
        <li>
          <Link
            className={`link flex items-center gap-2 ${pathname === "/product-listing/clearance" ? "active" : ""}`}
            href="/product-listing/clearance"
          >
            <Sparkles size={16} className="inline-block " />
            Clearance
          </Link>
        </li>
        <li>
          <Link
            className={`link flex items-center gap-2 ${pathname === "/category/home-garden" ? "active" : ""}`}
            href="/category/home-garden"
          >
            <Home size={16} className="inline-block " />
            Home & Garden
          </Link>
        </li>
        <li>
          <Link
            className={`link flex items-center gap-2 ${pathname === "/category/furniture" ? "active" : ""}`}
            href="/category/furniture"
          >
            <Armchair size={16} className="inline-block " />
            Furniture
          </Link>
        </li>
        <li>
          <Link
            className={`link flex items-center gap-2 ${pathname === "/category/health-beauty" ? "active" : ""}`}
            href="/category/health-beauty"
          >
            <HeartPulse size={16} className="inline-block " />
            Health & Beauty
          </Link>
        </li>
        <li>
          <Link
            className={`link flex items-center gap-2 ${pathname === "/category/toys-games" ? "active" : ""}`}
            href="/category/toys-games"
          >
            <Gamepad2 size={16} className="inline-block " />
            Toys & Games
          </Link>
        </li>
        <li>
          <Link
            className={`link flex items-center gap-2 ${pathname === "/category/baby-kids" ? "active" : ""}`}
            href="/category/baby-kids"
          >
            <Baby size={16} className="inline-block " />
            Baby & Kids
          </Link>
        </li>
      </ul>
    </nav>
  );
}
