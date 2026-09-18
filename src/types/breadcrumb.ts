export interface Breadcrumb {
  name: string;
  path: string;
}

export interface BreadcrumbState {
  categoryHistory: Breadcrumb[];
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface BreadcrumbProps {
  from?: string;
}
