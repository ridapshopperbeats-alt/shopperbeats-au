export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
}

export interface ShadowDomContentProps {
  content: string;
  nonce?: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqCategory {
  title: string;
  items: FaqEntry[];
}

export interface ReturnStep {
  number: string;
  title: string;
  description?: string;
  bullets?: string[];
}
