import Layout from "@/components/ui/Layout";
import Home from "@/components/homepage/Home";
import { getHomepageData } from "@/lib/utils/get-homepage-data";
import { getMegaMenuData } from "@/lib/utils/get-mega-menu-data";
import { getFooterMenuData } from "@/lib/utils/get-footer-menu-data";

export default async function HomePage() {
  const megaMenuData = await getMegaMenuData().catch(() => []);

  const footerMenuData = await getFooterMenuData().catch(() => ({
    company: null,
    myAccount: null,
    helpSupport: null,
    legal: null,
  }));

  const {
    heroBanner,
    topCategories,
    bannerOne,
    bannerTwo,
    trendingDeals,
    topRated,
    bestSellers,
    personalized,
    customerReviews,
    recentlyViewed,
  } = await getHomepageData();

  return (
    <Layout megaMenuData={megaMenuData} footerMenuData={footerMenuData}>
      {/* <Home
        heroBanner={heroBanner}
        topCategories={topCategories}
        bannerOne={bannerOne}
        bannerTwo={bannerTwo}
        trendingDeals={trendingDeals}
        topRated={topRated}
        bestSellers={bestSellers}
        personalized={personalized}
        customerReviews={customerReviews}
        recentlyViewed={recentlyViewed}
      /> */}
      <h1>Home Page</h1>
    </Layout>
  );
}
