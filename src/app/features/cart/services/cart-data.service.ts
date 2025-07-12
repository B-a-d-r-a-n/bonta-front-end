import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { v4 as uuidv4 } from 'uuid';

import { CartStore } from '../store/cart.store';
import { CartQueries } from '../queries/cart.queries';
import { BasketDTO, BasketItemDTO, ProductResponse } from '@core/models';
import { ToastService } from '@core/services/toast.service';

@Injectable({ providedIn: 'root' })
export class CartDataService {
  private cartStore = inject(CartStore);
  private cartQueries = inject(CartQueries);
  private toastService = inject(ToastService);

  // --- QUERIES & MUTATIONS ---
  // The query reactively depends on the ID from the simple store.
  basketQuery = injectQuery(() => {
    const id = this.cartStore.basketId();
    return {
      ...this.cartQueries.getBasketById(id),
      enabled: !!id,
    };
  });

  updateBasketMutation = injectMutation(() => this.cartQueries.updateBasket());
  deleteBasketMutation = injectMutation(() => this.cartQueries.deleteBasket());

  // --- COMPUTED SIGNALS (for any component to use) ---
  items: WritableSignal<BasketItemDTO[]> = signal([]);
  isDirty = computed(
    () =>
      JSON.stringify(this.basketQuery.data()?.items ?? []) !==
      JSON.stringify(this.items())
  );
  itemCount = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );
  subtotal = computed(() =>
    this.items().reduce((total, item) => total + item.price * item.quantity, 0)
  );
  totalPrice = computed(
    () => this.subtotal() + (this.basketQuery.data()?.shippingPrice ?? 0)
  );

  constructor() {
    // The effect that syncs server data to our local editable state lives here.
    effect(() => {
      const serverItems = this.basketQuery.data()?.items ?? [];
      this.items.set(JSON.parse(JSON.stringify(serverItems)));
    });
  }

  // --- ACTIONS ---
  addItem(product: ProductResponse, quantity: number = 1) {
    let currentBasket = this.basketQuery.data();
    if (currentBasket) {
      const newItems = [...currentBasket.items];
      const itemIndex = newItems.findIndex((i) => i.id === product.id);
      if (itemIndex > -1) {
        newItems[itemIndex].quantity += quantity;
      } else {
        newItems.push({
          id: product.id,
          productName: product.name,
          pictureUrl: product.pictureUrl,
          price: product.price,
          quantity,
        });
      }
      this.updateBasketMutation.mutate(
        { ...currentBasket, items: newItems },
        {
          onSuccess: () =>
            this.toastService.showSuccess(
              'Added to Cart',
              `${product.name} has been added.`
            ),
        }
      );
    } else {
      const newBasketId = uuidv4();
      const newItem: BasketItemDTO = {
        id: product.id,
        productName: product.name,
        pictureUrl: product.pictureUrl,
        price: product.price,
        quantity,
      };
      const newBasket: BasketDTO = {
        id: newBasketId,
        items: [newItem],
        shippingPrice: 0,
      };
      this.updateBasketMutation.mutate(newBasket, {
        onSuccess: () => {
          this.cartStore.setId(newBasketId); // CRITICAL: Update the store's ID
          this.toastService.showSuccess(
            'Added to Cart',
            `${product.name} has been added.`
          );
        },
      });
    }
  }

  updateCart() {
    const currentBasket = this.basketQuery.data();
    if (currentBasket) {
      this.updateBasketMutation.mutate(
        { ...currentBasket, items: this.items() },
        {
          onSuccess: () =>
            this.toastService.showSuccess(
              'Success',
              'Cart updated successfully.'
            ),
        }
      );
    }
  }

  clearCart() {
    const id = this.cartStore.basketId();
    if (id) {
      this.deleteBasketMutation.mutate(id, {
        onSuccess: () => this.cartStore.setId(null),
      });
    }
  }
}
