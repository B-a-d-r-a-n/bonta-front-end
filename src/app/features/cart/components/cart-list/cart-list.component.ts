import {
  Component,
  computed,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

// Core & Shared Imports
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { CartQueries } from '../../queries/cart.queries';
import { BasketItemDTO, BasketDTO } from '@core/models';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CurrencyPipe,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    MessageModule,
    InputNumberModule,
    TooltipModule,
  ],
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss'],
})
export class CartListComponent {
  private cartQueries = inject(CartQueries);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  // Use a writable signal for basketId to allow clearing it.
  private basketId: WritableSignal<string | null> = signal(
    StorageUtils.getLocalItem<string>(STORAGE_KEYS.BASKET_ID)
  );

  basketQuery = injectQuery(() => {
    const id = this.basketId();
    return {
      ...this.cartQueries.getBasketById(id!),
      enabled: id !== 'invalid-id',
    };
  });

  updateBasketMutation = injectMutation(() => this.cartQueries.updateBasket());
  deleteBasketMutation = injectMutation(() => this.cartQueries.deleteBasket());

  localCartItems: WritableSignal<BasketItemDTO[]> = signal([]);

  isCartDirty = computed(() => {
    const serverItems = this.basketQuery.data()?.items ?? [];
    const localItems = this.localCartItems();
    if (serverItems.length !== localItems.length) return true;
    return JSON.stringify(serverItems) !== JSON.stringify(localItems);
  });

  constructor() {
    effect(() => {
      const serverItems = this.basketQuery.data()?.items;
      if (serverItems) {
        this.localCartItems.set(JSON.parse(JSON.stringify(serverItems)));
      } else {
        this.localCartItems.set([]);
      }
    });
  }

  onQuantityChange(itemId: number, newQuantity: number | null): void {
    const quantity = newQuantity ?? 1;
    this.localCartItems.update((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: quantity } : item
      )
    );
  }

  updateCart(): void {
    const currentBasket = this.basketQuery.data();
    if (currentBasket) {
      const updatedBasket: BasketDTO = {
        ...currentBasket,
        items: this.localCartItems(),
      };
      this.updateBasketMutation.mutate(updatedBasket, {
        onSuccess: (result) => {
          this.toastService.showSuccess(
            'Success',
            'Cart updated successfully.'
          );
          // THIS IS THE NEW LOGIC
          if (!result.items || result.items.length === 0) {
            this.handleEmptyCart();
          }
        },
        onError: () => {
          this.toastService.showError('Error', 'Failed to update cart.');
        },
      });
    }
  }

  removeItem(itemToRemove: BasketItemDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${itemToRemove.productName} from your cart?`,
      header: 'Confirm Removal',
      icon: 'pi pi-info-circle',
      accept: () => {
        const currentBasket = this.basketQuery.data();
        if (currentBasket) {
          const updatedBasket: BasketDTO = {
            ...currentBasket,
            items: currentBasket.items.filter((i) => i.id !== itemToRemove.id),
          };
          this.updateBasketMutation.mutate(updatedBasket, {
            onSuccess: (result) => {
              if (!result.items || result.items.length === 0) {
                this.handleEmptyCart();
              }
            },
          });
        }
      },
    });
  }

  clearCart(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to empty your entire cart?',
      header: 'Confirm Clear Cart',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const id = this.basketId();
        if (id) {
          this.deleteBasketMutation.mutate(id, {
            onSuccess: () => {
              // THIS IS THE NEW LOGIC
              this.handleEmptyCart();
            },
          });
        }
      },
    });
  }

  private handleEmptyCart(): void {
    StorageUtils.removeLocalItem(STORAGE_KEYS.BASKET_ID);
    // Set the signal to our known invalid state.
    this.basketId.set('invalid-id');
  }

  getSubtotal = computed(() => {
    return this.localCartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  });

  getTotalPrice = computed(() => {
    const shipping = this.basketQuery.data()?.shippingPrice ?? 0;
    return this.getSubtotal() + shipping;
  });
}
