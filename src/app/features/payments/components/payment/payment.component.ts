import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastService } from '@core/services/toast.service';

// Stripe
import { Stripe, StripeCardNumberElement, loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';
import { OrderQueries } from '@features/orders/queries/order.queries';
import { OrderRequest } from '@core/models';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    CardModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent {
  private router = inject(Router);
  private orderQueries = inject(OrderQueries);
  private toastService = inject(ToastService);
  private queryClient = inject(QueryClient);

  // Get data passed from checkout component
  private navigationState = this.router.getCurrentNavigation()?.extras.state;
  orderRequest: OrderRequest | null = this.navigationState?.['orderRequest'];
  clientSecret: string | null = this.navigationState?.['clientSecret'];
  totalAmount: number | null = this.navigationState?.['total']; // Receive the total amount

  // Stripe.js state
  stripe: Stripe | null = null;
  cardElement: StripeCardNumberElement | null = null;
  @ViewChild('cardElement') cardElementRef?: ElementRef;

  // UI state signals
  isLoading = signal(true);
  isProcessing = signal(false);
  cardError = signal<string | null>(null);

  createOrderMutation = injectMutation(() => this.orderQueries.createOrder());

  constructor() {
    if (!this.orderRequest || !this.clientSecret || this.totalAmount === null) {
      // Add check for total
      this.toastService.showError('Error', 'Invalid checkout state.');
      this.router.navigate(['/cart']);
      return;
    }

    // Use afterNextRender for safe DOM access and to load Stripe
    afterNextRender(async () => {
      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (this.stripe && this.clientSecret) {
        const elements = this.stripe.elements({
          clientSecret: this.clientSecret,
        });
        this.cardElement = elements.create('cardNumber');
        this.cardElement.mount(this.cardElementRef!.nativeElement);
        // Also create and mount other elements
        elements.create('cardExpiry').mount('#card-expiry-element');
        elements.create('cardCvc').mount('#card-cvc-element');

        this.cardElement.on('change', (event) => {
          this.cardError.set(event.error ? event.error.message : null);
        });
        this.isLoading.set(false);
      }
    });
  }

  async processPayment() {
    if (!this.stripe || !this.cardElement || !this.orderRequest) return;
    this.isProcessing.set(true);
    this.cardError.set(null);

    // Step 1: Create the Order in our database (in 'Pending' state)
    this.createOrderMutation.mutate(this.orderRequest, {
      onSuccess: async (order) => {
        // Step 2: With the order created, confirm the payment with Stripe
        const result = await this.stripe!.confirmCardPayment(
          this.clientSecret!
        );

        if (result.error) {
          this.cardError.set(
            result.error.message ?? 'An unknown payment error occurred.'
          );
          this.isProcessing.set(false);
        } else {
          if (result.paymentIntent?.status === 'succeeded') {
            // Payment succeeded! The webhook will handle the backend update.
            // Clear the cart and navigate to the success page.
            this.queryClient.removeQueries({ queryKey: ['basket'] });
            StorageUtils.removeLocalItem(STORAGE_KEYS.BASKET_ID);
            this.router.navigate(['/orders/success', order.id]);
          }
        }
      },
      onError: (error: any) => {
        this.toastService.showError(
          'Error',
          'Could not create order before payment.'
        );
        this.isProcessing.set(false);
      },
    });
  }
}
