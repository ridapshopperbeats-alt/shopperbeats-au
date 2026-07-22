import Layout from "@/components/common/Layout";
import { getFooterMenuData } from "@/lib/utils/get-footer-menu-data";
import { getMegaMenuData } from "@/lib/utils/get-mega-menu-data";


export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [megaMenuData, footerMenuData] = await Promise.all([
    getMegaMenuData(),
    getFooterMenuData(),
  ]);

  return (
    <>
      <Layout megaMenuData={megaMenuData} footerMenuData={footerMenuData}>{children}</Layout>
     
    </>
  )
}
