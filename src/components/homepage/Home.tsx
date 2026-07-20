import dynamic from "next/dynamic";

const TrendingDeals = dynamic(() => import("./TrendingDeals"));
import "../../styles/Home.css";
import { HomepageSection } from "@/types/homepage";
import { Product } from "@/types/product";
import { TopCategories } from "./TopCategories";
import SingleBanner from "./Banner";
import ImageGrid from "./AllBanner";


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
      <TopCategories />

      <SingleBanner />
      {trendingDeals.length > 0 && <TrendingDeals trendingDeals={trendingDeals} />}
      <ImageGrid/>
    </main>
  );
}
