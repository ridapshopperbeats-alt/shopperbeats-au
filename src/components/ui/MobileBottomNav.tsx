"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Home, Heart, ShoppingCart, User } from "lucide-react";
import { useGetWishlistQuery, useGetCartQuery } from "@/lib/redux/apis/cart-api";
import { useGlobalPostcode } from "@/lib/hooks/use-global-postcode";
import { RootState } from "@/lib/redux/store";
import { CartItem } from "@/types/cart";
import MobileAccountSheet from "./MobileAccountSheet";

const ACTIVE_COLOR = "#FD151B";
const INACTIVE_COLOR = "#001325A3";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { postcode } = useGlobalPostcode();
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);

  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });
  const wishlistCount = wishlistData?.items?.length ?? 0;

  const { data: cartData } = useGetCartQuery(
    postcode ? { postcode } : undefined,
    { refetchOnMountOrArgChange: true },
  );
  const cartItems: CartItem[] = (cartData?.items ?? []).filter(
    (item) =>
      item.is_active && (item.available_stock === undefined || item.available_stock > 0),
  );
  const cartCount = cartItems.length;

  const isHomeActive = pathname === "/";
  const isWishlistActive =
    pathname === "/user/wishlist" || !!pathname?.startsWith("/user/wishlist/");
  const isCartActive = pathname === "/cart" || !!pathname?.startsWith("/cart/");
  const isAccountActive =
    !!pathname && pathname.startsWith("/user") && !pathname.startsWith("/user/wishlist");

  const navItems = [
    {
      key: "home",
      label: "Home",
      href: "/",
      icon: Home,
      isActive: isHomeActive,
      count: 0,
    },
    {
      key: "wishlist",
      label: "Wishlist",
      href: "/user/wishlist",
      icon: Heart,
      isActive: isWishlistActive,
      count: wishlistCount,
    },
    {
      key: "cart",
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      isActive: isCartActive,
      count: cartCount,
    },
    {
      key: "account",
      label: "Account",
      href: isAuthenticated
        ? "/user/personal-information"
        : `/login?redirect=${encodeURIComponent("/user/personal-information")}`,
      icon: User,
      isActive: isAccountActive,
      count: 0,
    },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-[50px] flex items-stretch bg-white border-t border-[#EAEAEA] shadow-[0px_0px_16.1px_0px_#8E8E8E40] w-auto ">
        {navItems.map((item) => {
          const Icon = item.icon;
          const color = item.isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
          const borderClass = item.isActive
            ? "border-t-2 border-[#FD151B]"
            : "border-t-2 border-transparent";

          const content = (
            <>
              <span className="relative inline-flex">
                <Icon size={16} color={color} />

                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[14px] h-[14px] px-[3px] rounded-full bg-[#FD151B] text-white text-[9px] leading-none">
                    {item.count}
                  </span>
                )}
              </span>

              <span
                className={`leading-[100%] tracking-[0%] font-medium text-[10px] ${
                  item.isActive ? "text-[#FD151B]" : "text-[#001325]/64"
                }`}
              >
                {item.label}
              </span>
            </>
          );

          if (item.key === "account" && isAuthenticated) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setIsAccountSheetOpen(true)}
                className="relative flex-1 flex justify-center cursor-pointer [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none active:bg-transparent hover:bg-transparent"
              >
                <span className={`w-12 flex flex-col items-center gap-1 pt-1.5 ${borderClass}`}>
                  {content}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className="relative flex-1 flex justify-center [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none active:bg-transparent hover:bg-transparent"
            >
              <span className={`w-12 flex flex-col items-center gap-1 pt-1.5 ${borderClass}`}>
                {content}
              </span>
            </Link>
          );
        })}
      </nav>

      <MobileAccountSheet
        isOpen={isAccountSheetOpen}
        onClose={() => setIsAccountSheetOpen(false)}
      />
    </>
  );
}
