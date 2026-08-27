import { API_ENDPOINTS } from "@/lib/constants/api";
import { notFound } from "next/navigation";
import CmsIframe from "@/components/CmsIframe";
import type { CmsPage } from "@/types/cms";
import Banner from "@/components/common/Banner";
import Image from "next/image";

async function getCmsPage(slug: string): Promise<CmsPage | null> {
  const res = await fetch(
    `${API_ENDPOINTS.CMS.BASE_URL}${API_ENDPOINTS.CMS.BY_SLUG(slug)}`,
    { cache: "no-store" },
  );

  if (!res.ok) return null;
  return res.json();
}

const getPageSubtitle = (slug: string) => {
  switch (slug) {
    case "faq":
      return "Find answers to the most commonly asked questions.";
    case "contact-us":
      return "We're here to help — reach out any time.";
    case "About-us":
      return "The story behind ShopperBeats.";
    case "return-refunds":
      return "Our hassle-free return and warranty guidelines";
    case "terms-condition":
      return "Please read these terms carefully before using ShopperBeats.";
    case "privacy-policy":
      return "How we collect, use and protect your data.";
    case "payment-policy":
      return "Secure, flexible, and transparent payment options";
    case "intellectual-property-complaints":
      return "Report copyright or trademark infringement.";
    case "shipping-delivery":
      return "Fast, reliable delivery to your door.";
    default:
      return undefined;
  }
};

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
      <Banner
        title={page.title}
        subtitle={getPageSubtitle(slug)}
        titleClassName="font-montserrat text-[32px]! font-semibold! leading-[24px]! text-[#01295F]!"
        subtitleClassName="font-montserrat text-[16px]! font-semibold! leading-[19.5px]! text-[#6A7282]!"
        image={
          <Image
            src="/images/Group 1261155781.png"
            alt="Profile Banner"
            width={1920}
            height={218}
            priority
            fetchPriority="high"
          />
        }
      />
      <CmsIframe content={page.content} />
    </main>
  );
}
