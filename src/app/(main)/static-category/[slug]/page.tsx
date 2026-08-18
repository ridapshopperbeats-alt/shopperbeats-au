// import type { Metadata } from "next";
// import { Suspense } from "react";
// import StaticCategoryPage from "@/components/pages/StaticCategoryPage";
// import { findStaticCategoryBySlug } from "@/lib/utils/staticCategoryData";

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }): Promise<Metadata> {
//   const { slug } = await params;
//   const category = findStaticCategoryBySlug(slug);

//   return {
//     title: category?.name
//       ? `${category.name} - Shopperbeats`
//       : "Static Category - Shopperbeats",
//     description: `Browse products in the ${category?.name || "selected"} category (static demo data).`,
//   };
// }

// export default async function StaticCategorySlugRoute({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;

//   return (
//     <Suspense fallback={null}>
//       <StaticCategoryPage slug={slug} />
//     </Suspense>
//   );
// }

// Route disabled — the real implementation above is commented out. This
// stub keeps the route a valid Next.js page (satisfying the generated
// route-type validator) until it's re-enabled by uncommenting the above.
import { notFound } from "next/navigation";

export default function StaticCategorySlugRoute() {
  notFound();
}
