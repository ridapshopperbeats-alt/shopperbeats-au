export interface Brand {
  image: string | null;
  id: string;
  name: string;
  logo_url: string | null;
  image_url: string | null;
  is_active: boolean;
  total_products: number;
  active_products: number;
  inactive_products: number;
  slug: string;
}

export interface BrandsResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: Brand[];
}