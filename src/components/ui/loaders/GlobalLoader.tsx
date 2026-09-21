"use client";

import dynamic from "next/dynamic";
import { useGlobalLoading } from "@/lib/hooks/use-global-loading";

// Statically importing this pulls lottie-web into the entry bundle of every
// page for an overlay that is hidden on nearly all of them.
const ShopperbeatsLoader = dynamic(() => import("./ShopperbeatsLoader"), {
  ssr: false,
});

export default function GlobalLoader() {
  const visible = useGlobalLoading();

  if (!visible) return null;

  return <ShopperbeatsLoader />;
}
