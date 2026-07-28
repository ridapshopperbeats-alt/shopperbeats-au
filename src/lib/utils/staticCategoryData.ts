import type { Category, Filter, Product, Review, Variant } from "@/types/product";
import type { MegaMenuCategory } from "@/types/megamenu";


export const staticMegaMenuCategories: Category[] = [
  {
    id: "static-electronics",
    name: "Electronics",
    slug: "static-electronics",
    icon_url:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=200&h=200&q=80",
    image_url:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&h=400&q=80",
    subcategories: [
      {
        id: "static-mobiles",
        name: "Mobiles",
        slug: "static-mobiles",
        icon_url:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-laptops",
        name: "Laptops",
        slug: "static-laptops",
        icon_url:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-gaming",
        name: "Gaming",
        slug: "static-gaming",
        icon_url:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=200&h=200&q=80",
      },
    ],
  },
  {
    id: "static-fashion",
    name: "Fashion",
    slug: "static-fashion",
    icon_url:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=200&h=200&q=80",
    image_url:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&h=400&q=80",
    subcategories: [
      {
        id: "static-mens-clothing",
        name: "Men's Clothing",
        slug: "static-mens-clothing",
        icon_url:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-womens-clothing",
        name: "Women's Clothing",
        slug: "static-womens-clothing",
        icon_url:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-kids-fashion",
        name: "Kids Fashion",
        slug: "static-kids-fashion",
        icon_url:
          "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-shoes",
        name: "Shoes",
        slug: "static-shoes",
        icon_url:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-watches",
        name: "Watches",
        slug: "static-watches",
        icon_url:
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-accessories",
        name: "Accessories",
        slug: "static-accessories",
        icon_url:
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=200&h=200&q=80",
      },
    ],
  },
  {
    id: "static-beauty",
    name: "Beauty",
    slug: "static-beauty",
    icon_url:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=200&h=200&q=80",
    image_url:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&h=400&q=80",
    subcategories: [
      {
        id: "static-skincare",
        name: "Skincare",
        slug: "static-skincare",
        icon_url:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-makeup",
        name: "Makeup",
        slug: "static-makeup",
        icon_url:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-haircare",
        name: "Haircare",
        slug: "static-haircare",
        icon_url:
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-fragrance",
        name: "Fragrance",
        slug: "static-fragrance",
        icon_url:
          "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=200&h=200&q=80",
      },
    ],
  },
  {
    id: "static-home-living",
    name: "Home & Living",
    slug: "static-home-living",
    icon_url:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=200&h=200&q=80",
    image_url:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&h=400&q=80",
    subcategories: [
      {
        id: "static-furniture",
        name: "Furniture",
        slug: "static-furniture",
        icon_url:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-decor",
        name: "Decor",
        slug: "static-decor",
        icon_url:
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-kitchen",
        name: "Kitchen",
        slug: "static-kitchen",
        icon_url:
          "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&h=200&q=80",
      },
    ],
  },
  {
    id: "static-sports-outdoor",
    name: "Sports & Outdoor",
    slug: "static-sports-outdoor",
    icon_url:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=200&h=200&q=80",
    image_url:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&h=400&q=80",
    subcategories: [
      {
        id: "static-fitness",
        name: "Fitness Equipment",
        slug: "static-fitness",
        icon_url:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-camping",
        name: "Camping & Hiking",
        slug: "static-camping",
        icon_url:
          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=200&h=200&q=80",
      },
    ],
  },
  {
    id: "static-toys-games",
    name: "Toys & Games",
    slug: "static-toys-games",
    icon_url:
      "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=200&h=200&q=80",
    image_url:
      "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=400&h=400&q=80",
    subcategories: [
      {
        id: "static-action-figures",
        name: "Action Figures",
        slug: "static-action-figures",
        icon_url:
          "https://images.unsplash.com/photo-1608889175638-9e58e2f0e2c5?auto=format&fit=crop&w=200&h=200&q=80",
      },
      {
        id: "static-board-games",
        name: "Board Games",
        slug: "static-board-games",
        icon_url:
          "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=200&h=200&q=80",
      },
    ],
  },
];

// Default category used by the bare `/static-category` route.
export const staticCategory: Category = staticMegaMenuCategories[1];

export const staticFilters: Filter[] = [
  {
    attribute: "Brand",
    values: [
      "Zara",
      "H&M",
      "Nike",
      "Adidas",
      "Gucci",
      "Levi's",
      "Ray-Ban",
      "Apple",
      "Samsung",
      "Sony",
      "Dell",
      "L'Oreal",
      "Maybelline",
      "IKEA",
    ],
  },
  {
    attribute: "Price",
    values: ["0-50", "50-100", "100-200", "200+"],
  },
  {
    attribute: "Special Offers",
    values: ["On Sale", "4 Stars & Up", "3 Stars & Up"],
  },
];

export type StaticListingProduct = Product & { created_at: string };

