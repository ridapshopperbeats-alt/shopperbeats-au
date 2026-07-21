export type DescriptionContent = {
    image: string;
    description: string;
    additionalInfo: string;
    note: string;
};

export type DeliveryContent = {
    text: string;
};

export type WarrantyContent = {
    text: string;
};

export type ReviewItem = {
    user: string;
    comment: string;
    rating: number;
};

export type ReviewsContent = {
    rating: number;
    totalReviews: number;
    items: ReviewItem[];
};

export type TabItem = {
    label: string;
    key: string;
    content:
    | DescriptionContent
    | DeliveryContent
    | WarrantyContent
    | ReviewsContent;
};

export type TabsProps = {
    tabs: TabItem[];
    defaultIndex?: number;
};
