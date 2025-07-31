import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { ProductQueries } from '@features/products/queries/product.queries';
import { ProductCardComponent } from '@features/products/components/product-card/product-card.component';
import {
  ProductResponse,
  ProductSortingOptions,
  BasketItemDTO,
  BasketDTO,
  TypeResponse,
} from '@core/models';
import { CartQueries } from '@features/cart/queries/cart.queries';
import { ToastService } from '@core/services/toast.service';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { v4 as uuidv4 } from 'uuid';
import { CartDataService } from '@features/cart/services/cart-data.service';

interface Category {
  label: string;
  icon: string;
  typeId: number;
  bgColor: string;
  textColor: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  imports: [
    CommonModule,
    CarouselModule,
    RouterLink,
    SkeletonModule,
    ButtonModule,
    ProductCardComponent,
  ],
})
export class LandingPageComponent {
  private productQueries = inject(ProductQueries);
  readonly cartDataService = inject(CartDataService);
  private toastService = inject(ToastService);

  featuredProductsQuery = injectQuery(() =>
    this.productQueries.getProductsWithFilter({
      pageIndex: 1,
      pageSize: 4,
      sort: ProductSortingOptions.NameAsc,
    })
  );

  typesQuery = injectQuery(() => this.productQueries.getTypes());

  // Computed signals for template usage
  isFeaturedProductsLoading = computed(() =>
    this.featuredProductsQuery.isPending()
  );
  featuredProductsData = computed(() => this.featuredProductsQuery.data());
  categories = computed(() => {
    const types = this.typesQuery.data();
    if (!types) {
      return [];
    }
    return types.map((type: TypeResponse) => ({
      label: type.name,
      icon: 'pi-comments',
      typeId: type.id,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
    }));
  });

  bannerImages = [
    {
      src: 'https://primefaces.org/cdn/primeng/images/galleria/galleria1.jpg',
      alt: 'Exciting new electronics collection',
    },
    {
      src: 'https://primefaces.org/cdn/primeng/images/galleria/galleria2.jpg',
      alt: 'Summer fashion sale up to 50% off',
    },
    {
      src: 'https://primefaces.org/cdn/primeng/images/galleria/galleria3.jpg',
      alt: 'Upgrade your home with our new appliances',
    },
  ];
}
