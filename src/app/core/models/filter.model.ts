import { ProductQueryParameters } from './product.model';

export interface ProductFilter {
  brandId?: number;
  typeId?: number;
  sort?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface FilterState {
  filters: ProductQueryParameters;
  isLoading: boolean;
  error: string | null;
}
