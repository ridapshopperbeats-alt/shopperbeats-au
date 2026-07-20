"use client";

import { useRouter } from "next/navigation";
import {toast} from "react-toastify";
import Button from "@/components/ui/Button";
import { useLogoutMutation } from "@/lib/redux/apis/auth-api";

export default function Logout() {
  const router = useRouter();

  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    toast.success("Logout successful!");
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="wishlist-content">
      <h4 className="text-heading-lg my-2">Logout</h4>
      <p className="my-4 font-base font-medium text-[16px] leading-[normal]">Are you sure you want to logout?</p>
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        isLoading={isLoading}
        className="btn btn-red btn-filled btn-sharp"
        debounceDelay={500}
      >
        {isLoading ? "Logging out..." : "Yes, Logout"}
      </Button>
    </div>
  );
}
