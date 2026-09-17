import { Product } from "./product";

export interface ImageUploadResponse {
  url?: string;
  image_url?: string;
  filename: string;
  size: number;
}

export interface ProductHighlightsResponse {
  products: {
    data: Product[];
  };
}

export interface SearchSuggestionProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  thumbnail_url: string | null;
}

export interface SearchSuggestionCategory {
  id: string;
  name: string;
  slug: string;
}

export interface SearchSuggestionBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface SearchSuggestionsResponse {
  products: SearchSuggestionProduct[];
  categories: SearchSuggestionCategory[];
  brands: SearchSuggestionBrand[];
}

