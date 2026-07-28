import type { Metadata } from "next";
import StaticProductDetailClient from "@/components/pages/StaticProductDetailClient";
import { getStaticProductDetail } from "@/lib/utils/staticCategoryData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getStaticProductDetail(slug);

  return {
    title: product?.title
      ? `${product.title} - Shopperbeats`
      : "Product - Shopperbeats",
    description: product?.shortDescription,
  };
}

export default async function StaticProductSlugRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <StaticProductDetailClient slug={slug} />;
}
