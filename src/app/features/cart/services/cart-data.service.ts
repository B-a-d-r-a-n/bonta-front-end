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
  basketQuery = injectQuery(() => {
    const id = this.cartStore.basketId();
    return { ...this.cartQueries.getBasketById(id), enabled: !!id };
  });

  updateBasketMutation = injectMutation(() => this.cartQueries.updateBasket());
  deleteBasketMutation = injectMutation(() => this.cartQueries.deleteBasket());

  // --- LOCAL UI STATE & COMPUTED SIGNALS ---
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
    effect(() => {
      const serverItems = this.basketQuery.data()?.items ?? [];
      this.items.set(JSON.parse(JSON.stringify(serverItems)));
    });
  }

  // --- ACTIONS ---
  addItem(product: ProductResponse, quantity: number = 1) {
    const basketId = this.cartStore.basketId();
    const currentBasket = this.basketQuery.data();
    const idToUpdate = basketId || uuidv4();
    const currentItems = currentBasket?.items ?? [];
    const newItems = [...currentItems];
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

    const basketToUpdate: BasketDTO = {
      id: idToUpdate,
      items: newItems,
      shippingPrice: currentBasket?.shippingPrice ?? 0,
    };

    this.updateBasketMutation.mutate(basketToUpdate, {
      onSuccess: (updatedBasket) => {
        if (!basketId) {
          this.cartStore.setId(updatedBasket.id);
        }
        this.toastService.showSuccess(
          'Added to Cart',
          `${product.name} has been added.`
        );
      },
      onError: (err) => {
        console.error('AddItem mutation failed:', err);
        this.toastService.showError('Error', 'Could not add item to cart.');
      },
    });
  }

  updateCart() {
    const currentBasket = this.basketQuery.data();
    if (currentBasket) {
      this.updateBasketMutation.mutate(
        { ...currentBasket, items: this.items() },
        {
          onSuccess: () =>
            this.toastService.showSuccess('Success', 'Cart updated.'),
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
