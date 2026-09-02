"use client";

import Link from "next/link";
import { CircleCheck, CircleX, Headphones, RotateCw } from "lucide-react";

interface ReturnStep {
  number: string;
  title: string;
  description?: string;
  bullets?: string[];
}

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
        className="page-hero-mobile"
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #FFF7F3 0%, #FFFDFC 100%)",
          border: "1px solid #E5E7EB",
          padding: "36px 20px",
          textAlign: "left",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontStyle: "normal",
            fontSize: "24px",
            lineHeight: "32px",
            letterSpacing: "0px",
            color: "#01295F",
          }}
        >
          Returns &amp; Warranty
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontStyle: "normal",
            fontSize: "16px",
            lineHeight: "19.5px",
            letterSpacing: "0px",
            color: "#6A7282",
          }}
        >
          Our hassle-free return and warranty guidelines.
        </p>
      </div>

      <div
        className="rw-wrapper"
        style={{
          maxWidth: "1118px",
          margin: "40px auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* Red gradient header */}
        <div
          className="rw-hero"
          style={{
            width: "100%",
            maxWidth: "1118px",
            minHeight: "104px",
            gap: "20px",
            padding: "24px 28px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #FD151B 0%, #C50F14 100%)",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: "48px",
              height: "48px",
              borderRadius: "9999px",
              backgroundColor: "#FFFFFF33",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RotateCw size={24} color="#FFFFFF" strokeWidth={2} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontStyle: "normal",
                fontSize: "16px",
                lineHeight: "30px",
                letterSpacing: "0px",
                color: "#FFFFFF",
              }}
            >
              30-Day Hassle-Free Returns
            </div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "0px",
                color: "#FFFFFFCC",
              }}
            >
              Easy Return process · Fast Approvals · Quick refund settlements
            </div>
          </div>
        </div>

        {/* How to Return */}
        <div
          className="rw-return-card"
          style={{
            width: "100%",
            maxWidth: "1118px",
            borderRadius: "16px",
            border: "1px solid #F3F4F6",
            boxShadow: "0px 1px 2px 0px #0000000D",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            boxSizing: "border-box",
            height: "320px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "82px",
              padding: "20px 24px",
              borderBottom: "1px solid #F3F4F6",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontStyle: "normal",
                fontSize: "14px",
                lineHeight: "21px",
                letterSpacing: "0px",
                color: "#211E22",
              }}
            >
              How to Return
            </div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "18px",
                color: "#99A1AF",
                marginTop: "2px",
              }}
            >
              Simple step process — takes less than 2 minutes.
            </div>
          </div>

          <div className="rw-steps" style={{ display: "flex", padding: "24px", gap: "20px", boxSizing: "border-box" }}>
            {returnSteps.map((step, index) => (
              <div
                key={step.number}
                className="rw-step"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: index === 3 ? "300px" : "252px",
                  height: index === 3 ? undefined : "130px",
                }}
              >
                <div
                  className="rw-badge"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#FD151B",
                    borderRadius: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontStyle: "normal",
                      fontSize: "12px",
                      lineHeight: "18px",
                      letterSpacing: "0px",
                      color: "#FFFFFF",
                    }}
                  >
                    {step.number}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      lineHeight: "21px",
                      color: "#211E22",
                    }}
                  >
                    {step.title}
                  </div>
                  {step.bullets ? (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#6A7282",
                      }}
                    >
                      {step.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : (
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#6A7282",
                      }}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Conditions / Not Eligible */}
        <div
          className="rw-eligibility"
          style={{ display: "flex", gap: "20px", width: "100%", maxWidth: "1118px", boxSizing: "border-box" }}
        >
          <div
            className="rw-eligibility-title"
            style={{
              display: "none",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontStyle: "normal",
              fontSize: "14px",
              lineHeight: "21px",
              letterSpacing: "0px",
              color: "#211E22",
            }}
          >
            Eligibility
          </div>

          <div
            className="rw-elig-card"
            style={{
              flex: 1,
              borderRadius: "16px",
              border: "1px solid #F3F4F6",
              boxShadow: "0px 1px 2px 0px #0000000D",
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              className="rw-elig-header"
              style={{
                width: "100%",
                height: "52px",
                padding: "16px 20px",
                borderBottom: "1px solid #F3F4F6",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                className="rw-elig-title-desktop"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontStyle: "normal",
                  fontSize: "14px",
                  lineHeight: "21px",
                  letterSpacing: "0px",
                  color: "#211E22",
                }}
              >
                Return Conditions
              </span>
              <span
                className="rw-elig-title-mobile"
                style={{
                  display: "none",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontStyle: "normal",
                  fontSize: "14px",
                  lineHeight: "21px",
                  letterSpacing: "0px",
                  color: "#16A34A",
                }}
              >
                Items Eligible for Return
              </span>
            </div>
            <div
              className="rw-elig-body"
              style={{
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxSizing: "border-box",
              }}
            >
              {eligibleConditions.map((condition) => (
                <div key={condition} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: "16px",
                      height: "16px",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "1px",
                    }}
                  >
                    <CircleCheck size={24} color="#16A34A" strokeWidth={2} />
                  </span>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "19px",
                      color: "#4A5565",
                    }}
                  >
                    {condition}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rw-elig-card"
            style={{
              flex: 1,
              borderRadius: "16px",
              border: "1px solid #F3F4F6",
              boxShadow: "0px 1px 2px 0px #0000000D",
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              className="rw-elig-header"
              style={{
                width: "100%",
                height: "52px",
                padding: "16px 20px",
                borderBottom: "1px solid #F3F4F6",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontStyle: "normal",
                  fontSize: "14px",
                  lineHeight: "21px",
                  letterSpacing: "0px",
                  color: "#211E22",
                }}
              >
                Not Eligible for Return
              </span>
            </div>
            <div
              className="rw-elig-body"
              style={{
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxSizing: "border-box",
              }}
            >
              {notEligibleConditions.map((condition) => (
                <div key={condition} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: "16px",
                      height: "16px",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "1px",
                    }}
                  >
                    <CircleX size={24} color="#DC2626" strokeWidth={2} />
                  </span>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                      fontSize: "13px",
                      lineHeight: "19px",
                      color: "#4A5565",
                    }}
                  >
                    {condition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warranty Coverage */}
        <div
          style={{
            width: "100%",
            maxWidth: "1118px",
            borderRadius: "16px",
            border: "1px solid #F3F4F6",
            boxShadow: "0px 1px 2px 0px #0000000D",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", height: "82px", padding: "20px 24px", borderBottom: "1px solid #F3F4F6", boxSizing: "border-box" }}>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontStyle: "normal",
                fontSize: "14px",
                lineHeight: "21px",
                letterSpacing: "0px",
                color: "#211E22",
              }}
            >
              Warranty Coverage
            </div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: "12px", lineHeight: "18px", color: "#99A1AF" }}>
              We only have 30 days return and refund policy.
            </div>
          </div>
          {/*
          <table className="rw-table" style={{ width: "100%", borderCollapse: "collapse", boxSizing: "border-box" }}>
            ...warranty period table intentionally left disabled, matching source design...
          </table>
          */}
        </div>

        {/* Footer contact bar */}
        <div
          className="rw-footer"
          style={{
            width: "100%",
            maxWidth: "1118px",
            borderRadius: "16px",
            border: "1px solid #F3F4F6",
            boxShadow: "0px 1px 2px 0px #0000000D",
            backgroundColor: "#FFFFFF",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                flexShrink: 0,
                width: "40px",
                height: "40px",
                borderRadius: "14px",
                backgroundColor: "#FFF0F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Headphones size={18} color="#FD151B" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "14px", lineHeight: "21px", color: "#211E22" }}>
                Need help with a return?
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#99A1AF",
                  marginTop: "2px",
                }}
              >
                Our team is available Mon–Sat, 9 AM – 7 PM IST.
              </div>
            </div>
          </div>
          <Link
            href="/contact"
            className="rw-footer-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FD151B",
              color: "#FFFFFF",
              borderRadius: "30px",
              padding: "10px 20px",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              lineHeight: "19px",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
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
