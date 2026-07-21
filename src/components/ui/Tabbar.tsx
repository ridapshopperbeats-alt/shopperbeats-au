import { DeliveryContent, DescriptionContent, ReviewsContent, TabItem, TabsProps, WarrantyContent } from "@/types/tabbar";
import React, { useState } from "react";


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
                            className="w-full h-[400px] bg-cover bg-center rounded-lg"
                            style={{ backgroundImage: `url(${data.image})` }}
                        />

                        <p className="mt-4">{data.description}</p>
                        <p className="mt-[10px]">{data.additionalInfo}</p>
                        <p className="mt-[10px] text-xs text-gray-500">
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
                            <div key={index} className="mt-[10px]">
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
        <div className="w-full font-['Arial']">
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

            <div className="py-5 px-0">
                {renderContent(tabs[activeTab])}
            </div>
        </div>
    );
};

export default Tabs;