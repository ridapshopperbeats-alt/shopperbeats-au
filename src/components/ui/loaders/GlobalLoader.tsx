"use client";

import { useGlobalLoading } from "@/lib/hooks/use-global-loading";
import ShopperbeatsLoader from "./ShopperbeatsLoader";

export default function GlobalLoader() {
  const visible = useGlobalLoading();

  if (!visible) return null;

  return <ShopperbeatsLoader />;
}
