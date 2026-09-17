export interface Breadcrumb {
  name: string;
  path: string;
}

export interface BreadcrumbState {
  categoryHistory: Breadcrumb[];
}