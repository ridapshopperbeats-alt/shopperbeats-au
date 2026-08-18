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

// Route disabled — the real implementation above is commented out. This
// stub keeps the route a valid Next.js page (satisfying the generated
// route-type validator) until it's re-enabled by uncommenting the above.
import { notFound } from "next/navigation";

export default function StaticCategoryRoute() {
  notFound();
}
