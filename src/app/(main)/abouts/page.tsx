"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/common/Sidebar";
import Banner from "@/components/common/Banner";
import ContactBanner from "@/components/common/ContactBanner";
import "../../../styles/about.css";
import { aboutLinks, aboutSections } from "@/lib/utils/main-utils";

export default function AboutPage() {
    const [active, setActive] = useState<string>("Who we are");
    const currentSection = aboutSections.find(section => section.label === active);

    return (
        <>
            <Banner title="About Us" image="/images/cms/about-banner.png" />

            <div className="about-page py-5">
                <div className="container">
                    <div className="  block md:flex  gap-6">
                        <Sidebar links={aboutLinks} active={active} onChange={setActive} extraClass="md:w-15-imp mb-4  md:mb-0" />

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
