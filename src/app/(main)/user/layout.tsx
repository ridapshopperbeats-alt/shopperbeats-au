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
  const isReviewPage = pathname.endsWith("/review");
  const usesPlainWrapper = isPersonalInformation || isReviewPage;

  const getPageTitle = () => {
    switch (pathname) {
      case "/user/personal-information":
        return "Personal Information";
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

  return (
    <div>
      <Banner
        title={getPageTitle()}
        image={
          <Image
            src="/images/profile/profile-banner.svg"
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
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Sidebar links={sidebarLinks} variant="account" />

            <div
              className={
                usesPlainWrapper
                  ? "flex w-full max-w-[1118px] justify-center"
                  : "content shadow-[0px_0px_14px_rgba(0,0,0,0.08)] w-full lg:w-85-imp"
              }
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