"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { LogOut, TriangleAlert } from "lucide-react";

import Button from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useLogoutMutation, useGetPersonalDataQuery } from "@/lib/redux/apis/auth-api";
import { useListOrdersQuery } from "@/lib/redux/apis/order-api";
import { useGetWishlistQuery } from "@/lib/redux/apis/cart-api";
import { useGetAddressesQuery } from "@/lib/redux/apis/address-api";
import { applyImageVariant } from "@/lib/utils/imageUtils";
import { RootState } from "@/lib/redux/store";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

export default function Logout() {
  const router = useRouter();
  const { isAuthenticated, authChecked } = useSelector((state: RootState) => state.auth);

  const [logout, { isLoading }] = useLogoutMutation();
  const [loggedOut, setLoggedOut] = useState(false);
  const [loggedOutName, setLoggedOutName] = useState("there");

  const skipQueries = !authChecked || !isAuthenticated || loggedOut;

  const { data: personalData } = useGetPersonalDataQuery(undefined, { skip: skipQueries });
  const { data: ordersData } = useListOrdersQuery({ per_page: 1 }, { skip: skipQueries });
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: skipQueries,
    refetchOnMountOrArgChange: true,
  });
  const { data: addresses } = useGetAddressesQuery(undefined, { skip: skipQueries });

  const profile = personalData?.response;
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const avatar = profile?.profile_image
    ? applyImageVariant(profile.profile_image, "public")
    : "/images/default_user_icon.jpg";

  const activeOrdersCount = ordersData?.total_items ?? 0;
  const wishlistCount = wishlistData?.items?.length ?? 0;
  const addressesCount = addresses?.length ?? 0;

  const handleLogout = async () => {
    setLoggedOutName(fullName || "there");
    await logout();
    toast.success("Logout successful!");
    setLoggedOut(true);
  };

  const handleCancel = () => {
    router.push("/user/personal-information");
  };

  const handleLogBackIn = () => {
    router.refresh();
    router.push("/login");
  };

  const showLoggedOutScreen = loggedOut || (authChecked && !isAuthenticated);

  useEffect(() => {
    if (!showLoggedOutScreen) return;

    const timer = setTimeout(() => {
      router.push("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [showLoggedOutScreen, router]);

  if (!authChecked) {
    return null;
  }

  if (showLoggedOutScreen) {
    return (
      <Card className="mx-auto w-full max-w-[1118px] items-center gap-3 p-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <LogOut size={24} className="text-[#99A1AF]" />
        </div>
        <h2 className="font-montserrat text-[clamp(1.125rem,1.125rem,1.125rem)] font-bold leading-[27px] text-center text-[#211E22]">
          You&apos;ve Been Logged Out
        </h2>
        <p className="max-w-md font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-normal leading-[18.75px] text-center text-[#99A1AF]">
          Thanks for shopping with ShopperBeats, {loggedOutName}! We hope to see you again soon.
        </p>
        <Button
          onClick={handleLogBackIn}
          className="mt-2 rounded-full cursor-pointer bg-sb-red px-8 py-2.5 font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-bold leading-[19.5px] text-center text-white"
          debounceDelay={500}
        >
          Log Back In
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-[1118px] gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <Image
            src={avatar}
            alt="Profile"
            width={56}
            height={56}
            loading="lazy"
            className="h-14 w-14 rounded-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-[clamp(0.875rem,0.875rem,0.875rem)] font-semibold leading-[21px] text-[#211E22]">
            {fullName || "My Account"}
          </h2>
          <p className="font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-normal leading-[18px] text-[#99A1AF]">
            {profile?.email ? maskEmail(profile.email) : ""}
          </p>
        </div>
      </div>

      <hr className="-mx-6 w-[calc(100%+3rem)] border-t border-[#E5E7EB]" />

      <div className="flex w-full items-start gap-3 rounded-[14px] bg-[#FFFBEB] p-4 border border-[#FEF3C6]">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-[#FE9A00]" />
        <div>
          <p className="font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-bold leading-[18px] text-[#BB4D00]">
            Are you sure you want to logout?
          </p>
          <p className="mt-1 font-montserrat text-[clamp(0.71875rem,0.71875rem,0.71875rem)] font-normal leading-[18.683px] text-[#E17100]">
            You&apos;ll need to log in again to access your orders, wishlist, and saved addresses.
          </p>
        </div>
      </div>

      <div className="flex w-full gap-3 sm:gap-4">
        <div className="flex h-[70.75px] w-0 flex-1 flex-col items-center justify-center rounded-[14px] border border-[#F3F4F6] bg-[#F9FAFB] px-2 py-3 sm:w-[143.333px] sm:flex-none sm:shrink-0 sm:px-4">
          <p className="font-montserrat text-[clamp(1.125rem,1.125rem,1.125rem)] font-bold leading-[27px] text-center text-[#211E22]">{activeOrdersCount}</p>
          <p className="font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-normal leading-[15.75px] text-center text-[#99A1AF]">Active Orders</p>
        </div>
        <div className="flex h-[70.75px] w-0 flex-1 flex-col items-center justify-center rounded-[14px] border border-[#F3F4F6] bg-[#F9FAFB] px-2 py-3 sm:w-[143.333px] sm:flex-none sm:shrink-0 sm:px-4">
          <p className="font-montserrat text-[clamp(1.125rem,1.125rem,1.125rem)] font-bold leading-[27px] text-center text-[#211E22]">{wishlistCount}</p>
          <p className="font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-normal leading-[15.75px] text-center text-[#99A1AF]">Wishlist Items</p>
        </div>
        <div className="flex h-[70.75px] w-0 flex-1 flex-col items-center justify-center rounded-[14px] border border-[#F3F4F6] bg-[#F9FAFB] px-2 py-3 sm:w-[143.333px] sm:flex-none sm:shrink-0 sm:px-4">
          <p className="font-montserrat text-[clamp(1.125rem,1.125rem,1.125rem)] font-bold leading-[27px] text-center text-[#211E22]">{addressesCount}</p>
          <p className="font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-normal leading-[15.75px] text-center text-[#99A1AF]">Saved Addresses</p>
        </div>
      </div>

      <div className="flex w-full flex-col sm:flex-row sm:items-center gap-3">
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          isLoading={isLoading}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-sb-red px-6 py-2.5 font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-bold leading-[18.75px] text-center text-white disabled:opacity-50"
          debounceDelay={500}
        >
          <LogOut size={16} />
          {isLoading ? "Logging out..." : "Yes, Logout"}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full sm:w-auto rounded-full border border-[#E5E7EB] bg-white px-6 py-2.5 font-montserrat text-[clamp(0.75rem,0.75rem,0.75rem)] font-bold leading-[18.75px] text-center text-[#A9A9A9]"
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
}
