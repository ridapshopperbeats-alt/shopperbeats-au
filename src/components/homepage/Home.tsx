import SingleBanner from "./Banner";
import TopCategories from "./TopCategories";
import ProductCarousel from "../ui/ProductCarousel";
import { getBestSellers } from "@/lib/utils/get-bestsellers";
import { getTrendingProducts } from "@/lib/utils/get-trending-products";
import { transformProductData } from "@/lib/utils/transform-product-data";
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
      <div className="flex flex-col gap-6.5">
        <div className="pt-6.5">
          <SingleBanner />
        </div>

        <div className="container">
          {products.length > 0 && (
            <ProductCarousel
              title="Best Sellers"
              products={products}
              link="View"
            />
          )}
        </div>

        <PopularCategories />

        <div className="container">
          {trendingProducts.length > 0 && (
            <ProductCarousel
              title="Trending Products"
              products={trendingProducts}
              link="View"
            />
          )}
        </div>

        <TopBrands />

        <div className="container">
          {products.length > 0 && (
            <ProductCarousel
              title="New Arrivals"
              products={products}
              link="View"
            />
          )}
        </div>
      </div>
    </TopCategories>
  );
};

export default Home;
