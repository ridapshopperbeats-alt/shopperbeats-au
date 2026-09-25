
import SingleBanner from "./Banner";
import ImageGrid from "./AllBanner";
import { NewTopCategories } from "./NewTopCategories";
import TrendingDeals from "./TrandingDetails";
import type { HomeProps } from "@/types/homepage";



export default function Home({
  trendingDeals,
}: HomeProps) {
  return (
    <main className="mb-6 lg:mb-0">
      <SingleBanner />
      <NewTopCategories />
      {trendingDeals.length > 0 && <TrendingDeals trendingDeals={trendingDeals} />}
      <ImageGrid/>
    </main>
  );
}

