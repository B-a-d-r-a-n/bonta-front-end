export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  pictureUrl: string;
  price: number;
  productType: string;
  productBrand: string;
}

export interface ProductQueryParameters {
  brandId?: number;
  typeId?: number;
  sort: ProductSortingOptions;
  search?: string;
  pageIndex: number;
  pageSize: number;
}

export enum ProductSortingOptions {
  NameAsc = 'NameAsc',
  NameDesc = 'NameDesc',
  PriceAsc = 'PriceAsc',
  PriceDesc = 'PriceDesc',
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface BrandResponse {
  id: number;
  name: string;
}

export interface TypeResponse {
  id: number;
  name: string;
}
