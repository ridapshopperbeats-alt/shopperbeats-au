"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import Banner from "@/components/common/Banner";

const CARD_CLASS =
  "w-full max-w-[1118px] rounded-2xl border border-[#F3F4F6] shadow-[0px_1px_2px_0px_#0000000D] bg-white box-border";

interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqEntry[];
}

const faqCategories: FaqCategory[] = [
  {
    title: "Orders & Shipping",
    items: [
      {
        question: "How do I track my order?",
        answer:
          "You can track your order from the \"My Orders\" section using the tracking link sent to your email.",
      },
      {
        question: "How long does delivery take?",
        answer: "Delivery usually takes 5-7 business days all over USA .",
      },
      {
        question: "Can I change my delivery address after placing an order?",
        answer:
          "Yes, you can update your delivery address before the order is shipped by contacting support within 24 hours of the order being placed.",
      },
      {
        question: "Do you ship internationally?",
        answer: "No we do not ship internationally.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        question: "What is your return policy?",
        answer: "Items can be returned within 30 days of delivery in their original condition.",
      },
      {
        question: "How long does a refund take?",
        answer: "Refunds are processed within 5-10 business days after we receive the returned item.",
      },
      {
        question: "Can I exchange an item for a different size?",
        answer: "No we do not offer exchanges.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept credit/debit cards.",
      },
      {
        question: "Is it safe to save my card details?",
        answer:
          "Yes, all card details are encrypted and stored securely using industry-standard practices.",
      },
      {
        question: "Can I use multiple payment methods?",
        answer: "Currently, only one payment method can be used per order.",
      },
    ],
  },
  {
    title: "Account & Profile",
    items: [
      {
        question: "How do I reset my password?",
        answer:
          "Click \"Forgot Password\" on the login page and follow the instructions sent to your email.",
      },
      {
        question: "Can I have multiple addresses saved?",
        answer:
          "Yes, you can save multiple addresses under the \"Address Book\" section of your profile.",
      },
    ],
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!trimmedQuery) return faqCategories;
    return faqCategories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(trimmedQuery) ||
            item.answer.toLowerCase().includes(trimmedQuery),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [trimmedQuery]);

  return (
    <>
      <div className="flex w-full flex-col items-start gap-3 self-stretch border-b border-[#E5E7EB] bg-gradient-to-b from-[#FFF7F3] to-[#FFFDFC] px-5 py-9 lg:hidden">
        <h1 className="font-montserrat text-[24px] font-bold leading-tight text-[#01295F]">
          FAQ
        </h1>
        <p className="font-montserrat text-[14px] font-medium text-[#6A7282]">
          Find answers to the most commonly asked questions.
        </p>
      </div>
      <Banner
        title="FAQ"
        subtitle="Find answers to the most commonly asked questions."
        titleClassName="font-montserrat text-[32px]! font-semibold! leading-[24px]! text-[#01295F]!"
        subtitleClassName="font-montserrat text-[16px]! font-semibold! leading-[19.5px]! text-[#6A7282]!"
        image={
          <Image
            src="/images/Group 1261155781.png"
            alt="FAQ Banner"
            width={1920}
            height={218}
            priority
            fetchPriority="high"
          />
        }
      />

      <div className="mx-auto my-0 md:my-10 box-border flex w-full max-w-full flex-col gap-4 p-4 md:max-w-[1118px] md:gap-5 md:p-0">
        {/* Top intro card */}
        <div className={`${CARD_CLASS} overflow-hidden p-5 md:p-6`}>
          <div className="font-montserrat fluid-text-xs font-bold leading-[21px] text-[#111827]">
            Frequently Asked Questions
          </div>
          <div className="mb-4 mt-1.5 font-montserrat text-12px font-normal leading-[16.5px] text-[#9CA3AF]">
            {/* Can&apos;t find your answer?{" "} */}
            <Link
              href="/contact"
              className="font-montserrat text-12px font-semibold leading-[16.5px] text-[#FD151B] no-underline"
            >
              Contact our support team
            </Link>
          </div>
          <div className="relative w-full">
            <Search
              size={16}
              className="!pointer-events-none !absolute !left-4 !top-1/2 !-translate-y-1/2 !text-[#99A1AF]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="!box-border !h-10 !w-full !rounded-[14px] !border !border-[#E5E7EB] !bg-[#F9FAFB] !pl-10 !pr-4 font-montserrat text-[13px] !text-[#9CA3AF] !outline-none"
            />
          </div>
        </div>

        {trimmedQuery && filteredCategories.length === 0 && (
          <div className={`${CARD_CLASS} p-6 text-center font-montserrat text-12px text-[#99A1AF]`}>
            No FAQs match &quot;{searchQuery.trim()}&quot;.
          </div>
        )}

        {/* Category cards */}
        {filteredCategories.map((category) => (
          <div key={category.title} className={`${CARD_CLASS} overflow-hidden`}>
            <div className="flex h-[49.5px] items-center border-b border-[#F3F4F6] px-6 font-montserrat text-12px font-bold leading-[16.5px] text-[#FD151B]">
              {category.title}
            </div>
            {category.items.map((item, index) => (
              <details
                key={item.question}
                className={`faq-item ${
                  index !== category.items.length - 1 ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <summary className="faq-summary flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-montserrat fluid-text-xs font-semibold leading-5 text-[#111827]">
                  {item.question}
                  <span className="chev-circle flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] transition-colors duration-200">
                    <ChevronDown
                      size={12}
                      strokeWidth={3}
                      className="chev-icon text-[#99A1AF] transition-transform duration-200"
                    />
                  </span>
                </summary>
                <div className="px-6 pb-4 font-montserrat text-12px font-normal leading-5 text-[#6B7280]">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>

      <style jsx global>{`
        .faq-item summary::-webkit-details-marker {
          display: none;
        }
        .faq-item[open] .chev-circle {
          background-color: #fd151b;
          border-color: #fd151b;
        }
        .faq-item[open] .chev-icon {
          stroke: #ffffff;
          transform: rotate(180deg);
        }
      `}</style>
    </>
  );
}
