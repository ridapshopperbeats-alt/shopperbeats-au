

export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
}

export interface ShadowDomContentProps {
  content: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqCategory {
  title: string;
  items: FaqEntry[];
}

export interface IpComplaintForm {
  fullName: string;
  email: string;
  companyName: string;
  country: string;
  ipType: string;
  listingUrls: string;
  description: string;
  proofOfOwnership: string;
  declaration: boolean;
}

export interface ReturnStep {
  number: string;
  title: string;
  description?: string;
  bullets?: string[];
}
