"use client";
import React, { Suspense } from "react";
import Banner from "@/components/common/Banner";
import Sidebar from "@/components/common/Sidebar";
import { usePathname } from "next/navigation";
import "../../../styles/account.css";
import Image from "next/image";
import { sidebarLinks } from "@/lib/utils/main-utils";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPersonalInformation = pathname === "/user/personal-information";
  const usesCardLayout =
    isPersonalInformation ||
    pathname === "/user/logout" ||
    pathname === "/user/wishlist";

  const getPageTitle = () => {
    switch (pathname) {
      case "/user/personal-information":
        return "My Profile";
      case "/user/orders":
        return "My Orders";
      case "/user/addresses":
        return "Manage Address";
      case "/user/wishlist":
        return "Wishlist";
      case "/user/change-password":
        return "Change Password";
      case "/user/logout":
        return "Logout";
      default:
        return "My Orders";
    }
  };

  const getPageSubtitle = () => {
    switch (pathname) {
      case "/user/personal-information":
        return "Manage your personal information and account preferences";
         case "/user/logout":
        return "We hope to see you again soon";
          case "/user/wishlist":
        return "Your saved fashion favourites, all in one place.";
      default:
        return undefined;
    }
  };

  return (
    <div>
        <Banner
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          titleClassName={
            pathname
              ? "font-montserrat text-[32px]! font-semibold! leading-[24px]! text-[#01295F]!"
              : undefined
          }
          subtitleClassName={
            pathname
              ? "font-montserrat text-[16px]! font-semibold! leading-[19.5px]! text-[#6A7282]!"
              : undefined
          }
          image={
            <Image
              src="/images/Group 1261155781.png"
              alt="Profile Banner"
              width={1920}
              height={218}
              priority
              fetchPriority="high"
            />
          }
        />
      <div className="py-7">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start gap-6 justify-center">
            <Sidebar links={sidebarLinks} variant="account" />

            <div
              className="flex w-full max-w-[1118px] items-start"
              style={{ marginTop: "0" }}
            >
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}