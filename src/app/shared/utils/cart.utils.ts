import { computed, signal } from '@angular/core';
import { BasketDTO, BasketItemDTO } from '../../core/models/basket.model';

export class CartUtils {
  // Signals for cart state
  private cartItems = signal<BasketItemDTO[]>([]);
  private isLoading = signal(false);

  // Computed signals for derived state
  public itemCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  public total = computed(() => {
    return this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  });

  public isEmpty = computed(() => {
    return this.cartItems().length === 0;
  });

  public hasItems = computed(() => {
    return this.cartItems().length > 0;
  });

  // Methods to update cart state
  setCartItems(items: BasketItemDTO[]): void {
    this.cartItems.set(items);
  }

  updateCartFromBasket(basket: BasketDTO): void {
    this.cartItems.set(basket.items);
  }

  addItem(item: BasketItemDTO): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex((i) => i.id === item.id);

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity,
      };
      this.cartItems.set(updatedItems);
    } else {
      // Add new item
      this.cartItems.set([...currentItems, item]);
    }
  }

  updateItemQuantity(productId: number, quantity: number): void {
    const currentItems = this.cartItems();
    const itemIndex = currentItems.findIndex((i) => i.id === productId);

    if (itemIndex >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity,
      };
      this.cartItems.set(updatedItems);
    }
  }

  removeItem(productId: number): void {
    const currentItems = this.cartItems();
    const filteredItems = currentItems.filter((item) => item.id !== productId);
    this.cartItems.set(filteredItems);
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  // Utility methods
  getItemById(productId: number): BasketItemDTO | undefined {
    return this.cartItems().find((item) => item.id === productId);
  }

  getItemQuantity(productId: number): number {
    const item = this.getItemById(productId);
    return item?.quantity || 0;
  }

  // Formatting utilities
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatTotal(): string {
    return this.formatCurrency(this.total());
  }
}
