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
} from '@core/models';
import { CartQueries } from '@features/cart/queries/cart.queries';
import { ToastService } from '@core/services/toast.service';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { v4 as uuidv4 } from 'uuid';
import { CartDataService } from '@features/cart/services/cart-data.service';

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

  // Computed signals for template usage
  isFeaturedProductsLoading = computed(() =>
    this.featuredProductsQuery.isPending()
  );
  featuredProductsData = computed(() => this.featuredProductsQuery.data());

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

  categories = [
    {
      label: 'Electronics',
      icon: 'pi-headphones',
      typeId: 1,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Fashion',
      icon: 'pi-user',
      typeId: 2,
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
    },
    {
      label: 'Home',
      icon: 'pi-home',
      typeId: 3,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Kids',
      icon: 'pi-prime',
      typeId: 4,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Beauty',
      icon: 'pi-gift',
      typeId: 5,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      label: 'Mobiles',
      icon: 'pi-mobile',
      typeId: 6,
      bgColor: 'bg-gray-200',
      textColor: 'text-gray-700',
    },
    {
      label: 'Books',
      icon: 'pi-book',
      typeId: 7,
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
    },
    {
      label: 'Sports',
      icon: 'pi-bolt',
      typeId: 8,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
  ];
}
