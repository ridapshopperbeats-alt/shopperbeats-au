import { API_ENDPOINTS } from "@/lib/constants/api";
import { notFound } from "next/navigation";
import CmsIframe from "@/components/CmsIframe";
import type { CmsPage } from "@/types/cms";

async function getCmsPage(slug: string): Promise<CmsPage | null> {
  const res = await fetch(
    `${API_ENDPOINTS.CMS.BASE_URL}${API_ENDPOINTS.CMS.BY_SLUG(slug)}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getCmsPage(slug);

  if (!page || !page.is_published) notFound();

  return (
    <main>
      <CmsIframe content={page.content} />
    </main>

  );
}
