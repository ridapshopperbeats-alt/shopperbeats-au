"use client";

import Image from "next/image";
import Button from "./Button";
import ScrollToTopLink from "./ScrollToTopLink";
import { useSubscribeToMailingListMutation } from "@/lib/redux/apis/marketing-api";
import { useGetSocialMediaLinksQuery } from "@/lib/redux/apis/auth-api";
import { useState } from "react";
import { toast } from "react-toastify";
import { FooterMenuData } from "@/types/menu";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

const FOOTER_LINKS_STATIC = [
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

export default function Footer({
  footerMenuData,
}: {
  footerMenuData: FooterMenuData;
}) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [subscribeToMailingList, { isLoading: isSubscribing }] =
    useSubscribeToMailingListMutation();
  const { data: socialLinks } = useGetSocialMediaLinksQuery();
  const [email, setEmail] = useState("");

  const footerMenus = [
    { title: "Company", data: footerMenuData?.company },
    { title: "My Account", data: footerMenuData?.myAccount },
    { title: "Help & Support", data: footerMenuData?.helpSupport },
    { title: "Legal", data: footerMenuData?.legal },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const result = await subscribeToMailingList({ email }).unwrap();
      const successMessage =
        result?.response?.response ||
        result?.message ||
        "Successfully subscribed to mailing list!";

      setEmail("");
      toast.success(successMessage);
    } catch (error) {
      const err = error as {
        data?: { response?: { response?: string }; message?: string };
      };
      const errorMessage =
        err?.data?.response?.response ||
        err?.data?.message ||
        "Failed to subscribe. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="page-footer">
      <div className="pt-6">
        <div className=" bg-white p-5 md:p-[30px]">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { img: "free-shipping", text: "Fast & Limited Free Shipping" },
              { img: "customer", text: "Expert Customer Service" },
              { img: "peace-mind", text: "Shop With Peace of Mind" },
              { img: "incredible", text: "Incredible Value Every Day" },
            ].map((item) => (
              <div
                key={item.img}
                className="group flex items-center gap-4 cursor-pointer"
              >
                <div className="w-[105px] h-[105px] rounded-full bg-[#FFB30F] flex items-center justify-center transition-all duration-300 group-hover:bg-[#042A89]">
                  <Image
                    src={`/images/${item.img}.svg`}
                    alt={item.text}
                    width={62}
                    height={42}
                    className="transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                  />
                </div>

                <p className="text-[16px] lg:text-[18px] font-bold leading-[22px] text-black max-w-[170px]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer>
        <div className="px-[30px] lg:px-[100px]">
          <div className="flex flex-wrap">
            {footerMenus.map((section) => {
              const staticFallback = FOOTER_LINKS_STATIC.find(
                (staticSection) => staticSection.title === section.title,
              );

              let items: { label: string; href: string }[] = [];
              if (section.data?.items) {
                items = section.data.items.map((item) => ({
                  label: item.title,
                  href: item.url,
                }));
              } else if (staticFallback) {
                items = staticFallback.links;
              }

              // Filter links based on authentication state for "My Account"
              if (section.title === "My Account") {
                items = items.filter((link) => {
                  const href = link.href.toLowerCase();
                  if (isAuthenticated) {
                    // Hide Login and Sign up when authenticated
                    return (
                      !href.includes("/login") && !href.includes("/signup")
                    );
                  } else {
                    // Hide User Profile when not authenticated
                    return !href.includes("/user/personal-information");
                  }
                });
              }

              if (section.title === "Help & Support") {
                items = items
                  .map((link) => {
                    const href = link.href.toLowerCase();

                    // Change "My Orders" URL based on auth
                    if (href.includes("/user/orders")) {
                      return {
                        ...link,
                        href: isAuthenticated ? "/user/orders" : "/login",
                      };
                    }

                    return link;
                  })
                  .filter((link) => {
                    const href = link.href.toLowerCase();

                    if (isAuthenticated) {
                      // Hide Login & Signup after login
                      return (
                        !href.includes("/login") && !href.includes("/signup")
                      );
                    }

                    // Hide Signup/Login duplicates if needed
                    return true;
                  });
              }

              return (
                <div
                  className="footer-block flex flex-col gap-[20px]"
                  key={section.title}
                >
                  <h5 className="text-white font-bold leading-[28px] text-[20px]">
                    {section.title}
                  </h5>
                  {items.length > 0 ? (
                    <ul>
                      {items.map((link) => (
                        <li key={link.href}>
                          <ScrollToTopLink href={link.href}>
                            {link.label}
                          </ScrollToTopLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}

            {/* Newsletter */}
            <div className="footer-block footer-newsletter">
              <h5 className="text-white">JOIN OUR MAILING LIST</h5>
              <p style={{ marginTop: "10px" }}>
                Enter your email to get $10 off and free shipping
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  aria-label="Subscribe"
                  disabled={isSubscribing}
                >
                  <Image
                    src="/images/arrow-right.svg"
                    alt="Subscribe"
                    width={20}
                    height={20}
                  />
                </Button>
              </form>

              <ul className="social">
                {socialLinks?.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className={`fa-brands fa-${item.icon_class}`}></i>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-wrap md:flex-nowrap justify-between">
            <p className="pb-4 hidden sm:block">
              © 2026 Shopperbeats Pty Ltd (ABN 32 637 549 770). All Rights
              Reserved
            </p>

            <div className="payment flex justify-center md:justify-start mx-auto md:mx-0">
              {["visa", "payment", "american", "paypal", "afterpay", "zip"].map(
                (item) => (
                  <Image
                    key={item}
                    src={`/images/${item}.svg`}
                    alt={item}
                    width={40}
                    height={25}
                  />
                ),
              )}
            </div>
            <p className="pt-4 text-center block sm:hidden">
              © 2026 Shopperbeats Pty Ltd (ABN 32 637 549 770). All Rights
              Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
