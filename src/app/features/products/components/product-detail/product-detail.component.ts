import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { v4 as uuidv4 } from 'uuid';

import { ProductResponse, BasketItemDTO, BasketDTO } from '@core/models';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { ProductQueries } from '../../queries/product.queries';
import { CartQueries } from '@features/cart/queries/cart.queries';
import { ToastService } from '@core/services/toast.service';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { CartDataService } from '@features/cart/services/cart-data.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonModule, ToastModule],
  providers: [ToastService],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private productQueries = inject(ProductQueries);
  readonly cartDataService = inject(CartDataService);
  private toastService = inject(ToastService);

  quantity = signal(1);
  productId = signal(0);

  constructor() {
    this.route.params.subscribe((params) => {
      this.productId.set(Number(params['id']));
    });
  }

  productQuery = injectQuery(() =>
    this.productQueries.getProductById(this.productId())
  );

  isProductLoading = computed(() => this.productQuery.isPending());
  productData = computed(() => this.productQuery.data());
  productError = computed(() => this.productQuery.error());

  addToCart(): void {
    const product = this.productQuery.data();
    if (product) {
      // Pass product and quantity as separate arguments
      this.cartDataService.addItem(product, this.quantity());
    }
  }

  decreaseQuantity(): void {
    this.quantity.update((q) => (q > 1 ? q - 1 : 1));
  }

  increaseQuantity(): void {
    this.quantity.update((q) => q + 1);
  }

  addToWishlist(): void {
    this.toastService.showInfo(
      'Coming Soon',
      'Wishlist feature is on its way!'
    );
  }

  onImageError(): void {
    console.warn('Image failed to load for product:', this.productData()?.name);
  }
}
