export interface ImageHostPattern {
  protocol: "http" | "https";
  hostname: string;
}

export const IMAGE_HOST_PATTERNS: ImageHostPattern[] = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "imagedelivery.net" },
  { protocol: "https", hostname: "cdn.shopify.com" },
  { protocol: "https", hostname: "cdn.dropshipzone.com.au" },
  { protocol: "https", hostname: "bambury.com.au" },
  { protocol: "https", hostname: "www.uhp.com.au" },
  { protocol: "https", hostname: "www.kaleidoscope.com.au" },
  { protocol: "https", hostname: "www.jasnor.com.au" },
  { protocol: "https", hostname: "www.johncoproductions.com" },
  { protocol: "https", hostname: "image.vevor.com" },
  { protocol: "https", hostname: "assets.shopperbeats.cloud" },
  { protocol: "https", hostname: "media-prod-use-1.mirakl.net" },
  { protocol: "https", hostname: "assets.costway.com" },
  { protocol: "https", hostname: "dngnxcmxnkyl5.cloudfront.net" },
  { protocol: "https", hostname: "perfumesw.com" },
  { protocol: "https", hostname: "pim-hub.com" },
  { protocol: "https", hostname: "www.ccwholesaleclothing.com" },
  { protocol: "https", hostname: "img.fragrancex.com" },
  { protocol: "https", hostname: "www.ccdemostore.com" },
  { protocol: "https", hostname: "static.songmics.com" },
  { protocol: "https", hostname: "www.homeroots.co" },
  { protocol: "https", hostname: "img-us.aosomcdn.com" },
  { protocol: "https", hostname: "benzara.com" },
  { protocol: "https", hostname: "melrose.solovue.com" },
  { protocol: "https", hostname: "dropship.nearlynatural.com" },
  { protocol: "http", hostname: "www.fastfurnishings.com" },
  { protocol: "https", hostname: "www.wonatrading.com" },
  { protocol: "https", hostname: "marketplace.sspo.com" },
  { protocol: "https", hostname: "**.su-cdn.com" },
  { protocol: "https", hostname: "www.greenlandhomefashions.com" },
];
