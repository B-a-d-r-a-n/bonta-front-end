import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProductResponse } from '@core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    CardModule,
    ButtonModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductResponse;
  @Output() addToCartClicked = new EventEmitter<ProductResponse>();

  private router = inject(Router);

  isAddingToCart = signal(false);

  addToCart(): void {
    // We emit the event and let the parent component handle the logic,
    // which has access to the cart state.
    this.isAddingToCart.set(true);
    this.addToCartClicked.emit(this.product);
    // The parent component will be responsible for setting this back to false
    // or the mutation's `onSettled` will implicitly handle it.
    // For a better UX, we'll just simulate a short delay.
    setTimeout(() => this.isAddingToCart.set(false), 500);
  }

  viewDetails(): void {
    this.router.navigate(['/products', this.product.id]);
  }

  onImageError(): void {
    console.warn('Image failed to load for product:', this.product.name);
    // Optionally, set a placeholder image via a signal if needed
  }
}
