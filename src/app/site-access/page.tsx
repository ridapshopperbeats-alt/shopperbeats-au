import type { Metadata } from "next";
import { Suspense } from "react";

import SiteAccessForm from "./SiteAccessForm";

export const metadata: Metadata = {
  title: "Enter Password",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SiteAccessPage() {
  return (
    <Suspense>
      <SiteAccessForm />
    </Suspense>
  );
}
