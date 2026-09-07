"use client";

import { useState } from "react";
import Image from "next/image";

import "../../../../styles/sell.css";
import Sidebar from "@/components/common/Sidebar";
import SellerSignupModal from "@/components/ui/SellerSignupModal";
import Link from "next/link";

const sidebarLinks = [
  { href: "#1", label: "Choose a selling plan" },
  { href: "#2", label: "Read the seller verification guide" },
  { href: "#3", label: "Consider your growth strategy" },
  { href: "#4", label: "Create a seller account" },
];
type SectionKey = typeof sidebarLinks[number]["label"];
export const sellSections: Record<SectionKey, {
  image: string;
  title: string;
  paragraphs: string[];
  button: string;
}> = {

  "Choose a selling plan": {
    image: "/images/cms/plan.png",
    title: "Choose a selling plan",
    paragraphs: [
      "Select a selling plan that matches your business goals and expected sales volume.",
      "Whether you're just getting started or scaling an established brand, Shopperbeats offers flexible plans designed to support your growth."
    ],
    button: "Compare Plans",
  },

  "Read the seller verification guide": {
    image: "/images/cms/verify.png",
    title: "Seller verification guide",
    paragraphs: [
      "Verification helps us maintain a secure and trusted marketplace for both sellers and customers.",
      "Complete the required documentation and KYC process to activate your seller account and begin listing products."
    ],
    button: "Read Guide",
  },

  "Consider your growth strategy": {
    image: "/images/cms/growth.png",
    title: "Growth strategy",
    paragraphs: [
      "Plan how you’ll position your products, price competitively, and optimize your listings for maximum visibility.",
      "Use data insights, promotions, and advertising tools to expand your reach and scale your business efficiently."
    ],
    button: "Learn More",
  },

  "Create a seller account": {
    image: "/images/cms/form.png",
    title: "Create your seller account",
    paragraphs: [
      "Register your business details and submit your application to join the Shopperbeats marketplace.",
      "Once approved, you can start listing products and reach customers across Australia and beyond."
    ],
    button: "Create Account",
  },
} as const;


export default function SellPage() {



  const [active, setActive] = useState<SectionKey>("Choose a selling plan");
  const [showModal, setShowModal] = useState(false);

  const section = sellSections[active];

  return (
    <>
      <div className="sell-banner">
        <div className="container">
          <div className="dflex items-center no-wrap">

            <div className="sell-left">
              <div className="sell-content">
                <h2>
                  How to start <br /> selling on Shopperbeats
                </h2>
                <p>
                  Whether you’re already running a successful ecommerce store,
                  brainstorming your next big product, or simply love the world of
                  online selling, Shopperbeats is the perfect place to grow. Here’s
                  how to move forward with confidence.
                </p>

                <Link href="#" className="btn btn-red btn-filled">
                  Read the Shopperbeats selling starter guide.
                </Link>
              </div>
            </div>

            <div className="sell-right">
              <Image
                src="/images/cms/sell-img.png"
                alt="Sell Banner"
                width={500}
                height={500}
                loading="lazy"
              />
            </div>

          </div>
        </div>
      </div>

      <div className=" pt-[40px] pb-[70px]">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-6">

            <Sidebar links={sidebarLinks} extraClass="w-full max-w-[400px]" active={active} onChange={setActive} textStyle={{ fontSize: "13px", fontWeight: "700", }} />

            <div
              className=" w-full min-h-auto xl:min-h-[569px] bg-white rounded-[8px] flex flex-col lg:flex-row items-center justify-between gap-8  p-5 sm:p-8 md:p-10 lg:p-12"
            >
              <div className="w-full lg:w-[42%] flex justify-center">
                <Image
                  src={section.image}
                  alt={active}
                  width={524}
                  height={402}
                  loading="lazy"
                  className=" w-full max-w-[260px]  sm:max-w-[340px] md:max-w-[420px] lg:max-w-[524px] h-auto object-contain "
                />
              </div>

              <div
                className=" w-full lg:w-[58%] text-center lg:text-left
          "
              >
                <h4
                  className="  text-[24px]  sm:text-[30px] md:text-[36px] lg:text-[40px] font-[700]  leading-[1.2]  text-black  mb-4  md:mb-5  "
                >
                  {section.title}
                </h4>

                <div className="space-y-3 sm:space-y-4 mb-8 md:mb-10 lg:mb-14">
                  {section.paragraphs.map((text, idx) => (
                    <p
                      key={idx}
                      className="text-[14px] sm:text-[15px] md:text-[16px] leading-[1.7]  text-[#555]"
                    >
                      {text}
                    </p>
                  ))}
                </div>

                <button
                  className="
              btn btn-red btn-outline btn-rounded
              w-full
              sm:w-auto
            "
                  onClick={() => {
                    if (active === "Create a seller account") {
                      setShowModal(true);
                    }
                  }}
                >
                  {section.button}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mb-[70px] py-[70px] relative overflow-hidden"
      >
        <Image
          src="/images/cms/sell-bg.svg"
          alt="Sell Background"
          height={322}
          width={1922}
          className=" absolute inset-0 w-full h-full object-cover"
        />

        <div className="container relative z-10">
          <div className="sell-bg-content text-center max-w-[740px] mx-auto">
            <h3 className="text-white text-[30px] md:text-[45px] font-[800]">
              Start selling today
            </h3>

            <p className="text-white text-[16px] md:text-[18px] font-[500] my-[15px]">
            Reach millions of shoppers browsing every day by showcasing your products where they’re already searching.
            </p>

            <button
              className="btn btn-red btn-filled"
              onClick={() => setShowModal(true)}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      <SellerSignupModal show={showModal} onClose={() => setShowModal(false)} />

    </>
  );
}