export const staticProducts: StaticListingProduct[] = [
  // ---------------- Fashion : Women's Clothing ----------------
  {
    id: "static-1",
    unique_code: "static-1",
    title: "Women's Floral Summer Dress",
    brand_name: "Zara",
    category_name: "Women's Clothing",
    category_slug: "static-womens-clothing",
    price: "79.99",
    rrp_price: "99.99",
    discounted_price: 79.99,
    discount_percentage: 20,
    stock: 25,
    images:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.8, total_reviews: 218 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-20T10:00:00.000Z",
  },
  {
    id: "static-2",
    unique_code: "static-2",
    title: "Casual Outfit Set",
    brand_name: "H&M",
    category_name: "Women's Clothing",
    category_slug: "static-womens-clothing",
    price: "69.99",
    rrp_price: "89.99",
    discounted_price: 69.99,
    discount_percentage: 22,
    stock: 0,
    images:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.7, total_reviews: 176 },
    tags: ["hotseller"],
    variants: [],
    created_at: "2026-07-18T10:00:00.000Z",
  },
  {
    id: "static-3",
    unique_code: "static-3",
    title: "Women's Summer Maxi Dress",
    brand_name: "Forever 21",
    category_name: "Women's Clothing",
    category_slug: "static-womens-clothing",
    price: "59.99",
    rrp_price: "79.99",
    discounted_price: 59.99,
    discount_percentage: 25,
    stock: 12,
    images:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.6, total_reviews: 132 },
    tags: ["bestseller"],
    variants: [],
    created_at: "2026-07-15T10:00:00.000Z",
  },
  {
    id: "static-4",
    unique_code: "static-4",
    title: "Women's Fashion Top",
    brand_name: "Mango",
    category_name: "Women's Clothing",
    category_slug: "static-womens-clothing",
    price: "49.99",
    rrp_price: "69.99",
    discounted_price: 49.99,
    discount_percentage: 29,
    stock: 30,
    images:
      "https://images.unsplash.com/photo-1525550133628-43e58e551e6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW4lMjB0b3BzfGVufDB8fDB8fHww",
    review_stats: { average_rating: 4.8, total_reviews: 198 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-25T10:00:00.000Z",
  },

  // ---------------- Fashion : Men's Clothing ----------------
  {
    id: "static-9",
    unique_code: "static-9",
    title: "Men's Stylish Jacket",
    brand_name: "GUESS",
    category_name: "Men's Clothing",
    category_slug: "static-mens-clothing",
    price: "119.99",
    rrp_price: "149.99",
    discounted_price: 119.99,
    discount_percentage: 20,
    stock: 14,
    images:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.9, total_reviews: 289 },
    tags: ["hotseller"],
    variants: [],
    created_at: "2026-07-08T10:00:00.000Z",
  },
  {
    id: "static-10",
    unique_code: "static-10",
    title: "Slim Fit Denim Jacket",
    brand_name: "Levi's",
    category_name: "Men's Clothing",
    category_slug: "static-mens-clothing",
    price: "89.99",
    rrp_price: "119.99",
    discounted_price: 89.99,
    discount_percentage: 25,
    stock: 20,
    images:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.9, total_reviews: 304 },
    tags: ["bestseller"],
    variants: [],
    created_at: "2026-07-01T10:00:00.000Z",
  },

  // ---------------- Fashion : Kids Fashion ----------------
  {
    id: "static-13",
    unique_code: "static-13",
    title: "Kids Casual Outfit Set",
    brand_name: "H&M",
    category_name: "Kids Fashion",
    category_slug: "static-kids-fashion",
    price: "34.99",
    rrp_price: "44.99",
    discounted_price: 34.99,
    discount_percentage: 22,
    stock: 22,
    images:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.6, total_reviews: 64 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-19T10:00:00.000Z",
  },

  // ---------------- Fashion : Shoes ----------------
  {
    id: "static-7",
    unique_code: "static-7",
    title: "Air Max Running Shoes",
    brand_name: "Nike",
    category_name: "Shoes",
    category_slug: "static-shoes",
    price: "129.99",
    rrp_price: "159.99",
    discounted_price: 129.99,
    discount_percentage: 19,
    stock: 40,
    images:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.8, total_reviews: 182 },
    tags: ["hotseller"],
    variants: [],
    created_at: "2026-07-22T10:00:00.000Z",
  },
  {
    id: "static-8",
    unique_code: "static-8",
    title: "Ultraboost Running Shoes",
    brand_name: "Adidas",
    category_name: "Shoes",
    category_slug: "static-shoes",
    price: "149.99",
    rrp_price: "189.99",
    discounted_price: 149.99,
    discount_percentage: 21,
    stock: 0,
    images:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.7, total_reviews: 96 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-12T10:00:00.000Z",
  },
  {
    id: "static-11",
    unique_code: "static-11",
    title: "GUCCI Ace Sneaker",
    brand_name: "Gucci",
    category_name: "Shoes",
    category_slug: "static-shoes",
    price: "450",
    rrp_price: "520",
    discounted_price: 450,
    discount_percentage: 13,
    stock: 3,
    images:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80",
    review_stats: { average_rating: 4.5, total_reviews: 52 },
    tags: ["new"],
    variants: [],
    created_at: "2026-06-28T10:00:00.000Z",
  },

  // ---------------- Fashion : Watches ----------------
  {
    id: "static-14",
    unique_code: "static-14",
    title: "Classic Analog Wrist Watch",
    brand_name: "Levi's",
    category_name: "Watches",
    category_slug: "static-watches",
    price: "129.99",
    rrp_price: "169.99",
    discounted_price: 129.99,
    discount_percentage: 24,
    stock: 18,
    images:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.6, total_reviews: 87 },
    tags: ["bestseller"],
    variants: [],
    created_at: "2026-06-30T10:00:00.000Z",
  },

  // ---------------- Fashion : Accessories ----------------
  {
    id: "static-5",
    unique_code: "static-5",
    title: "Silver Jewelry Set",
    brand_name: "Pandora",
    category_name: "Accessories",
    category_slug: "static-accessories",
    price: "189.99",
    rrp_price: "239.99",
    discounted_price: 189.99,
    discount_percentage: 21,
    stock: 8,
    images:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.9, total_reviews: 310 },
    tags: ["hotseller"],
    variants: [],
    created_at: "2026-07-10T10:00:00.000Z",
  },
  {
    id: "static-6",
    unique_code: "static-6",
    title: "Classic Sunglasses",
    brand_name: "Ray-Ban",
    category_name: "Accessories",
    category_slug: "static-accessories",
    price: "149.99",
    rrp_price: "189.99",
    discounted_price: 149.99,
    discount_percentage: 21,
    stock: 16,
    images:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.7, total_reviews: 175 },
    tags: ["bestseller"],
    variants: [],
    created_at: "2026-07-05T10:00:00.000Z",
  },
  {
    id: "static-12",
    unique_code: "static-12",
    title: "Classic Leather Wallet",
    brand_name: "Gucci",
    category_name: "Accessories",
    category_slug: "static-accessories",
    price: "89.99",
    rrp_price: "89.99",
    discounted_price: 89.99,
    discount_percentage: 0,
    stock: 0,
    images:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
    review_stats: { average_rating: 4.2, total_reviews: 18 },
    tags: ["bestseller"],
    variants: [],
    created_at: "2026-06-20T10:00:00.000Z",
  },

  // ---------------- Electronics : Mobiles ----------------
  {
    id: "static-15",
    unique_code: "static-15",
    title: "Flagship Smartphone 256GB",
    brand_name: "Apple",
    category_name: "Mobiles",
    category_slug: "static-mobiles",
    price: "999",
    rrp_price: "1099",
    discounted_price: 999,
    discount_percentage: 9,
    stock: 10,
    images:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.9, total_reviews: 512 },
    tags: ["hotseller"],
    variants: [],
    created_at: "2026-07-24T10:00:00.000Z",
  },
  {
    id: "static-16",
    unique_code: "static-16",
    title: "Android Smartphone 128GB",
    brand_name: "Samsung",
    category_name: "Mobiles",
    category_slug: "static-mobiles",
    price: "699",
    rrp_price: "799",
    discounted_price: 699,
    discount_percentage: 13,
    stock: 22,
    images:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.6, total_reviews: 340 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-16T10:00:00.000Z",
  },

  // ---------------- Electronics : Laptops ----------------
  {
    id: "static-17",
    unique_code: "static-17",
    title: "Ultra-Slim Laptop 15-inch",
    brand_name: "Dell",
    category_name: "Laptops",
    category_slug: "static-laptops",
    price: "1099",
    rrp_price: "1299",
    discounted_price: 1099,
    discount_percentage: 15,
    stock: 7,
    images:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.7, total_reviews: 128 },
    tags: ["bestseller"],
    variants: [],
    created_at: "2026-07-14T10:00:00.000Z",
  },

  // ---------------- Electronics : Gaming ----------------
  {
    id: "static-18",
    unique_code: "static-18",
    title: "Wireless Gaming Controller",
    brand_name: "Sony",
    category_name: "Gaming",
    category_slug: "static-gaming",
    price: "69.99",
    rrp_price: "79.99",
    discounted_price: 69.99,
    discount_percentage: 12,
    stock: 35,
    images:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.8, total_reviews: 260 },
    tags: ["hotseller"],
    variants: [],
    created_at: "2026-07-11T10:00:00.000Z",
  },

  // ---------------- Beauty : Skincare ----------------
  {
    id: "static-19",
    unique_code: "static-19",
    title: "Hydrating Skincare Set",
    brand_name: "L'Oreal",
    category_name: "Skincare",
    category_slug: "static-skincare",
    price: "39.99",
    rrp_price: "54.99",
    discounted_price: 39.99,
    discount_percentage: 27,
    stock: 45,
    images:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.5, total_reviews: 210 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-17T10:00:00.000Z",
  },

  // ---------------- Beauty : Makeup ----------------
  {
    id: "static-20",
    unique_code: "static-20",
    title: "Matte Lipstick & Eyeshadow Kit",
    brand_name: "Maybelline",
    category_name: "Makeup",
    category_slug: "static-makeup",
    price: "24.99",
    rrp_price: "34.99",
    discounted_price: 24.99,
    discount_percentage: 29,
    stock: 60,
    images:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.6, total_reviews: 178 },
    tags: ["bestseller"],
    variants: [],
    created_at: "2026-07-13T10:00:00.000Z",
  },

  // ---------------- Beauty : Haircare ----------------
  {
    id: "static-21",
    unique_code: "static-21",
    title: "Nourishing Shampoo & Conditioner Set",
    brand_name: "L'Oreal",
    category_name: "Haircare",
    category_slug: "static-haircare",
    price: "29.99",
    rrp_price: "39.99",
    discounted_price: 29.99,
    discount_percentage: 25,
    stock: 50,
    images:
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.4, total_reviews: 92 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-09T10:00:00.000Z",
  },

  // ---------------- Beauty : Fragrance ----------------
  {
    id: "static-25",
    unique_code: "static-25",
    title: "Luxury Perfume",
    brand_name: "Dior",
    category_name: "Fragrance",
    category_slug: "static-fragrance",
    price: "109.99",
    rrp_price: "139.99",
    discounted_price: 109.99,
    discount_percentage: 21,
    stock: 40,
    images:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.8, total_reviews: 120 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-21T10:00:00.000Z",
  },

  // ---------------- Home & Living : Furniture ----------------
  {
    id: "static-22",
    unique_code: "static-22",
    title: "Modern Fabric Sofa",
    brand_name: "IKEA",
    category_name: "Furniture",
    category_slug: "static-furniture",
    price: "599",
    rrp_price: "749",
    discounted_price: 599,
    discount_percentage: 20,
    stock: 5,
    images:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.7, total_reviews: 64 },
    tags: ["hotseller"],
    variants: [],
    created_at: "2026-07-06T10:00:00.000Z",
  },

  // ---------------- Home & Living : Decor ----------------
  {
    id: "static-23",
    unique_code: "static-23",
    title: "Minimalist Wall Art Set",
    brand_name: "IKEA",
    category_name: "Decor",
    category_slug: "static-decor",
    price: "44.99",
    rrp_price: "59.99",
    discounted_price: 44.99,
    discount_percentage: 25,
    stock: 30,
    images:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.5, total_reviews: 41 },
    tags: ["new"],
    variants: [],
    created_at: "2026-07-04T10:00:00.000Z",
  },

  // ---------------- Home & Living : Kitchen ----------------
  {
    id: "static-24",
    unique_code: "static-24",
    title: "Stainless Steel Cookware Set",
    brand_name: "IKEA",
    category_name: "Kitchen",
    category_slug: "static-kitchen",
    price: "129.99",
    rrp_price: "169.99",
    discounted_price: 129.99,
    discount_percentage: 24,
    stock: 17,
    images:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&h=600&q=80",
    review_stats: { average_rating: 4.6, total_reviews: 73 },
    tags: ["bestseller"],
    variants: [],
    created_at: "2026-07-02T10:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function findStaticCategoryBySlug(slug: string): Category | null {
  const search = (categories: Category[]): Category | null => {
    for (const cat of categories) {
      if (cat.slug === slug) return cat;
      if (cat.subcategories?.length) {
        const found = search(cat.subcategories);
        if (found) return found;
      }
    }
    return null;
  };

  return search(staticMegaMenuCategories);
}

