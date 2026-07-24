import Layout from "@/components/common/Layout";
import { getMegaMenuData } from "@/lib/utils/get-mega-menu-data";
import { getFooterMenuData } from "@/lib/utils/get-footer-menu-data";
import { getCategoryData } from "@/lib/utils/get-category-data";
import CategorySlider from "@/components/pages/CategorySlider";
import { applyImageVariant } from "@/lib/utils/imageUtils";

export default async function TopCategories({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [megaMenuData, footerMenuData, categories] = await Promise.all([
    getMegaMenuData().catch(() => []),
    getFooterMenuData().catch(() => ({
      company: null,
      myAccount: null,
      helpSupport: null,
      legal: null,
    })),
    getCategoryData().catch(() => []),
  ]);

  const sliderCategories = categories.map((cat) => ({
    id: cat.id,
    title: cat.name,
    image:
      cat.icon_url || cat.image_url
        ? applyImageVariant(cat.icon_url || cat.image_url, "public")
        : "/images/image-coming-soon.jpg",
    slug: cat.slug,
    href: `/category/${cat.slug}`,
  }));

  return (
    <Layout megaMenuData={megaMenuData} footerMenuData={footerMenuData}>
      {sliderCategories.length > 0 && (
        <CategorySlider
          title="Top Categories"
          items={sliderCategories}
          titleClassName="text-[24px] leading-6 mx-auto text-center"
          className="container"
        />
      )}

      {children}
    </Layout>
  );
}
