"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/common/Sidebar";
import Banner from "@/components/common/Banner";
import ContactBanner from "@/components/common/ContactBanner";
import "../../../styles/about.css";

// Types
interface AboutLink {
    href: string;
    label: string;
}

interface AboutSection {
    label: string;
    imageSrc: string;
    content: {
        type: "heading" | "paragraph";
        text: string;
    }[];
}


// JSON-like data
const aboutLinks: AboutLink[] = [
    { href: "#1", label: "Who we are" },
    { href: "#2", label: "Why buy from us" },
    { href: "#3", label: "Our Policies" },
];

const aboutSections: AboutSection[] = [
    {
        label: "Who we are",
        imageSrc: "/images/cms/about.svg",
        content: [
            { type: "heading", text: "Our Vision" },
            { type: "paragraph", text: `ShopperBeats continues to stand as the planet's premier shopping destination, renowned for its unparalleled collection of incredible finds. Our platform facilitates seamless sharing and shopping experiences while merging offline shopping with the digital realm, fostering meaningful connections.` },
            { type: "heading", text: "Our Mission" },
            { type: "paragraph", text: `At ShopperBeats, our mission remains steadfast: to establish ourselves as the most trusted, customer-centric company. We empower individuals to explore and procure anything from any corner of the globe, ensuring competitive prices and a wide array of choices.` },
        ],
    },
    {
        label: "Why buy from us",
        imageSrc: "/images/cms/about-2.png",
        content: [
            { type: "heading", text: "100% Satisfaction Guarantee:" },
            { type: "paragraph", text: ` If for any reason you are not satisfied with any item, return your unused item for a full refund of the purchase price.` },
            { type: "paragraph", text: `We delight customers with high-quality products at affordable prices. Our support team always prioritizes the customer's point of view when solving problems.` },
            { type: "paragraph", text: `Affordable shipping options exist for every customer, with free shipping provided to certain countries.` },
        ],
    },
    {
        label: "Our Policies",
        imageSrc: "/images/cms/about-3.png",
        content: [
            { type: "heading", text: "Refund Policy:" },
            { type: "paragraph", text: ` You can return your order within 30 days of receipt if not entirely satisfied.` },
            { type: "heading", text: "Refund PoExceptional Customer Service:" },
            { type: "paragraph", text: ` Friendly, personalized service with 24/7 support. We aim to respond within 24–48 hours.` },
            { type: "heading", text: "Payment Security and Privacy:" },
            { type: "paragraph", text: ` ShopperBeats uses SSL encryption and secure gateways like Stripe and PayPal. Card details are never stored or shared with third parties.` },
        ],
    },
];


export default function AboutPage() {
    const [active, setActive] = useState<string>("Who we are");
    const currentSection = aboutSections.find(section => section.label === active);


    return (
        <>
            <Banner title="About Us" image="/images/cms/about-banner.png" />

            <div className="about-page py-5">
                <div className="container">
                    <div className="  block md:flex  gap-6">
                        {/* Sidebar */}
                        <Sidebar links={aboutLinks} active={active} onChange={setActive} extraClass="md:w-15-imp mb-4  md:mb-0" />

                        {/* Content */}
                        {currentSection && (
                            <div className="about-section dflex mvb">
                                <div className="about-content">
                                    {currentSection.content.map((item, idx) =>
                                        item.type === "heading" ? (
                                            <h4 key={idx}>{item.text}</h4>
                                        ) : (
                                            <p key={idx}>{item.text}</p>
                                        )
                                    )}
                                </div>

                                <div className="about-img">
                                    <Image
                                        src={currentSection.imageSrc}
                                        alt={currentSection.label}
                                        width={500}
                                        height={400}
                                        loading="lazy"
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ContactBanner />
        </>
    );
}