function collectSlugs(category: Category): string[] {
  const slugs = category.slug ? [category.slug] : [];
  category.subcategories?.forEach((sub) => {
    slugs.push(...collectSlugs(sub));
  });
  return slugs;
}

export function getStaticProductsForCategory(
  category: Category,
): StaticListingProduct[] {
  const slugs = new Set(collectSlugs(category));
  return staticProducts.filter(
    (product) => product.category_slug && slugs.has(product.category_slug),
  );
}


const STATIC_CATEGORY_LISTING_HREF = "/static-category";

function toMegaMenuCategory(category: Category, level = 1): MegaMenuCategory {
  const slug = category.slug ?? category.id;
  const children = category.subcategories ?? [];

  return {
    id: category.id,
    name: category.name,
    slug,
    product_count: category.product_count ?? 0,
    href: STATIC_CATEGORY_LISTING_HREF,
    ...(level > 1 && { viewAll: STATIC_CATEGORY_LISTING_HREF }),
    subcategories: children.map((sub) => toMegaMenuCategory(sub, level + 1)),
    links: children.map((child) => ({
      name: child.name,
      href: STATIC_CATEGORY_LISTING_HREF,
      product_count: child.product_count ?? 0,
    })),
  };
}

export function getStaticMegaMenuData(): MegaMenuCategory[] {
  return staticMegaMenuCategories.map((category) => toMegaMenuCategory(category));
}

