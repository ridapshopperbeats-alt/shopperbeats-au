import { Suspense } from "react";
import HomePage from "@/components/homepage/Home";
import Layout from "@/components/common/Layout";
import { getHomepageData } from "@/lib/utils/get-homepage-data";
import { getMegaMenuData } from "@/lib/utils/get-mega-menu-data";
import { getFooterMenuData } from "@/lib/utils/get-footer-menu-data";
import type { Metadata } from "next";

// Carried over from the duplicate (main)/page.tsx that also resolved to "/".
// Whichever of the two Next picked varied between builds, and only that one
// carried these tags, so the homepage kept losing its title/description.
export const metadata: Metadata = {
  title: "Shopperbeats - Your One-Stop Online Shop",
  description:
    "Discover amazing deals on electronics, home goods, fashion, and more at Shopperbeats. Shop smart, live happy!",
};

// getHomepageData() reads cookies and hits the product APIs on every request,
// so awaiting it before returning would hold back the whole document. Kept in
// its own component behind Suspense, the header/footer shell is flushed first
// and the page content streams in as soon as those calls resolve.
async function HomeContent() {
  const homepageData = await getHomepageData();

  return <HomePage {...homepageData} />;
}

const Home = async () => {
  // Menu data is revalidated (3600s), so this resolves from cache almost always.
  const [megaMenuData, footerMenuData] = await Promise.all([
    getMegaMenuData(),
    getFooterMenuData(),
  ]);

  return (
    <Layout megaMenuData={megaMenuData} footerMenuData={footerMenuData}>
      {/* The fallback reserves a full viewport of space so the footer starts
          below the fold: when the streamed content replaces it the footer is
          pushed down off-screen instead of jumping while the user is looking
          at it, which is what the layout-shift score was counting. */}
      <Suspense fallback={<div className="min-h-screen" />}>
        <HomeContent />
      </Suspense>
    </Layout>
  );
};
export default Home;
