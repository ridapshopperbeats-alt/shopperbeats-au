// import type { Metadata } from "next";
// import { Suspense } from "react";
// import StaticCategoryPage from "@/components/pages/StaticCategoryPage";

// export const metadata: Metadata = {
//   title: "Static Category - Shopperbeats",
//   description: "Static demo category page using local static data.",
// };

// export default function StaticCategoryRoute() {
//   return (
//     <Suspense fallback={null}>
//       <StaticCategoryPage />
//     </Suspense>
//   );
// }

import { notFound } from "next/navigation";

export default function StaticCategoryRoute() {
  notFound();
}
