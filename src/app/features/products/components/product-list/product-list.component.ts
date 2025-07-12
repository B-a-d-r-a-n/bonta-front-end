import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';

// PrimeNG Modules
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

// Core & Shared Imports
import { ProductQueries } from '../../queries/product.queries';
import { CartQueries } from '@features/cart/queries/cart.queries';
import { ProductFilterStore } from '../../store/product-filter.store';
import {
  ProductResponse,
  ProductQueryParameters,
  BasketDTO,
} from '@core/models';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ToastService } from '@core/services/toast.service';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { ProductFilterSidebar } from '../product-filter-sidebar/product-filter-sidebar';
import { CartDataService } from '@features/cart/services/cart-data.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    PaginatorModule,
    SkeletonModule,
    ButtonModule,
    DrawerModule,
    ProductFilterSidebar,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productQueries = inject(ProductQueries);
  readonly cartDataService = inject(CartDataService);
  private toastService = inject(ToastService);
  readonly filterStore = inject(ProductFilterStore);

  productsQuery = injectQuery(() => {
    const params = this.filterStore.filtersForQuery();
    return {
      queryKey: ['products', params],
      queryFn: () => this.productQueries.fetchProducts(params),
    };
  });

  isProductsLoading = computed(() => this.productsQuery.isPending());
  productsData = computed(() => this.productsQuery.data());
  productsError = computed(() => this.productsQuery.error());
  skeletonItems = computed(() => Array(this.filterStore.filters().pageSize));

  sidebarVisible = signal(false);

  ngOnInit(): void {
    // The single source of truth: listen to URL changes to update the store.
    this.route.queryParams.subscribe((params) => {
      const filters: ProductQueryParameters = {
        pageIndex: params['page'] ? parseInt(params['page'], 10) : 1,
        pageSize: params['pageSize'] ? parseInt(params['pageSize'], 10) : 12,
        sort: params['sort'] || 'NameAsc',
        brandId: params['brandId']
          ? parseInt(params['brandId'], 10)
          : undefined,
        typeId: params['typeId'] ? parseInt(params['typeId'], 10) : undefined,
        search: params['search'] || undefined,
      };
      (this.filterStore as any)._updateFiltersFromUrl(filters);
    });
  }
  constructor() {
    effect(() => {
      const queryResult = this.productsQuery.data();

      if (queryResult) {
        console.log(
          '%c[Product List] API Response Received:',
          'color: green; font-weight: bold;'
        );
        console.log(`- Page Index: ${queryResult.pageIndex}`);
        console.log(`- Page Size: ${queryResult.pageSize}`);
        console.log(`- Total Count: ${queryResult.count}`);
        console.log(`- Items in this response: ${queryResult.data.length}`); // This is the number we need to check
        console.log('- Full Data Object:', queryResult); // Log the entire object for inspection
      }
    });
  }

  onPageChange(event: PaginatorState): void {
    // This handler only needs to update the URL. The ngOnInit subscription will do the rest.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: (event.page ?? 0) + 1,
        pageSize: event.rows,
      },
      queryParamsHandling: 'merge',
    });
  }

  retryFetch() {
    this.productsQuery.refetch();
  }
}
