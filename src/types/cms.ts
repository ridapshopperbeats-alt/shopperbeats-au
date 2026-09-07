export interface LegalSection {
  title: string;
  content: string[];
}

export interface AboutLink {
  href: string;
  label: string;
}

export interface AboutSection {
  label: string;
  imageSrc: string;
  content: {
    type: "heading" | "paragraph";
    text: string;
  }[];
}

export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
}

export interface ContactInfoItem {
  icon: string;
  label: string;
  value: string | { weekdays: string; weekends: string };
}

export interface ContactContent {
  title: string;
  description: string[];
  contactBlocks: ContactInfoItem[];
}
