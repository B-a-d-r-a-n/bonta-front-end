import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  ProductResponse,
  PaginatedResponse,
  ProductQueryParameters,
  BrandResponse,
  TypeResponse,
} from '@core/models';
import { API_URL } from 'app/app.config';

@Injectable({ providedIn: 'root' })
export class ProductQueries {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private apiUrl = inject(API_URL);

  // Query keys
  private static readonly PRODUCTS_KEY = ['products'];
  private static readonly PRODUCT_KEY = (id: number) => ['product', id];
  private static readonly BRANDS_KEY = ['brands'];
  private static readonly TYPES_KEY = ['types'];

  // Get paginated products with filter
  getProductsWithFilter(params: ProductQueryParameters) {
    return {
      queryKey: [...ProductQueries.PRODUCTS_KEY, params],
      queryFn: () => this.fetchProducts(params),
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    };
  }

  // Get single product by id
  getProductById(id: number) {
    return {
      queryKey: ProductQueries.PRODUCT_KEY(id),
      queryFn: () => this.fetchProduct(id),
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    };
  }

  // Get brands
  getBrands() {
    return {
      queryKey: ProductQueries.BRANDS_KEY,
      queryFn: () => this.fetchBrands(),
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
    };
  }

  // Get types
  getTypes() {
    return {
      queryKey: ProductQueries.TYPES_KEY,
      queryFn: () => this.fetchTypes(),
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
    };
  }

  // API methods
  fetchProducts(
    params?: ProductQueryParameters
  ): Promise<PaginatedResponse<ProductResponse>> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.brandId)
        queryParams.append('BrandId', params.brandId.toString()); // FIX: PascalCase
      if (params.typeId) queryParams.append('TypeId', params.typeId.toString()); // FIX: PascalCase
      if (params.sort) queryParams.append('Sort', params.sort); // FIX: PascalCase
      if (params.search) queryParams.append('Search', params.search); // FIX: PascalCase
      if (params.pageIndex !== undefined)
        // Use !== undefined to allow page 0
        queryParams.append('PageIndex', params.pageIndex.toString()); // FIX: PascalCase
      if (params.pageSize)
        queryParams.append('PageSize', params.pageSize.toString()); // FIX: PascalCase
    }

    return lastValueFrom(
      this.http.get<PaginatedResponse<ProductResponse>>(
        `${this.apiUrl}${
          API_ENDPOINTS.PRODUCTS.GET_PRODUCTS
        }?${queryParams.toString()}`
      )
    );
  }

  private fetchProduct(id: number): Promise<ProductResponse> {
    return lastValueFrom(
      this.http.get<ProductResponse>(
        `${this.apiUrl}${API_ENDPOINTS.PRODUCTS.GET_PRODUCT(id)}`
      )
    );
  }

  private fetchBrands(): Promise<BrandResponse[]> {
    return lastValueFrom(
      this.http.get<BrandResponse[]>(
        `${this.apiUrl}${API_ENDPOINTS.PRODUCTS.GET_BRANDS}`
      )
    );
  }

  private fetchTypes(): Promise<TypeResponse[]> {
    return lastValueFrom(
      this.http.get<TypeResponse[]>(
        `${this.apiUrl}${API_ENDPOINTS.PRODUCTS.GET_TYPES}`
      )
    );
  }
}
