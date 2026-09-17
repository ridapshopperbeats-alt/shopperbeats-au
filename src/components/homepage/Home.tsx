
import { HomepageSection } from "@/types/homepage";
import { Product } from "@/types/product";
import SingleBanner from "./Banner";
import ImageGrid from "./AllBanner";
import { NewTopCategories } from "./NewTopCategories";
import TrendingDeals from "./TrandingDetails";


interface HomeProps {
  heroBanner: HomepageSection | null;
  topCategories: HomepageSection | null;
  bannerOne: HomepageSection | null;
  bannerTwo: HomepageSection | null;
  trendingDeals: Product[];
  topRated: Product[];
  bestSellers: Product[];
  personalized: Product[];
  customerReviews: unknown[];
  recentlyViewed: Product[];
}

export default function Home({
  trendingDeals,
}: HomeProps) {
  return (
    <main>
      <SingleBanner />
      <NewTopCategories />
      {trendingDeals.length > 0 && <TrendingDeals trendingDeals={trendingDeals} />}
      <ImageGrid/>
    </main>
  );
}

