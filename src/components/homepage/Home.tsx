// 'use client'
import SingleBanner from "./Banner";
import TopCategories from "./TopCategories";
import {
  getBestSellers,
  getPopularProducts,
  getNewReleases,
  transformProductData,
} from "@/lib/utils/main-utils";
import PopularCategories from "./AllBanner";
import TopBrands from "./TopRated";
import ProductCarousel from "../common/ProductCarousel";

const Home = async () => {
  const [bestSellers, popular, newReleases] = await Promise.all([
    getBestSellers().catch(() => []),
    getPopularProducts().catch(() => []),
    getNewReleases().catch(() => []),
  ]);

  const products = transformProductData(bestSellers);
  const popularProducts = transformProductData(popular);
  const newArrivals = transformProductData(newReleases);

  return (
    <TopCategories>
      <SingleBanner />
      <div className="flex flex-col">
        <div className="container">
          {products.length > 0 && (
            <ProductCarousel
              title="Best Sellers"
              products={products}
              link="/product-listing/best-sellers"
            />
          )}
        </div>

        <PopularCategories />

        <div className="container  md:py-3 lg:py-3">
          {popularProducts.length > 0 && (
            <ProductCarousel
              title="Popular Products"
              products={popularProducts}
              link="/product-listing/popular"
            />
          )}
        </div>

        <TopBrands />

        <div className="container pt-4 md:pt-5 lg:pt-3">
          {newArrivals.length > 0 && (
            <ProductCarousel
              title="New Arrivals"
              products={newArrivals}
              link="/product-listing/new-releases"
            />
          )}
        </div>
      </div>
    </TopCategories>
  );
};

export default Home;
