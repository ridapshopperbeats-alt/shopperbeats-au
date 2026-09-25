"use client";

import Link from "next/link";
import Image from "next/image";
import { CircleCheck, CircleX, Headphones, RotateCw } from "lucide-react";
import Banner from "@/components/common/Banner";
import type { ReturnStep } from "@/types/cms";


const returnSteps: ReturnStep[] = [
  {
    number: "01",
    title: "Initiate Return",
    description:
      "Go to My Orders, select the item, and click 'Return'. Choose your reason and preferred resolution.",
  },
  {
    number: "02",
    title: "Provide Details",
    bullets: [
      "Package condition picture",
      "Shipping label picture",
      "Item tags and label [For clothing]",
      "If damaged, picture condition of item received",
      "If faulty, picture or video showing actual fault",
    ],
  },
  {
    number: "03",
    title: "Quality Check",
    description:
      "Once received at our warehouse, we inspect the item within 2–3 business days to ensure it's in original condition.",
  },
  {
    number: "04",
    title: "Refund",
    description: "Refund will be initiated to your original payment method (5–7 days)",
  },
];

const eligibleConditions = [
  "Item must be returned within 30 days of delivery",
  "Original tags and packaging must be intact",
  "Item must be unworn, unwashed, and unaltered",
  "Return pickup is free of charge — always",
  "One free exchange per order item",
];

const notEligibleConditions = [
  "Items washed, worn, or altered in any way",
  "Products without original tags and packaging",
  "Innerwear, lingerie, and swimwear (hygiene policy)",
  "Items marked 'Final Sale' or 'Non-Returnable'",
  "Custom / personalised orders",
  "Items damaged due to misuse or improper care",
];

