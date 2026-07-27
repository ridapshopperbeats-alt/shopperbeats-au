import Layout from "@/components/common/Layout";
import { getMegaMenuData } from "@/lib/utils/get-mega-menu-data";
import { getFooterMenuData } from "@/lib/utils/get-footer-menu-data";
import NewTopCategories from "./NewTopCategories";

export default async function TopCategories({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [megaMenuData, footerMenuData] = await Promise.all([
    getMegaMenuData().catch(() => []),
    getFooterMenuData().catch(() => ({
      company: null,
      myAccount: null,
      helpSupport: null,
      legal: null,
    })),
  ]);

  return (
    <Layout megaMenuData={megaMenuData} footerMenuData={footerMenuData}>
      <NewTopCategories />

      {children}
    </Layout>
  );
}
