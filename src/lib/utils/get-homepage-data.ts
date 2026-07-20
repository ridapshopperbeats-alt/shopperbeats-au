import { API_ENDPOINTS } from "@/lib/constants/api";
import { cookies } from "next/headers";

const baseUrl = API_ENDPOINTS.PRODUCTS.PRODUCTS_API_BASE_URL;

// Static data — safe to cache with ISR (60s revalidate)
async function getStaticHomepageData() {
  const results = await Promise.allSettled([
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(API_ENDPOINTS.PRODUCTS.HERO_BANNER)}`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(API_ENDPOINTS.PRODUCTS.TOP_CATEGORIES)}`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(API_ENDPOINTS.PRODUCTS.BANNER_ONE)}`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(API_ENDPOINTS.PRODUCTS.BANNER_TWO)}`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.HIGHLIGHTS}/${API_ENDPOINTS.PRODUCTS.TRENDING_DEALS}`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.BRANDS_LIST}`, { next: { revalidate: 300 } }),
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.HIGHLIGHTS}/${API_ENDPOINTS.PRODUCTS.TOP_RATED}`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.HIGHLIGHTS}${API_ENDPOINTS.PRODUCTS.BESTSELLERS}`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/${API_ENDPOINTS.PRODUCTS.HOMEPAGE_SECTION_BY_ID(API_ENDPOINTS.PRODUCTS.CUSTOMER_REVIEWS)}`, { next: { revalidate: 300 } }),
  ]);

  const [heroBanner, topCategories, bannerOne, bannerTwo, trending, brands, topRated, bestSellers, customerReviews] =
    await Promise.all(
      results.map(async (r) => {
        if (r.status === "rejected" || !r.value.ok) return null;
        return r.value.json();
      })
    );

  return { heroBanner, topCategories, bannerOne, bannerTwo, trending, brands, topRated, bestSellers, customerReviews };
}

// Per-user data — must be no-store (session-dependent)
async function getUserHomepageData(allCookies: string) {
  const [personalized /*, recentlyViewed */] = await Promise.allSettled([
    fetch(`${baseUrl}${API_ENDPOINTS.PRODUCTS.PERSONALIZED}`, {
      headers: { Cookie: allCookies },
      cache: "no-store",
    }),

   
  ]);

  const personalizedData =
    personalized.status === "fulfilled" && personalized.value.ok
      ? await personalized.value.json()
      : null;

  const recentlyViewedData = null;

  return { personalized: personalizedData, recentlyViewed: recentlyViewedData };
}

export async function getHomepageData() {
  const cookieStore = await cookies();
  const allCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const [staticData, userData] = await Promise.all([
    getStaticHomepageData(),
    getUserHomepageData(allCookies),
  ]);

  const {
    heroBanner,
    topCategories,
    bannerOne,
    bannerTwo,
    trending,
    brands,
    topRated,
    bestSellers,
    customerReviews,
  } = staticData;

  const { personalized, recentlyViewed } = userData;

  const dummyRecentlyViewed = [
    {
      "id": "ffa82a06-3616-43ca-a56e-be3c82937ba2",
      "title": "Seat Cushion, Cooling Gel Seat Cushion for Pressure Relief, Soft & Breathable Wheelchair Seat Pad with Removable Cover, Lightweight and Portable for Office, Travel, Car, Airplane",
      "slug": "seat-cushion-cooling-gel-seat-cushion-for-pressure-relief-soft-breathable-wheelchair-seat-pad-with-removable-cover-lightweight-and-portable-for-office-travel-car-airplane",
      "unique_code": "X35K6MXHMH",
      "price": "31.99",
      "rrp_price": "70.49",
      "thumbnail": "https://cdn.shopperbeats.com.au/products/LYDCGZDNJ000TXA44001V0/3a2f6c8e-881b-432b-b605-89daccfc652c.jpg",
      "category_id": "HOME431",
      "brand_id": "b035fd42-c998-4b12-aa28-e6856740bcb4",
      "brand_name": "VEVOR",
      "category_name": "Seat Cushions",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ffadf226-fe55-4ffc-b2c9-9eb783f77a45",
      "title": "Tender Leaf Toys Pond Dipping Fishing Game",
      "slug": "tender-leaf-toys-pond-dipping-fishing-game",
      "unique_code": "4Y31H2EAII",
      "price": "144.00",
      "rrp_price": "314.00",
      "thumbnail": "https://cdn.shopperbeats.com.au/products/product/6ca3e379-8d0a-443a-afdb-0ba68b535342.jpg",
      "category_id": "TOYS066",
      "brand_id": "01b956e5-f1b9-4dbe-8c5b-27a80421fa1b",
      "brand_name": "Tender Leaf Toys",
      "category_name": "Practical Skill Teaching Toys",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ffc1afcd-15b6-452d-9981-27cc799a99a4",
      "title": "Gardeon 3PC Rocking Chair Table Wicker Outdoor Furniture Patio Bistro Set Black",
      "slug": "gardeon-3pc-rocking-chair-table-wicker-outdoor-furniture-patio-bistro-set-black",
      "unique_code": "CCNESZXD8Q",
      "price": "389.99",
      "rrp_price": "399.99",
      "thumbnail": "https://cdn.shopperbeats.com.au/products/product/c8190b4e-cc76-4d01-b5bb-2874bf8796e5.jpg",
      "category_id": "FURN192",
      "brand_id": "7d51f3fa-f934-4ce1-b8cc-6ab327e82330",
      "brand_name": "Gardeon",
      "category_name": "Outdoor Bistro Sets",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ffb6c081-c89d-4b8c-9421-9c195fc8e6fe",
      "title": "Deddy Bears Series 1 Coffins (4 Asst)",
      "slug": "deddy-bears-series-1-coffins-4-asst",
      "unique_code": "PISA4S783O",
      "price": "113.99",
      "rrp_price": "163.74",
      "thumbnail": "https://www.jasnor.com.au/pub/media/catalog/product/D/B/DBD10.JPG",
      "category_id": "TOYS057",
      "brand_id": "04a78b4f-51ff-4806-a6fc-e46ea0ce6cab",
      "brand_name": "DEDDY BEARS",
      "category_name": "Plush Toys",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ffb6c0b6-dad5-4f82-8d2c-287bb5431d63",
      "title": "30L Ultrasonic Cleaner, Professional Ultrasonic Cleaner Machine with Knob Control, Stainless Steel Cleaning Machine with Basket and Cleaning Ball, for Watches, Razors, Jewelry, Coins and More",
      "slug": "30l-ultrasonic-cleaner-professional-ultrasonic-cleaner-machine-with-knob-control-stainless-steel-cleaning-machine-with-basket-and-cleaning-ball-for-watches-razors-jewelry-coins-and-more",
      "unique_code": "M27UOBDEMQ",
      "price": "550.99",
      "rrp_price": "848.99",
      "thumbnail": "https://cdn.shopperbeats.com.au/products/SPLXNAJKZCSBWD6B9001V3/42488108-bf9c-47ba-bb8f-61b6a8ab38be.jpg",
      "category_id": "BUSI013",
      "brand_id": "b035fd42-c998-4b12-aa28-e6856740bcb4",
      "brand_name": "VEVOR",
      "category_name": "Jewellery Cleaners",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ffb51b06-4807-4fbe-9507-644a28b1d242",
      "title": "Peppa Pig Cuddling Baby Evie",
      "slug": "peppa-pig-cuddling-baby-evie",
      "unique_code": "4DTKXASAYW",
      "price": "27.99",
      "rrp_price": "56.24",
      "thumbnail": "https://www.jasnor.com.au/pub/media/catalog/product/P/P/PP8484.JPG",
      "category_id": "TOYS057",
      "brand_id": "12aa348b-3b0d-409d-ac8e-819435a65b7a",
      "brand_name": "PEPPA PIG",
      "category_name": "Plush Toys",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ffa5c0b3-6eae-47ca-8396-d5f5808958ca",
      "title": "Folkmanis Ice Dragon Puppet",
      "slug": "folkmanis-ice-dragon-puppet",
      "unique_code": "S1VCVZJMYA",
      "price": "144.00",
      "rrp_price": "314.00",
      "thumbnail": "https://cdn.shopperbeats.com.au/products/product/57945eb9-60a3-4bb5-b1af-03ff69fe2740.jpg",
      "category_id": "TOYS058",
      "brand_id": "76c7fdab-ebb0-4a47-9139-f6af45da2871",
      "brand_name": "Folkmanis",
      "category_name": "Puppets",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ffa26dee-8c2f-47d1-b61c-66c6e9d3c726",
      "title": "Reclining Office Chair with Footrest, Heavy Duty PU Leather Wide Office Chair, Big and Tall Executive Office Chairs with Lumbar Support, Strong Metal Base Quiet Wheels, White",
      "slug": "reclining-office-chair-with-footrest-heavy-duty-pu-leather-wide-office-chair-big-and-tall-executive-office-chairs-with-lumbar-support-strong-metal-base-quiet-wheels-white",
      "unique_code": "RLV70BTYIH",
      "price": "746.99",
      "rrp_price": "1142.99",
      "thumbnail": "https://cdn.shopperbeats.com.au/products/LBYZXKPGDJT0U1Z5NV0/86ae8704-8d93-42c2-9077-50f3605b5308.jpg",
      "category_id": "FURN148",
      "brand_id": "b035fd42-c998-4b12-aa28-e6856740bcb4",
      "brand_name": "VEVOR",
      "category_name": "Office Chairs",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ff9f0abd-bf3f-46ad-a36a-2c7243221e87",
      "title": "Everfit Desktop Punching Boxing Bag Stand Set with Pump Swivel Speed Balls",
      "slug": "everfit-desktop-punching-boxing-bag-stand-set-with-pump-swivel-speed-balls",
      "unique_code": "PBSBBTCY0U",
      "price": "28.99",
      "rrp_price": "38.99",
      "thumbnail": "https://cdn.shopperbeats.com.au/products/product/bab29dc2-57fe-480d-8a5f-dd3e8fd3d89a.jpg",
      "category_id": "SPOR027",
      "brand_id": "b9c76865-287d-41b8-bfc2-888a5d8e1c4c",
      "brand_name": "Everfit",
      "category_name": "Punching Bags & Balls",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    },
    {
      "id": "ff9e8abb-0df1-4202-ba65-6553bdaee5b1",
      "title": "Nirvana Organics Liquid Stevia Citrus 50ml",
      "slug": "nirvana-organics-liquid-stevia-citrus-50ml",
      "unique_code": "PUNX4MF9FO",
      "price": "11.27",
      "rrp_price": "32.95",
      "thumbnail": "https://cdn.shopperbeats.com.au/products/product/038eafe3-575b-42e5-958c-12fc23d631a0.png",
      "category_id": "FOOD051",
      "brand_id": "f3f53688-4e31-4fc5-8ce7-9a1214f0ba4a",
      "brand_name": "Nirvana Organics",
      "category_name": "Soda Maker Syrup",
      "average_rating": null,
      "total_reviews": null,
      "status": "active",
      "promotion_name": null,
      "discount_percentage": 0,
      "discounted_price": 0
    }

  ];

  const safeRecentlyViewed = Array.isArray(recentlyViewed)
    ? recentlyViewed
    : [];

  return {
    heroBanner,
    topCategories,
    bannerOne,
    bannerTwo,
    trendingDeals: trending?.products?.data ?? [],
    brands: brands?.data?.slice(0, 10) ?? [],
    topRated: topRated?.products?.data ?? [],
    bestSellers: bestSellers?.products?.data?.slice(0, 10) ?? [],
    personalized: personalized?.data?.slice(0, 10) ?? [],
    customerReviews: customerReviews?.config?.items ?? [],

    recentlyViewed:
      safeRecentlyViewed.length > 0
        ? safeRecentlyViewed
        : dummyRecentlyViewed,
  };
}