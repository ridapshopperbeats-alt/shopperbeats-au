import SingleBanner from "./Banner";
import TopCategories from "./TopCategories";
// import {
//   getBestSellers,
//   getTrendingProducts,
//   transformProductData,
// } from "@/lib/utils/main-utils";
import PopularCategories from "./AllBanner";
import TopBrands from "./TopRated";
import StaticProductCards from "./StaticCard";

const Home = async () => {
  // const [bestSellers, trending] = await Promise.all([
  //   getBestSellers().catch(() => []),
  //   getTrendingProducts().catch(() => []),
  // ]);

  // const products = transformProductData(bestSellers);
  // const trendingProducts = transformProductData(trending);

  return (
    <TopCategories>
      <SingleBanner />
      <div className="flex flex-col ">
        <div className="container lg:pt-2 lg:mb-1">
          {/* {products.length > 0 && (
            <ProductCarousel
              title="Best Sellers"
              products={products}
              link="#"
            />
          )} */}
          <StaticProductCards heading="bestseller" viewAllHref="#" />
        </div>

        <PopularCategories />

        <div className="container pt-4 md:pt-5 lg:mb-3">
          {/* {trendingProducts.length > 0 && (
            <ProductCarousel
              title="Trending Products"
              products={trendingProducts}
              link="#"
            />
          )} */}

          <StaticProductCards heading="Trending Products" viewAllHref="#" />
        </div>

        <TopBrands />

        <div className="container pt-4 md:pt-5 lg:pt-0">
          {/* {products.length > 0 && (
            <ProductCarousel
              title="New Arrivals"
              products={products}
              link="#"
            />
          )} */}

          <StaticProductCards heading="New Arrivals " viewAllHref="#" />
        </div>
      </div>
    </TopCategories>
  );
};

export default Home;
