import Layout from '@/components/common/Layout';
import '../../styles/auth.css';
import AuthGuard from './AuthGuard';
import { getMegaMenuData } from '@/lib/utils/get-mega-menu-data';
import { getFooterMenuData } from '@/lib/utils/get-footer-menu-data';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const megaMenuData = await getMegaMenuData().catch(() => []);

  const footerMenuData = await getFooterMenuData().catch(() => ({
    company: null,
    myAccount: null,
    helpSupport: null,
    legal: null,
  }));

  return (
    <Layout
      megaMenuData={megaMenuData}
      footerMenuData={footerMenuData}
    >
      <AuthGuard>{children}</AuthGuard>
    </Layout>
  );
}
