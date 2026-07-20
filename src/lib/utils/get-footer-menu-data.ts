import { API_ENDPOINTS } from "@/lib/constants/api";

// Get footer menu data from the API
export async function getFooterMenuData() {
  const results = await Promise.allSettled([
    fetch(`${API_ENDPOINTS.MENU.BASE_URL}/company`, { next: { revalidate: 3600 } }),
    fetch(`${API_ENDPOINTS.MENU.BASE_URL}/my-accounts`, { next: { revalidate: 3600 } }),
    fetch(`${API_ENDPOINTS.MENU.BASE_URL}/help-and-supports`, { next: { revalidate: 3600 } }),
    fetch(`${API_ENDPOINTS.MENU.BASE_URL}/legal`, { next: { revalidate: 3600 } }),
  ]);

  const [company, myAccount, helpSupport, legal] = await Promise.all(
    results.map(async (r) => {
      if (r.status === "rejected" || !r.value.ok) return null;
      return r.value.json();
    })
  );

  return { company, myAccount, helpSupport, legal };
}

// Static fallback footer menu data
export const FOOTER_LINKS_STATIC = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/cms/About-us" },
      { label: "Brands", href: "/brand" },
    ],
  },
  {
    title: "My Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "User Profile", href: "/user/personal-information" },
      { label: "My Cart", href: "/cart" },
      { label: "Track My Order", href: "/cms/track" },
    ],
  },
  {
    title: "Help & Support",
    links: [
      { label: "My Orders", href: "/user/orders" },
      { label: "Shipping & Delivery", href: "/cms/shipping-delivery" },
      { label: "Return & Warranty", href: "/cms/return-refunds" },
      { label: "Shop With Peace Of Mind", href: "/shop-with-peace" },
      { label: "Payment Policy", href: "/cms/payment-policy" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/cms/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/cms/privacy-policy" },
      { label: "Terms & Conditions", href: "/cms/terms-condition" },
      {
        label: "Intellectual Property Complaints",
        href: "/cms/intellectual-property-complaints",
      },
    ],
  },
];

export const paymentArr = ["visa", "payment", "american", "paypal", "afterpay", "zip"];

export const footerHighlights = [
  { img: "free-shipping", text: "Fast & Limited Free Shipping" },
  { img: "customer", text: "Expert Customer Service" },
  { img: "peace-mind", text: "Shop With Peace of Mind" },
  { img: "incredible", text: "Incredible Value Every Day" },
];



export const STATIC_SOCIAL_LINKS = [
  { id: "static-facebook", url: "https://www.facebook.com/login", icon_class: "facebook" },
  { id: "static-linkedin", url: "https://in.linkedin.com/", icon_class: "linkedin" },
  { id: "static-tiktok", url: "https://www.tiktok.com/", icon_class: "tiktok" },
  { id: "static-x", url: "https://x.com/", icon_class: "x" },
];