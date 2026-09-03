"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { FAQItem, useGetFaqsQuery } from "@/lib/redux/apis/faq-api";
import Accordion from "@/components/common/Accordion";
import ContactBanner from "@/components/common/ContactBanner";


const faqGridMeta: Record<string, { title: string; description: string; icon: string }> = {
  orders: {
    title: "My Orders",
    description: "Track orders, check delivery status, cancellations, and order history.",
    icon: "/images/cms/orders.svg",
  },
  contact: {
    title: "Contact Us",
    description: "Get in touch with our team for queries, feedback, or assistance.",
    icon: "/images/cms/contact.svg",
  },
  shipping: {
    title: "Shipping Information",
    description: "Learn about delivery timelines, shipping charges, and service areas.",
    icon: "/images/cms/shopping.svg",
  },
  support: {
    title: "Technical Support",
    description: "Facing issues? Get help with technical problems and troubleshooting.",
    icon: "/images/cms/technical.svg",
  },
  returns: {
    title: "Returns & Refunds",
    description: "Understand return policies, refund process, and replacement options.",
    icon: "/images/cms/return-refund.svg",
  },
  account: {
    title: "My Account",
    description: "Manage your profile, login details, password, and account settings.",
    icon: "/images/cms/accounts.svg",
  },
  payment: {
    title: "Payment & Checkout",
    description: "Explore payment options, billing issues, and checkout process.",
    icon: "/images/cms/billing.svg",
  },
  warranty: {
    title: "Warranty & Returns",
    description: "Check warranty coverage, claims process, and product support.",
    icon: "/images/cms/return-refund.svg",
  },
  general: {
    title: "General Inquiries",
    description: "Find answers to common questions about our services and policies.",
    icon: "/images/cms/accounts.svg",
  }
};

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: faqApiData, isLoading, isError } = useGetFaqsQuery();

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!trimmedQuery || !faqApiData) return [];
    return faqApiData
      .filter(
        (item) =>
          item.question?.toLowerCase().includes(trimmedQuery) ||
          item.answer?.toLowerCase().includes(trimmedQuery),
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [trimmedQuery, faqApiData]);

  const faqsByType = useMemo(() => {
    if (!faqApiData) return {};
    const grouped: Record<string, FAQItem[]> = {};
    faqApiData.forEach((item) => {
      const typeKey = (item.type || "general").toLowerCase();
      if (!grouped[typeKey]) {
        grouped[typeKey] = [];
      }
      grouped[typeKey].push(item);
    });
    for (const key in grouped) {
      grouped[key].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return grouped;
  }, [faqApiData]);

  const dynamicTabs = useMemo(() => {
    return Object.keys(faqsByType).map(type => {
      const predefined = faqGridMeta[type];
      return {
        key: type,
        title: predefined ? predefined.title : type.charAt(0).toUpperCase() + type.slice(1),
        description: predefined ? predefined.description : `Questions about ${type}`,
        icon: predefined ? predefined.icon : "/images/cms/account.svg"
      };
    });
  }, [faqsByType]);

  useEffect(() => {
    if (dynamicTabs.length > 0 && !activeTab) {
      setActiveTab(dynamicTabs[0].key);
    }
  }, [dynamicTabs, activeTab]);


  return (
    <div className="faq-page">
      
      <div className="relative w-full h-[218px] overflow-hidden">
        <Image
          src="/faq1.webp"
          alt="FAQ Banner"
          width={100}
          height={218}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[733px] h-[153px] flex flex-col gap-5">

            <h1 style={{
              color: "white",
              fontSize: "30px",
              fontWeight: 800,
              lineHeight: "1.25",
              textAlign: "center",
            }}>
              How Can We Help?
            </h1>

            <p style={{
              color: "white",
              fontSize: "clamp(14px, 2vw, 18px)",
              fontWeight: 600,
              textAlign: "center",
            }}>
              Everything You Need To Know About All The Things
            </p>

            <form
              className="relative w-full px-4 md:px-0 max-w-[733px] h-[53px]"
              onSubmit={(e) => e.preventDefault()}
              role="search"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a product code or ask us a question"
                aria-label="Search FAQs"
                className="!rounded-[50px]"
                style={{
                  width: "100%",
                  height: "53px",
                  paddingLeft: "20px",
                  paddingRight: "130px",
                  fontSize: "16px",
                  outline: "none",
                  border: "none",
                }}
              />

              <button
                type="submit"
                className="absolute right-[20px] md:right-[8px] h-[43px] w-[100px] md:w-[121px] top-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full font-semibold"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="faq pt-40 pb-70">
        <div className="container">

          {isError && (
            <div className="text-center py-10 text-red-500">
              <p>Failed to load FAQs. Please try again later.</p>
            </div>
          )}

          {!isLoading && !isError && dynamicTabs.length === 0 && (
            <div className="text-center py-10">
              <p>No FAQs available at the moment.</p>
            </div>
          )}

          {!isLoading && !isError && isSearching && (
            <div id="faq-accordion-section">
              {searchResults.length > 0 ? (
                <Accordion
                  items={searchResults.map((item: FAQItem) => ({
                    id: String(item.id),
                    title: item.question,
                    content: <p>{item.answer}</p>,
                  }))}
                  variation={2}
                />
              ) : (
                <div className="text-center py-10">
                  <p>No FAQs match &quot;{searchQuery.trim()}&quot;.</p>
                </div>
              )}
            </div>
          )}

          {!isLoading && !isSearching && dynamicTabs.length > 0 && (
            <div className="grid-4">
              {dynamicTabs.map((grid) => (
                <button
                  key={grid.key}
                  type="button"
                  className={`bg-card py-30 ${activeTab === grid.key ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(grid.key);

                    setTimeout(() => {
                      const faqSection = document.getElementById(
                        "faq-accordion-section"
                      );

                      if (faqSection) {
                        const yOffset =
                          window.innerWidth < 1024 ? -450 : -300;

                        const y =
                          faqSection.getBoundingClientRect().top +
                          window.pageYOffset +
                          yOffset;

                        window.scrollTo({
                          top: y,
                          behavior: "smooth",
                        });
                      }
                    }, 100);
                  }}
                  style={{ cursor: "pointer", display: "block", width: "100%", textAlign: "center" }}
                >
                  <span className="flex justify-center mb-3">
                    <span
                      className={`
                    w-14 h-14 flex items-center justify-center 
                    rounded-full bg-yellow-400 
                    shadow-md 
                    transition-all duration-200
                    group-hover:bg-yellow-500 group-hover:scale-105
                    ${activeTab === grid.key ? "bg-yellow-500" : ""}
                  `}
                    >
                      <Image
                        src={grid.icon}
                        width={28}
                        height={28}
                        alt={grid.title}
                      />
                    </span>
                  </span>
                  <h6>{grid.title}</h6>
                  <p>{grid.description}</p>
                </button>
              ))}
            </div>
          )}

          {!isLoading && !isSearching && activeTab && faqsByType[activeTab] && (
            <div
              id="faq-accordion-section"
              className="mt-40"
            >
              <Accordion
                items={faqsByType[activeTab].map((item: FAQItem) => ({
                  id: String(item.id),
                  title: item.question,
                  content: <p>{item.answer}</p>,
                }))}
                variation={2}
              />
            </div>
          )}
        </div>
      </div>

      <ContactBanner />
    </div>
  );
}