function slugifyBrand(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface SpecEntry {
  label: string;
  value: string;
}

interface CategoryVariantAxis {
  name: string;
  values: string[];
  priceDelta?: number[];
}

interface CategoryTemplate {
  shortDescription: (p: StaticListingProduct) => string;
  description: (p: StaticListingProduct) => string;
  features: (p: StaticListingProduct) => string[];
  specs: (p: StaticListingProduct) => SpecEntry[];
  variantAxes?: (p: StaticListingProduct) => CategoryVariantAxis[];
  shipsFrom: string;
  handlingDays: number;
  shippingCost: number;
  careInstructions?: string;
  warranty?: string;
}

const APPAREL_CARE = "Machine wash cold with like colors. Do not bleach. Tumble dry low.";

const categoryTemplates: Record<string, CategoryTemplate> = {
  "Women's Clothing": {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — a wardrobe staple cut for an easy, flattering fit.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} is designed for everyday comfort without compromising on style. ` +
      `Made from a breathable, soft-touch fabric blend, it moves with you from morning errands to evening plans. ` +
      `A relaxed silhouette and considered detailing make it easy to dress up or down.`,
    features: () => [
      "Soft, breathable fabric blend",
      "Relaxed, true-to-size fit",
      "Fade-resistant color",
      "Easy to style up or down",
      "Machine washable",
    ],
    specs: () => [
      { label: "Material", value: "Cotton-blend" },
      { label: "Fit", value: "Regular" },
      { label: "Pattern", value: "Solid / Printed" },
      { label: "Country of Origin", value: "Imported" },
    ],
    variantAxes: () => [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Black", "Rose"] },
    ],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
    careInstructions: APPAREL_CARE,
  },
  "Men's Clothing": {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — sharp tailoring built for daily wear.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} pairs a modern cut with durable, comfortable fabric. ` +
      `Reinforced stitching and a versatile colorway make it a reliable addition to any rotation, ` +
      `whether you're layering it up or wearing it on its own.`,
    features: () => [
      "Durable, reinforced stitching",
      "Breathable everyday fabric",
      "Modern regular fit",
      "Versatile colorway",
      "Machine washable",
    ],
    specs: () => [
      { label: "Material", value: "Cotton-blend Denim" },
      { label: "Fit", value: "Regular" },
      { label: "Closure", value: "Zip / Button" },
      { label: "Country of Origin", value: "Imported" },
    ],
    variantAxes: () => [
      { name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color", values: ["Black", "Blue"] },
    ],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
    careInstructions: APPAREL_CARE,
  },
  "Kids Fashion": {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — soft, durable and easy to move in.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} is made with sensitive skin in mind — soft, breathable ` +
      `fabric that holds up to active days and frequent washing, in a fun, comfortable fit kids love.`,
    features: () => [
      "Soft on sensitive skin",
      "Built for active play",
      "Easy-care fabric",
      "Fade-resistant color",
      "Machine washable",
    ],
    specs: () => [
      { label: "Material", value: "Cotton-blend" },
      { label: "Fit", value: "Regular" },
      { label: "Recommended Age", value: "3 - 8 years" },
      { label: "Country of Origin", value: "Imported" },
    ],
    variantAxes: () => [{ name: "Size", values: ["2-3Y", "4-5Y", "6-7Y"] }],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
    careInstructions: APPAREL_CARE,
  },
  Shoes: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — everyday comfort built to go the distance.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} combines a cushioned midsole with a breathable upper for ` +
      `all-day comfort. A grippy outsole and supportive fit make it equally suited to workouts, ` +
      `commutes or casual wear.`,
    features: () => [
      "Cushioned, supportive midsole",
      "Breathable mesh upper",
      "Durable, grippy outsole",
      "Lightweight construction",
      "True-to-size fit",
    ],
    specs: () => [
      { label: "Upper Material", value: "Mesh / Synthetic" },
      { label: "Sole", value: "Rubber" },
      { label: "Closure Type", value: "Lace-up" },
      { label: "Country of Origin", value: "Imported" },
    ],
    variantAxes: () => [{ name: "Size", values: ["7", "8", "9", "10", "11"] }],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
  },
  Watches: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — a timeless accessory for every occasion.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} pairs precise quartz movement with a scratch-resistant face, ` +
      `set in a durable case and comfortable strap — a versatile piece that carries from the office to a night out.`,
    features: () => [
      "Precision quartz movement",
      "Scratch-resistant crystal face",
      "Water-resistant up to 50m",
      "Adjustable strap",
      "1 year warranty",
    ],
    specs: () => [
      { label: "Case Diameter", value: "40mm" },
      { label: "Movement", value: "Quartz" },
      { label: "Water Resistance", value: "50m" },
      { label: "Strap Material", value: "Genuine Leather" },
    ],
    variantAxes: () => [{ name: "Color", values: ["Black", "Silver", "Rose Gold"] }],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
    warranty: "1 Year Manufacturer Warranty",
  },
  Accessories: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — a finishing touch for any outfit.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} is crafted from premium materials with careful attention to ` +
      `detail, designed to complement any outfit while standing up to daily use.`,
    features: () => [
      "Premium materials",
      "Compact, everyday design",
      "Sturdy hardware",
      "Gift-ready packaging",
    ],
    specs: () => [
      { label: "Material", value: "Premium Blend" },
      { label: "Style", value: "Unisex" },
      { label: "Country of Origin", value: "Imported" },
    ],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
  },
  Mobiles: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — flagship performance in your pocket.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} delivers a fast processor, all-day battery life and a ` +
      `high-resolution display, backed by a versatile camera system for everyday photography.`,
    features: () => [
      "High-resolution display",
      "All-day battery life",
      "Fast-charging support",
      "Multi-lens camera system",
      "5G connectivity",
    ],
    specs: () => [
      { label: "Display", value: "6.5\" OLED" },
      { label: "Processor", value: "Octa-core" },
      { label: "RAM", value: "8GB" },
      { label: "Battery", value: "4500mAh" },
    ],
    variantAxes: () => [
      { name: "Storage", values: ["128GB", "256GB"], priceDelta: [0, 100] },
      { name: "Color", values: ["Black", "Blue"] },
    ],
    shipsFrom: "USA",
    handlingDays: 3,
    shippingCost: 0,
    warranty: "1 Year Manufacturer Warranty",
  },
  Laptops: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — powerful, portable, and built for everyday productivity.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} pairs a slim aluminum chassis with a fast processor and ` +
      `crisp display, giving you the performance you need whether you're working, streaming or creating.`,
    features: () => [
      "Slim, lightweight chassis",
      "Fast SSD storage",
      "Full HD display",
      "All-day battery life",
      "Backlit keyboard",
    ],
    specs: () => [
      { label: "Processor", value: "Intel Core i5" },
      { label: "RAM", value: "16GB" },
      { label: "Display", value: "15.6\" Full HD" },
      { label: "Battery Life", value: "Up to 10 hours" },
    ],
    variantAxes: () => [
      { name: "Storage", values: ["256GB SSD", "512GB SSD"], priceDelta: [0, 120] },
    ],
    shipsFrom: "USA",
    handlingDays: 3,
    shippingCost: 0,
    warranty: "1 Year Manufacturer Warranty",
  },
  Gaming: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — responsive controls built for serious play sessions.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} offers low-latency wireless connectivity, a long-lasting ` +
      `battery and an ergonomic grip so you can stay comfortable and competitive through marathon sessions.`,
    features: () => [
      "Low-latency wireless connection",
      "Ergonomic, textured grip",
      "Long-lasting rechargeable battery",
      "Broad device compatibility",
    ],
    specs: () => [
      { label: "Connectivity", value: "Bluetooth / Wireless Dongle" },
      { label: "Battery Life", value: "Up to 20 hours" },
      { label: "Compatibility", value: "PC / Console / Mobile" },
    ],
    variantAxes: () => [{ name: "Color", values: ["Black", "White"] }],
    shipsFrom: "USA",
    handlingDays: 3,
    shippingCost: 0,
    warranty: "1 Year Manufacturer Warranty",
  },
  Skincare: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — a hydrating routine for healthy-looking skin.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} is formulated with nourishing, dermatologist-tested ingredients ` +
      `to hydrate and even skin tone, fitting easily into your daily routine.`,
    features: () => [
      "Dermatologist tested",
      "Suitable for all skin types",
      "Free from harsh sulfates",
      "Cruelty-free",
    ],
    specs: () => [
      { label: "Skin Type", value: "All Skin Types" },
      { label: "Key Ingredients", value: "Hyaluronic Acid, Vitamin E" },
      { label: "Cruelty-Free", value: "Yes" },
    ],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
  },
  Makeup: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — long-wearing color that keeps up with your day.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} delivers rich, buildable color with a lightweight, ` +
      `long-wearing formula that won't feel heavy on the skin.`,
    features: () => [
      "Long-wearing, buildable color",
      "Lightweight, non-cakey formula",
      "Cruelty-free",
      "Suitable for daily wear",
    ],
    specs: () => [
      { label: "Finish", value: "Matte" },
      { label: "Cruelty-Free", value: "Yes" },
      { label: "Skin Type", value: "All Skin Types" },
    ],
    variantAxes: () => [{ name: "Shade", values: ["Classic Red", "Nude Rose", "Berry"] }],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
  },
  Haircare: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — nourishing care for softer, healthier hair.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} cleanses and conditions without stripping natural oils, ` +
      `leaving hair feeling soft, smooth and manageable.`,
    features: () => [
      "Sulfate-free formula",
      "Suitable for daily use",
      "Nourishes and softens",
      "Cruelty-free",
    ],
    specs: () => [
      { label: "Hair Type", value: "All Hair Types" },
      { label: "Key Ingredients", value: "Argan Oil, Keratin" },
      { label: "Cruelty-Free", value: "Yes" },
    ],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
  },
  Fragrance: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — a signature scent for everyday wear.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} opens with bright top notes and settles into a warm, ` +
      `long-lasting base — a versatile fragrance suited to both day and evening wear.`,
    features: () => [
      "Long-lasting scent",
      "Layered top, heart and base notes",
      "Elegant, gift-ready bottle",
      "Suitable for everyday wear",
    ],
    specs: () => [
      { label: "Volume", value: "100ml" },
      { label: "Concentration", value: "Eau de Parfum" },
      { label: "Fragrance Family", value: "Floral / Woody" },
    ],
    shipsFrom: "SBAU",
    handlingDays: 2,
    shippingCost: 0,
  },
  Furniture: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — comfortable, durable design for everyday living.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} is built on a sturdy frame with high-density cushioning, ` +
      `upholstered in an easy-clean fabric — designed to hold up to daily use while staying comfortable.`,
    features: () => [
      "Sturdy hardwood frame",
      "High-density foam cushioning",
      "Easy-clean upholstery",
      "Simple assembly",
    ],
    specs: () => [
      { label: "Material", value: "Fabric / Hardwood Frame" },
      { label: "Assembly Required", value: "Yes" },
      { label: "Weight Capacity", value: "300kg" },
    ],
    variantAxes: () => [{ name: "Color", values: ["Grey", "Beige"] }],
    shipsFrom: "Local 3PL",
    handlingDays: 5,
    shippingCost: 49.99,
  },
  Decor: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — an easy way to refresh any room.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} adds a considered finishing touch to any space, made from ` +
      `quality materials designed to look great for years to come.`,
    features: () => ["Ready to hang / display", "Quality, fade-resistant materials", "Lightweight"],
    specs: () => [
      { label: "Material", value: "Wood / Canvas" },
      { label: "Mounting", value: "Wall-mounted" },
    ],
    shipsFrom: "Local 3PL",
    handlingDays: 3,
    shippingCost: 9.99,
  },
  Kitchen: {
    shortDescription: (p) =>
      `${p.title} from ${p.brand_name} — reliable, everyday cookware for the home chef.`,
    description: (p) =>
      `The ${p.title} by ${p.brand_name} is built with even heat distribution and a durable finish, ` +
      `so you can cook confidently and clean up in minutes.`,
    features: () => [
      "Even heat distribution",
      "Durable, scratch-resistant finish",
      "Oven and dishwasher safe",
      "Ergonomic handles",
    ],
    specs: () => [
      { label: "Material", value: "Stainless Steel" },
      { label: "Dishwasher Safe", value: "Yes" },
      { label: "Set Includes", value: "8 Pieces" },
    ],
    shipsFrom: "Local 3PL",
    handlingDays: 4,
    shippingCost: 14.99,
  },
};

