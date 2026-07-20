"use client";

import Lottie from "lottie-react";
import { useGlobalLoading } from "@/lib/hooks/use-global-loading";
import animationData from "./ShopperbeatsLoder.json";

export default function GlobalLoader() {
  // const visible = useGlobalLoading();

  // if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="relative w-[300px] h-[220px] flex justify-center overflow-hidden">
        <div className="absolute top-0 w-[300px] h-[300px]">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-[13px] font-semibold tracking-wide text-[#0B1F5B]">
          SHOPPERBEATS
        </p>
        <p className="text-[12px] opacity-[0.45] text-[#0B1F5B]">
          Loading your marketplace
        </p>
      </div>
    </div>
  );
}
