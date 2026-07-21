"use client";
import React, { Suspense } from "react";
import Banner from "@/components/ui/Banner";
import Sidebar from "@/components/ui/Sidebar";
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
            loading="lazy"
          />
        }
      />
      <div className="py-7">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-6">
            <Sidebar links={sidebarLinks} extraClass="w-full max-w-[400px]" textStyle={{ fontSize: "clamp(16px, 2vw, 18px)", fontWeight: "700", color: "#000000", }} />

            {/* ✅ FIX HERE */}
            <div className="content shadow-[0px_0px_14px_rgba(0,0,0,0.08)] w-full lg:w-85-imp" style={{ marginTop: "0" }}>
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