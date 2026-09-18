"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ComponentType } from "react";
import {
  User,
  Package,
  MapPin,
  Heart,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useGetPersonalDataQuery } from "@/lib/redux/apis/auth-api";
import { applyImageVariant } from "@/lib/utils/imageUtils";
import { RootState } from "@/lib/redux/store";
import { sidebarLinks } from "@/lib/utils/main-utils";
import type { MobileAccountSheetProps } from "@/types/ui";

const ACCOUNT_ICONS: Record<
  string,
  ComponentType<{ size?: number; className?: string }>
> = {
  "Personal Information": User,
  "My Orders": Package,
  "Manage Address": MapPin,
  Wishlist: Heart,
  "Change Password": Lock,
  Logout: LogOut,
};


function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.trim()?.[0] ?? "";
  const last = lastName?.trim()?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "U";
}

export default function MobileAccountSheet({
  isOpen,
  onClose,
}: MobileAccountSheetProps) {
  const { isAuthenticated, authChecked } = useSelector(
    (state: RootState) => state.auth,
  );
  const { data: personalData } = useGetPersonalDataQuery(undefined, {
    skip: !authChecked || !isAuthenticated,
  });
  const visibleSidebarLinks = isAuthenticated
    ? sidebarLinks
    : sidebarLinks.filter((link) => link.label === "Wishlist");

  const firstName = personalData?.response?.first_name;
  const lastName = personalData?.response?.last_name;
  const email = personalData?.response?.email;
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Guest";
  const profileImage = personalData?.response?.profile_image?.trim()
    ? applyImageVariant(personalData.response.profile_image, "public")
    : null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-[1000] max-h-[85vh] overflow-y-auto rounded-t-[24px] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex flex-col items-center gap-1 px-6 pb-5 pt-6">
          <div className="relative h-14 w-14 shrink-0">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={fullName}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FD151B] text-[18px] font-bold text-white">
                {getInitials(firstName, lastName)}
              </div>
            )}
          </div>

          <h3 className="text-[16px] font-bold text-black">{fullName}</h3>

          {email && (
            <p className="text-[12px] text-[#99A1AF]">{email}</p>
          )}
        </div>

        <ul className="flex flex-col px-4 pb-6">
          {visibleSidebarLinks.map((link) => {
            const Icon = ACCOUNT_ICONS[link.label];
            const isLogout = link.label === "Logout";

            return (
              <li
                key={link.href}
                className="border-t border-[#F0F0F0] first:border-t-0"
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <span className="flex items-center gap-3">
                    {Icon && (
                      <Icon
                        size={18}
                        className={isLogout ? "text-[#FD151B]" : "text-[#4A5565]"}
                      />
                    )}

                    <span
                      className={`text-[14px] font-medium ${
                        isLogout ? "text-[#FD151B]" : "text-[#1E1E1E]"
                      }`}
                    >
                      {link.label}
                    </span>
                  </span>

                  <ChevronRight size={16} className="text-[#99A1AF]" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
