import React, { useState } from "react";

type DescriptionContent = {
    image: string;
    description: string;
    additionalInfo: string;
    note: string;
};

type DeliveryContent = {
    text: string;
};

type WarrantyContent = {
    text: string;
};

type ReviewItem = {
    user: string;
    comment: string;
    rating: number;
};

type ReviewsContent = {
    rating: number;
    totalReviews: number;
    items: ReviewItem[];
};

type TabItem = {
    label: string;
    key: string;
    content:
    | DescriptionContent
    | DeliveryContent
    | WarrantyContent
    | ReviewsContent;
};

type TabsProps = {
    tabs: TabItem[];
    defaultIndex?: number;
};

const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0 }) => {
    const [activeTab, setActiveTab] = useState<number>(defaultIndex);

    if (!tabs.length) return null;

    const renderContent = (tab: TabItem) => {
        switch (tab.key) {
            case "description": {
                const data = tab.content as DescriptionContent;

                return (
                    <div>
                        <div
                            style={{
                                width: "100%",
                                height: "400px",
                                backgroundImage: `url(${data.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "8px",
                            }}
                        />

                        <p style={{ marginTop: "16px" }}>{data.description}</p>
                        <p style={{ marginTop: "10px" }}>{data.additionalInfo}</p>
                        <p style={{ marginTop: "10px", fontSize: "12px", color: "gray" }}>
                            {data.note}
                        </p>
                    </div>
                );
            }

            case "delivery":
            case "warranty": {
                const data = tab.content as DeliveryContent | WarrantyContent;
                return <p>{data.text}</p>;
            }

            case "reviews": {
                const data = tab.content as ReviewsContent;

                return (
                    <div>
                        <h4>
                            {data.rating} ⭐ ({data.totalReviews} reviews)
                        </h4>

                        {data.items.map((item, index) => (
                            <div key={index} style={{ marginTop: "10px" }}>
                                <strong>{item.user}</strong>
                                <p>{item.comment}</p>
                                <span>{item.rating} ⭐</span>
                            </div>
                        ))}
                    </div>
                );
            }

            default:
                return null;
        }
    };

    return (
        <div style={{ width: "100%", fontFamily: "Arial" }}>
            <div className="tab-container flex gap-[80px]">
                {tabs.map((tab, index) => {
                    const isActive = activeTab === index;

                    return (
                        <div
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`tab-container-header ${isActive ? "tab-container-selected" : ""
                                }`}
                        >
                            {tab.label}
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: "20px 0px" }}>
                {renderContent(tabs[activeTab])}
            </div>
        </div>
    );
};

export default Tabs;