const DEFAULT_TEMPLATE: CategoryTemplate = {
  shortDescription: (p) => `${p.title} from ${p.brand_name}.`,
  description: (p) =>
    `The ${p.title} by ${p.brand_name} is a quality pick from our ${p.category_name} range, ` +
    `chosen for its reliable build and everyday value.`,
  features: () => ["Quality materials", "Everyday reliability", "Great value"],
  specs: () => [{ label: "Brand", value: "" }],
  shipsFrom: "SBAU",
  handlingDays: 3,
  shippingCost: 0,
};

const REVIEWERS = [
  "Olivia M.",
  "Ethan R.",
  "Sophia K.",
  "Liam P.",
  "Ava T.",
  "Noah B.",
  "Isabella C.",
  "Mason D.",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function buildReviews(product: StaticListingProduct): Review[] {
  const avgRating = product.review_stats?.average_rating ?? 4.5;
  const seed = hashString(product.id ?? product.unique_code ?? "");
  const comments = [
    `Really happy with this ${(product.title ?? "product").toLowerCase()} — matches the photos and feels well made.`,
    `Good value for the price. Delivery was quick and it arrived well packaged.`,
    `Exactly what I was looking for from ${product.brand_name}. Would buy again.`,
  ];

  return comments.map((comment, index) => ({
    id: `${product.id}-review-${index + 1}`,
    user: REVIEWERS[(seed + index) % REVIEWERS.length],
    reviewer_name: REVIEWERS[(seed + index) % REVIEWERS.length],
    rating: Math.max(3, Math.min(5, Math.round(avgRating) - (index === 2 ? 1 : 0))),
    comment,
    created_at: new Date(
      new Date(product.created_at).getTime() - index * 4 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    reviewer_profile_image: null,
    images: null,
  }));
}

function buildVariants(
  product: StaticListingProduct,
  axes: CategoryVariantAxis[],
): Variant[] {
  const combos: { name: string; value: string }[][] = [[]];

  axes.forEach((axis) => {
    const next: { name: string; value: string }[][] = [];
    combos.forEach((combo) => {
      axis.values.forEach((value) => {
        next.push([...combo, { name: axis.name, value }]);
      });
    });
    combos.length = 0;
    combos.push(...next);
  });

  const baseStock = product.stock ?? 10;
  const baseImage =
    typeof product.images === "string" ? product.images : undefined;

  return combos.map((attributes, index) => {
    const priceDelta = axes.reduce((total, axis, axisIndex) => {
      const selected = attributes[axisIndex]?.value;
      const valueIndex = axis.values.indexOf(selected);
      return total + (axis.priceDelta?.[valueIndex] ?? 0);
    }, 0);

    const stockForVariant = Math.max(
      0,
      Math.round(baseStock / combos.length) + ((index * 3) % 5) - 2,
    );

    return {
      id: `${product.id}-v${index + 1}`,
      status: "active",
      price: Number(product.discounted_price ?? product.price ?? 0) + priceDelta,
      rrp_price: product.rrp_price,
      stock: baseStock === 0 ? 0 : Math.max(1, stockForVariant),
      sku: `${product.unique_code}-${index + 1}`,
      images: baseImage ? [{ image_url: baseImage, is_main: true }] : undefined,
      attributes,
    };
  });
}

function buildGalleryImages(
  product: StaticListingProduct,
): { image_url: string; is_main: boolean; image_order: number }[] {
  const own = typeof product.images === "string" ? product.images : undefined;

  // Only ever show this product's own photo — never borrow another
  // product's image just to pad out a "multi-angle" gallery.
  if (!own) return [];

  return [{ image_url: own, is_main: true, image_order: 0 }];
}

export interface StaticProductDetail extends Product {
  specifications: SpecEntry[];
  shortDescription: string;
}

const staticDetailCache = new Map<string, StaticProductDetail>();

export function getStaticProductDetail(
  idOrCode: string,
): StaticProductDetail | null {
  const cached = staticDetailCache.get(idOrCode);
  if (cached) return cached;

  const base = staticProducts.find(
    (p) => p.id === idOrCode || p.unique_code === idOrCode,
  );
  if (!base) return null;

  const template = categoryTemplates[base.category_name || ""] || DEFAULT_TEMPLATE;
  const axes = template.variantAxes?.(base) || [];
  const variants = axes.length > 0 ? buildVariants(base, axes) : [];

  const detail: StaticProductDetail = {
    ...base,
    slug: base.unique_code,
    description: template.description(base),
    shortDescription: template.shortDescription(base),
    specifications: template.specs(base),
    key_features: template.features(base).join("<br>"),
    images: buildGalleryImages(base),
    variants,
    reviews: buildReviews(base),
    sku: `${(base.unique_code || base.id || "SKU").toUpperCase()}`,
    brand_slug: slugifyBrand(base.brand_name || "brand"),
    vendor_id: "static-vendor",
    ships_from_location: template.shipsFrom,
    handling_time_days: template.handlingDays,
    free_shipping: template.shippingCost === 0,
    fast_dispatch: template.handlingDays <= 2,
    care_instructions: template.careInstructions,
    warranty: template.warranty,
    category_id: base.category_slug,
  };

  staticDetailCache.set(idOrCode, detail);
  return detail;
}

export function getStaticProductShippingCost(product: Product): number {
  const template = categoryTemplates[product.category_name || ""] || DEFAULT_TEMPLATE;
  return template.shippingCost;
}

const MIN_RELATED_PRODUCTS = 6;

export function getStaticRelatedProducts(
  product: Product,
  limit = 10,
): StaticListingProduct[] {
  const sameCategory = staticProducts.filter(
    (p) => p.category_slug === product.category_slug && p.id !== product.id,
  );

  const minCount = Math.min(MIN_RELATED_PRODUCTS, staticProducts.length - 1);

  if (sameCategory.length >= minCount) {
    return sameCategory.slice(0, limit);
  }

  const usedIds = new Set(sameCategory.map((p) => p.id));
  usedIds.add(product.id ?? "");

  const filler = staticProducts.filter((p) => !usedIds.has(p.id));

  return [...sameCategory, ...filler].slice(0, Math.max(limit, minCount));
}

export interface StaticBreadcrumbEntry {
  name: string;
  path: string;
}

export function findStaticBreadcrumbPath(
  categorySlug: string | undefined,
): StaticBreadcrumbEntry[] {
  if (!categorySlug) return [];

  const search = (
    categories: Category[],
    trail: StaticBreadcrumbEntry[],
  ): StaticBreadcrumbEntry[] | null => {
    for (const cat of categories) {
      const nextTrail = [
        ...trail,
        { name: cat.name, path: `/static-category/${cat.slug}` },
      ];

      if (cat.slug === categorySlug) return nextTrail;

      if (cat.subcategories?.length) {
        const found = search(cat.subcategories, nextTrail);
        if (found) return found;
      }
    }
    return null;
  };

  return search(staticMegaMenuCategories, []) || [];
}
