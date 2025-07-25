import { Component, inject } from '@angular/core';
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
import { BasketItemDTO } from '@core/models';
import { CartDataService } from '@features/cart/services/cart-data.service';

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
  // Inject the one service that holds all state and logic.
  readonly cartService = inject(CartDataService);
  private confirmationService = inject(ConfirmationService);

  // This component is now extremely simple. All logic lives in the service.

  onQuantityChange(itemId: number, newQuantity: number | null): void {
    // When the UI changes, we update the local "draft" state in the service.
    this.cartService.items.update((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity ?? 1 } : item
      )
    );
  }

  removeItem(itemToRemove: BasketItemDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove ${itemToRemove.productName} from your cart?`,
      header: 'Confirm Removal',
      icon: 'pi pi-info-circle',
      accept: () => {
        const currentBasket = this.cartService.basketQuery.data();
        if (currentBasket) {
          const updatedItems = this.cartService
            .items()
            .filter((i) => i.id !== itemToRemove.id);
          // Call the mutation with the new item list.
          this.cartService.updateBasketMutation.mutate({
            ...currentBasket,
            items: updatedItems,
          });
        }
      },
    });
  }
}