export default function ReturnRefundsPage() {
  return (
    <>
      <div
        className="page-hero-mobile w-full box-border bg-[linear-gradient(180deg,#FFF7F3_0%,#FFFDFC_100%)] border border-[#E5E7EB] px-5 py-9 text-left"
      >
        <h1 className="m-0 font-[family-name:Montserrat,sans-serif] font-semibold not-italic text-[24px] leading-[32px] tracking-[0px] text-[#01295F]">
          Returns &amp; Warranty
        </h1>
        <p className="mt-2.5 mx-0 mb-0 font-[family-name:Montserrat,sans-serif] font-semibold not-italic text-[16px] leading-[19.5px] tracking-[0px] text-[#6A7282]">
          Our hassle-free return and warranty guidelines.
        </p>
      </div>

      <Banner
        title="Returns &amp; Warranty"
        subtitle="Our hassle-free return and warranty guidelines."
        titleClassName="font-montserrat text-[32px]! font-semibold! leading-[24px]! text-[#01295F]!"
        subtitleClassName="font-montserrat text-[16px]! font-semibold! leading-[19.5px]! text-[#6A7282]!"
        image={
          <Image
            src="/images/Group 1261155781.png"
            alt="Returns and Warranty Banner"
            width={1920}
            height={218}
            priority
            fetchPriority="high"
          />
        }
      />

      <div
        className="rw-wrapper max-w-[1118px] my-10 mx-auto flex flex-col gap-5 box-border"
      >
        <div
          className="rw-hero w-full max-w-[1118px] min-h-[104px] gap-5 px-7 py-6 rounded-[16px] bg-[linear-gradient(135deg,#FD151B_0%,#C50F14_100%)] flex items-center box-border"
        >
          <div className="shrink-0 w-12 h-12 rounded-[9999px] bg-[#FFFFFF33] flex items-center justify-center">
            <RotateCw size={24} color="#FFFFFF" strokeWidth={2} />
          </div>
          <div>
            <div className="font-[family-name:Montserrat,sans-serif] font-bold not-italic text-[16px] leading-[30px] tracking-[0px] text-[#FFFFFF]">
              30-Day Hassle-Free Returns
            </div>
            <div className="font-[family-name:Montserrat,sans-serif] font-normal text-[14px] leading-[20px] tracking-[0px] text-[#FFFFFFCC]">
              Easy Return process · Fast Approvals · Quick refund settlements
            </div>
          </div>
        </div>

        <div
          className="rw-return-card w-full max-w-[1118px] rounded-[16px] border border-[#F3F4F6] shadow-[0px_1px_2px_0px_#0000000D] bg-[#FFFFFF] overflow-hidden box-border h-[320px]"
        >
          <div className="w-full h-[82px] px-6 py-5 border-b border-b-[#F3F4F6] box-border">
            <div className="font-[family-name:Montserrat,sans-serif] font-bold not-italic text-[14px] leading-[21px] tracking-[0px] text-[#211E22]">
              How to Return
            </div>
            <div className="font-[family-name:Montserrat,sans-serif] font-normal text-[12px] leading-[18px] text-[#99A1AF] mt-0.5">
              Simple step process — takes less than 2 minutes.
            </div>
          </div>

          <div className="rw-steps flex p-6 gap-5 box-border">
            {returnSteps.map((step, index) => (
              <div
                key={step.number}
                className={`rw-step flex-1 flex flex-col gap-2.5 ${index === 3 ? "w-[300px]" : "w-[252px] h-[130px]"
                  }`}
              >
                <div
                  className="rw-badge w-9 h-9 bg-[#FD151B] rounded-[30px] flex items-center justify-center box-border"
                >
                  <span className="font-[family-name:Montserrat,sans-serif] font-extrabold not-italic text-[12px] leading-[18px] tracking-[0px] text-[#FFFFFF]">
                    {step.number}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-[family-name:Montserrat,sans-serif] font-bold text-[14px] leading-[21px] text-[#211E22]">
                    {step.title}
                  </div>
                  {step.bullets ? (
                    <ul className="m-0 pl-[18px] font-[family-name:Montserrat,sans-serif] font-normal text-[12px] leading-[18px] text-[#6A7282]">
                      {step.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="font-[family-name:Montserrat,sans-serif] font-normal text-[12px] leading-[18px] text-[#6A7282]">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rw-eligibility flex gap-5 w-full max-w-[1118px] box-border"
        >
          <div
            className="rw-eligibility-title hidden font-[family-name:Montserrat,sans-serif] font-bold not-italic text-[14px] leading-[21px] tracking-[0px] text-[#211E22]"
          >
            Eligibility
          </div>

          <div
            className="rw-elig-card flex-1 rounded-[16px] border border-[#F3F4F6] shadow-[0px_1px_2px_0px_#0000000D] bg-[#FFFFFF] overflow-hidden box-border"
          >
            <div
              className="rw-elig-header w-full h-[52px] px-5 py-4 border-b border-b-[#F3F4F6] box-border flex items-center"
            >
              <span
                className="rw-elig-title-desktop font-[family-name:Montserrat,sans-serif] font-bold not-italic text-[14px] leading-[21px] tracking-[0px] text-[#211E22]"
              >
                Return Conditions
              </span>
              <span
                className="rw-elig-title-mobile hidden font-[family-name:Montserrat,sans-serif] font-bold not-italic text-[14px] leading-[21px] tracking-[0px] text-[#16A34A]"
              >
                Items Eligible for Return
              </span>
            </div>
            <div
              className="rw-elig-body px-5 py-4 flex flex-col gap-3 box-border"
            >
              {eligibleConditions.map((condition) => (
                <div key={condition} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-4 h-4 rounded-[9999px] flex items-center justify-center mt-px">
                    <CircleCheck size={24} color="#16A34A" strokeWidth={2} />
                  </span>
                  <span className="font-[family-name:Montserrat,sans-serif] font-normal text-[13px] leading-[19px] text-[#4A5565]">
                    {condition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rw-elig-card flex-1 rounded-[16px] border border-[#F3F4F6] shadow-[0px_1px_2px_0px_#0000000D] bg-[#FFFFFF] overflow-hidden box-border"
          >
            <div
              className="rw-elig-header w-full h-[52px] px-5 py-4 border-b border-b-[#F3F4F6] box-border flex items-center"
            >
              <span className="font-[family-name:Montserrat,sans-serif] font-bold not-italic text-[14px] leading-[21px] tracking-[0px] text-[#211E22]">
                Not Eligible for Return
              </span>
            </div>
            <div
              className="rw-elig-body px-5 py-4 flex flex-col gap-3 box-border"
            >
              {notEligibleConditions.map((condition) => (
                <div key={condition} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-4 h-4 rounded-[9999px] flex items-center justify-center mt-px">
                    <CircleX size={24} color="#DC2626" strokeWidth={2} />
                  </span>
                  <span className="font-[family-name:Montserrat,sans-serif] font-normal text-[13px] leading-[19px] text-[#4A5565]">
                    {condition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1118px] rounded-[16px] border border-[#F3F4F6] shadow-[0px_1px_2px_0px_#0000000D] bg-[#FFFFFF] overflow-hidden box-border">
          <div className="w-full h-[82px] px-6 py-5 border-b border-b-[#F3F4F6] box-border">
            <div className="font-[family-name:Montserrat,sans-serif] font-bold not-italic text-[14px] leading-[21px] tracking-[0px] text-[#211E22]">
              Warranty Coverage
            </div>
            <div className="font-[family-name:Montserrat,sans-serif] font-normal text-[12px] leading-[18px] text-[#99A1AF]">
              We only have 30 days return and refund policy.
            </div>
          </div>
        
        </div>

        <div
          className="rw-footer w-full max-w-[1118px] rounded-[16px] border border-[#F3F4F6] shadow-[0px_1px_2px_0px_#0000000D] bg-[#FFFFFF] px-6 py-5 flex items-center justify-between box-border"
        >
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 w-10 h-10 rounded-[14px] bg-[#FFF0F0] flex items-center justify-center">
              <Headphones size={18} color="#FD151B" strokeWidth={2} />
            </div>
            <div>
              <div className="font-[family-name:Montserrat,sans-serif] font-bold text-[14px] leading-[21px] text-[#211E22]">
                Need help with a return?
              </div>
              <div className="font-[family-name:Montserrat,sans-serif] font-normal text-[12px] leading-[18px] text-[#99A1AF] mt-0.5">
                Our team is available Mon–Sat, 9 AM – 7 PM IST.
              </div>
            </div>
          </div>
          <Link
            href="/contact"
            className="rw-footer-btn flex items-center gap-2 bg-[#FD151B] text-[#FFFFFF] rounded-[30px] px-5 py-2.5 font-[family-name:Montserrat,sans-serif] font-semibold text-[13px] leading-[19px] no-underline box-border"
          >
            <Headphones size={14} color="#FFFFFF" strokeWidth={2} />
            Contact Support
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) and (max-width: 1024px) {
          .rw-wrapper {
            padding: 24px !important;
            max-width: 100% !important;
          }
          .rw-steps {
            flex-wrap: wrap !important;
            gap: 24px !important;
          }
          .rw-step {
            flex: 1 1 calc(50% - 12px) !important;
            width: calc(50% - 12px) !important;
            min-width: 220px !important;
            height: auto !important;
          }
          .rw-badge {
            flex-shrink: 0 !important;
            width: 36px !important;
            height: 36px !important;
          }
          .rw-return-card {
            height: auto !important;
          }
        }

        @media (max-width: 767px) {
          .rw-wrapper {
            margin: 0 auto !important;
            padding: 16px !important;
            gap: 16px !important;
            max-width: 100% !important;
          }
          .rw-hero {
            padding: 20px !important;
          }
          .rw-steps {
            flex-direction: column !important;
            gap: 20px !important;
          }
          .rw-step {
            flex-direction: row !important;
            align-items: flex-start !important;
            width: 100% !important;
            height: auto !important;
          }
          .rw-badge {
            flex-shrink: 0 !important;
            width: 36px !important;
            height: 36px !important;
          }
          .rw-return-card {
            height: auto !important;
          }
          .rw-eligibility {
            flex-direction: column !important;
            border: 1px solid #f3f4f6 !important;
            border-radius: 16px !important;
            box-shadow: 0px 1px 2px 0px #0000000d !important;
            background-color: #ffffff !important;
            padding: 20px !important;
            gap: 20px !important;
          }
          .rw-eligibility-title {
            display: block !important;
          }
          .rw-elig-card {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background-color: transparent !important;
          }
          .rw-elig-header {
            padding: 0 0 12px !important;
            border-bottom: 1px solid #f3f4f6 !important;
          }
          .rw-elig-title-desktop {
            display: none !important;
          }
          .rw-elig-title-mobile {
            display: inline !important;
          }
          .rw-elig-body {
            padding: 16px 0 0 !important;
          }
          .rw-table thead {
            display: none !important;
          }
          .rw-table tr {
            display: block !important;
            padding: 14px 20px !important;
            border-bottom: 1px solid #f3f4f6 !important;
          }
          .rw-table tr:last-child {
            border-bottom: none !important;
          }
          .rw-table td {
            display: block !important;
            padding: 2px 0 !important;
            border-bottom: none !important;
          }
          .rw-footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .rw-footer-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        .page-hero-mobile {
          display: none;
        }

        .rw-badge {
          flex-shrink: 0;
        }

        .rw-steps ul {
          list-style-type: disc;
        }

        @media (max-width: 1023px) {
          .page-hero-mobile {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}