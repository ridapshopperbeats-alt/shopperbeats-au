import SingleBanner from "./Banner";
import TopCategories from "./TopCategories";
import ProductCarousel from "../common/ProductCarousel";
import {
  getBestSellers,
  getTrendingProducts,
  transformProductData,
} from "@/lib/utils/main-utils";
import PopularCategories from "./AllBanner";
import TopBrands from "./TopRated";

const Home = async () => {
  const [bestSellers, trending] = await Promise.all([
    getBestSellers().catch(() => []),
    getTrendingProducts().catch(() => []),
  ]);

  const products = transformProductData(bestSellers);
  const trendingProducts = transformProductData(trending);

  return (
    <TopCategories>
      <SingleBanner />
      <div className="flex flex-col gap-6 mt-2 lg:mt-3">
        <div className="container">
          {products.length > 0 && (
            <ProductCarousel
              title="Best Sellers"
              products={products}
              link="#"
            />
          )}
        </div>

        <PopularCategories />

        <div className="container">
          {trendingProducts.length > 0 && (
            <ProductCarousel
              title="Trending Products"
              products={trendingProducts}
              link="#"
            />
          )}
        </div>

        <TopBrands />

        <div className="container">
          {products.length > 0 && (
            <ProductCarousel
              title="New Arrivals"
              products={products}
              link="#"
            />
          )}
        </div>
      </div>
    </TopCategories>
  );
};

export default Home;
