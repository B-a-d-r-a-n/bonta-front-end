import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import { computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { APP_CONSTANTS } from '../../../core/constants/app-constants';
import {
  ProductQueryParameters,
  ProductSortingOptions,
  FilterState,
} from '@core/models';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';
import { isPlatformBrowser } from '@angular/common';

const initialState: FilterState = {
  filters: {
    pageIndex: 1,
    pageSize: 12, // FIX: Change to 12 to match the first option in rowsPerPageOptions
    sort: ProductSortingOptions.NameAsc,
  },
  isLoading: false,
  error: null,
};

export const ProductFilterStore = signalStore(
  { providedIn: 'root' },
  withState<FilterState>(initialState),
  withComputed(({ filters }) => ({
    // Computed selectors for derived state
    hasActiveFilters: computed(() => {
      const currentFilters = filters();
      return !!(
        currentFilters.brandId ||
        currentFilters.typeId ||
        (currentFilters.sort &&
          currentFilters.sort !== ProductSortingOptions.NameAsc) ||
        currentFilters.search
      );
    }),

    filtersForQuery: computed(() => {
      const currentFilters = filters();
      return {
        brandId: currentFilters.brandId || undefined,
        typeId: currentFilters.typeId || undefined,
        sort: currentFilters.sort || ProductSortingOptions.NameAsc,
        search: currentFilters.search || undefined,
        pageIndex: currentFilters.pageIndex || 1,
        pageSize: currentFilters.pageSize || APP_CONSTANTS.DEFAULT_PAGE_SIZE,
      };
    }),

    // Computed for pagination info
    paginationInfo: computed(() => {
      const currentFilters = filters();
      return {
        currentPage: currentFilters.pageIndex || 1,
        pageSize: currentFilters.pageSize || APP_CONSTANTS.DEFAULT_PAGE_SIZE,
        hasNextPage: true, // This would be computed based on total count from API
      };
    }),
  })),
  withMethods((store) => ({
    // Set complete filters
    setFilters: (filters: ProductQueryParameters) => {
      patchState(store, { filters, error: null });
    },
    // Private-like method to update state without navigating
    _updateFiltersFromUrl: (filters: ProductQueryParameters) => {
      patchState(store, { filters });
    },
    // Update partial filters
    updateFilters: (filters: Partial<ProductQueryParameters>) => {
      const currentFilters = store.filters();
      patchState(store, {
        filters: { ...currentFilters, ...filters },
        error: null,
      });
    },

    // Reset filters to initial state
    resetFilters: () => {
      patchState(store, {
        filters: {
          pageIndex: 1,
          pageSize: 12, // FIX: Reset to 12 as well
          sort: ProductSortingOptions.NameAsc,
        },
        error: null,
      });
    },

    // Individual filter setters with proper typing
    setBrand: (brandId: number | null) => {
      // FIX: Create a new object instead of mutating
      patchState(store, (state) => ({
        filters: {
          ...state.filters,
          brandId: brandId || undefined,
          pageIndex: 1,
        },
      }));
    },

    setType: (typeId: number | null) => {
      patchState(store, (state) => ({
        filters: {
          ...state.filters,
          typeId: typeId || undefined,
          pageIndex: 1,
        },
      }));
    },

    setSort: (sort: ProductSortingOptions) => {
      patchState(store, (state) => ({
        filters: { ...state.filters, sort, pageIndex: 1 },
      }));
    },

    setSearch: (search: string | null) => {
      patchState(store, (state) => ({
        filters: {
          ...state.filters,
          search: search || undefined,
          pageIndex: 1,
        },
      }));
    },

    setPage: (pageIndex: number) => {
      patchState(store, (state) => ({
        filters: { ...state.filters, pageIndex },
      }));
    },

    setPageSize: (pageSize: number) => {
      patchState(store, (state) => ({
        filters: { ...state.filters, pageSize, pageIndex: 1 },
      }));
    },

    // Loading state management
    setLoading: (isLoading: boolean) => {
      patchState(store, { isLoading });
    },

    // Error handling
    setError: (error: string | null) => {
      patchState(store, { error });
    },

    clearError: () => {
      patchState(store, { error: null });
    },
  })),
  withHooks({
    onInit: (store) => {
      // Inject PLATFORM_ID to check if we are in the browser
      const platformId = inject(PLATFORM_ID);

      if (isPlatformBrowser(platformId)) {
        // Load filters from localStorage only on the browser
        const savedFilters = localStorage.getItem(STORAGE_KEYS.PRODUCT_FILTERS);
        if (savedFilters) {
          try {
            const filters = JSON.parse(savedFilters);
            if (
              filters.sort &&
              !Object.values(ProductSortingOptions).includes(filters.sort)
            ) {
              filters.sort = ProductSortingOptions.NameAsc;
            }
            patchState(store, { filters });
          } catch (error) {
            console.warn('Failed to load filters from localStorage:', error);
          }
        }
        // Auto-save filters to localStorage when they change
        effect(() => {
          localStorage.setItem(
            STORAGE_KEYS.PRODUCT_FILTERS,
            JSON.stringify(store.filters())
          );
        });
      }
    },
  })
);

// Export the filters signal directly
export const filters = (ProductFilterStore as any).filters;
