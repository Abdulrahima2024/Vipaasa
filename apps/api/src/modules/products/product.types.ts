export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  children: CategoryTreeItem[];
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilter {
  q: string;
  page?: number;
  limit?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{
    url: string;
    altText: string | null;
    isPrimary: boolean;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
