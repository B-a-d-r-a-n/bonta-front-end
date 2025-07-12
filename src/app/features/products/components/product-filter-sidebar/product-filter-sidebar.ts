import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BrandResponse,
  ProductSortingOptions,
  TypeResponse,
} from '@core/models';
import { ProductQueries } from '@features/products/queries/product.queries';
import { ProductFilterStore } from '@features/products/store/product-filter.store';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-filter-sidebar',
  imports: [
    FormsModule,
    AutoCompleteModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    DividerModule,
  ],
  templateUrl: './product-filter-sidebar.html',
  styleUrl: './product-filter-sidebar.scss',
})
export class ProductFilterSidebar {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productQueries = inject(ProductQueries);
  readonly filterStore = inject(ProductFilterStore);

  private searchSubject = new Subject<string>();

  brandsQuery = injectQuery(() => this.productQueries.getBrands());
  typesQuery = injectQuery(() => this.productQueries.getTypes());

  brandsData = computed(() => this.brandsQuery.data());
  typesData = computed(() => this.typesQuery.data());

  sortOptions = [
    { label: 'Name (A-Z)', value: ProductSortingOptions.NameAsc },
    { label: 'Name (Z-A)', value: ProductSortingOptions.NameDesc },
    { label: 'Price (Low to High)', value: ProductSortingOptions.PriceAsc },
    { label: 'Price (High to Low)', value: ProductSortingOptions.PriceDesc },
  ];

  brandSuggestions: BrandResponse[] = [];
  typeSuggestions: TypeResponse[] = [];
  sortSuggestions: any[] = [];

  // Local state for UI bindings, synced from the store
  selectedBrand: BrandResponse | null = null;
  selectedType: TypeResponse | null = null;
  selectedSort: { label: string; value: ProductSortingOptions } | null = null;

  constructor() {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((search) => {
        this.updateQueryParams({ search: search || null, page: 1 });
      });

    // This effect syncs the UI controls with the store's state (which is synced from the URL)
    effect(() => {
      const filters = this.filterStore.filters();
      const brands = this.brandsData();
      const types = this.typesData();

      if (brands)
        this.selectedBrand =
          brands.find((b) => b.id === filters.brandId) || null;
      if (types)
        this.selectedType = types.find((t) => t.id === filters.typeId) || null;
      this.selectedSort =
        this.sortOptions.find((s) => s.value === filters.sort) || null;
    });
  }

  // --- EVENT HANDLERS NOW UPDATE THE URL ---
  onSearchChange(event: Event) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }
  onBrandSelect(event: AutoCompleteSelectEvent) {
    this.updateQueryParams({ brandId: event.value.id, page: 1 });
  }
  onBrandClear() {
    this.updateQueryParams({ brandId: null, page: 1 });
  }
  onTypeSelect(event: AutoCompleteSelectEvent) {
    this.updateQueryParams({ typeId: event.value.id, page: 1 });
  }
  onTypeClear() {
    this.updateQueryParams({ typeId: null, page: 1 });
  }
  onSortSelect(event: AutoCompleteSelectEvent) {
    this.updateQueryParams({ sort: event.value.value, page: 1 });
  }

  clearFilters() {
    // Navigate to the base route with no query params, which will reset everything
    this.router.navigate([], { relativeTo: this.route });
  }

  // --- HELPER TO UPDATE URL ---
  private updateQueryParams(newParams: { [key: string]: any }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newParams,
      queryParamsHandling: 'merge', // Merges with existing params, null values remove params
    });
  }

  filterBrands(event: { query: string }) {
    this.brandSuggestions =
      this.brandsData()?.filter((b) =>
        b.name.toLowerCase().includes(event.query.toLowerCase())
      ) || [];
  }
  filterTypes(event: { query: string }) {
    this.typeSuggestions =
      this.typesData()?.filter((t) =>
        t.name.toLowerCase().includes(event.query.toLowerCase())
      ) || [];
  }
  filterSorts(event: { query: string }) {
    this.sortSuggestions = this.sortOptions.filter((s) =>
      s.label.toLowerCase().includes(event.query.toLowerCase())
    );
  }
}
