"use client";

import Image from "next/image";
import Button from "../common/Button";
import ScrollToTopLink from "./ScrollToTopLink";
import { useSubscribeToMailingListMutation } from "@/lib/redux/apis/marketing-api";
import { useGetSocialMediaLinksQuery } from "@/lib/redux/apis/auth-api";
import { useState } from "react";
import { toast } from "react-toastify";
import { FooterMenuData } from "@/types/menu";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  FOOTER_LINKS_STATIC,
  footerHighlights,
  paymentArr,
  STATIC_SOCIAL_LINKS,
} from "@/lib/utils/get-footer-menu-data";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaPinterestP,
  FaSnapchatGhost,
} from "react-icons/fa";
import { FaXTwitter, FaTiktok, FaThreads, FaChevronDown } from "react-icons/fa6";

const SOCIAL_ICONS: Record<string, React.ComponentType> = {
  facebook: FaFacebookF,
  facebook_f: FaFacebookF,
  "facebook-f": FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  linkedin_in: FaLinkedinIn,
  "linkedin-in": FaLinkedinIn,
  twitter: FaXTwitter,
  "x-twitter": FaXTwitter,
  x_twitter: FaXTwitter,
  x: FaXTwitter,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  pinterest: FaPinterestP,
  pinterest_p: FaPinterestP,
  "pinterest-p": FaPinterestP,
  snapchat: FaSnapchatGhost,
  snapchat_ghost: FaSnapchatGhost,
  threads: FaThreads,
};

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const socialItems =
    socialLinks && socialLinks.length > 0 ? socialLinks : STATIC_SOCIAL_LINKS;

  const renderSocialIcons = () => (
    <ul className="social">
      {socialItems.map((item) => {
        // cast to any to allow passing className prop to icon components
        const Icon = SOCIAL_ICONS[item.icon_class.toLowerCase()] as any;
        return (
          <li key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {Icon ? (
                <Icon className="text-[#FFF] text-[18.61px] font-normal leading-normal" />
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );

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
      <div className="pt-0">
        <div className="footer-highlights-wrapper shadow-[0px_0px_16.1px_0px_#8E8E8E40] mt-6">
          <div className="footer-highlights-grid">
            {footerHighlights.map((item) => (
              <div key={item.img} className="group footer-highlight-item">
                <div className="footer-highlight-icon">
                  <Image
                    src={`/images/${item.img}.svg`}
                    alt={item.text}
                    width={item.width}
                    height={item.height}
                    className="footer-highlight-img"
                  />
                </div>

                <p className="footer-highlight-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-container">
          <div className="footer-menu-row">
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
                      !href.includes("/login") && !href.includes("/sign-up")
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
                        !href.includes("/login") && !href.includes("/sign-up")
                      );
                    }

                    // Hide Signup/Login duplicates if needed
                    return true;
                  });
              }

              return (
                <div
                  className="footer-block footer-menu-block"
                  key={section.title}
                >
                  <h5
                    className="footer-section-title footer-accordion-toggle [font-variant:all-small-caps]"
                    onClick={() => toggleSection(section.title)}
                  >
                    {section.title}
                    <FaChevronDown
                      className={`footer-accordion-chevron ${
                        openSections[section.title] ? "is-open" : ""
                      }`}
                    />
                  </h5>
                  {items.length > 0 ? (
                    <div
                      className={`footer-accordion-panel ${
                        openSections[section.title] ? "is-open" : ""
                      }`}
                    >
                      <ul>
                        {items.map((link) => (
                          <li key={link.href}>
                            <ScrollToTopLink href={link.href}>
                              {link.label}
                            </ScrollToTopLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* Newsletter */}
            <div className="footer-block footer-newsletter">
              <h5 className="text-[16px] font-extrabold text-white leading-[28px] leading-[normal]">JOIN OUR MAILING LIST</h5>
              <p className="footer-newsletter-desc">
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
                    width={21}
                    height={14}
                  />
                </Button>
              </form>

              {renderSocialIcons()}
            </div>

            {/* Standalone social row, shown only on mobile below the accordion menus */}
            <div className="footer-block footer-social-mobile">
              {renderSocialIcons()}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom-bar">
            <p className="footer-copyright-desktop">
              © 2026 Shopperbeats Pty Ltd (ABN 32 637 549 770). All Rights
              Reserved
            </p>

            <div className="payment">
              {paymentArr.map((item) => (
                <Image
                  key={item}
                  src={`/images/${item}.svg`}
                  alt={item}
                  width={40}
                  height={25}
                />
              ))}
            </div>
            <p className="footer-copyright-mobile">
              © 2026 Shopperbeats Pty Ltd (ABN 32 637 549 770). All Rights
              Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
