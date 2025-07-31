import {
  Component,
  inject,
  signal,
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
import {
  Stripe,
  StripeCardNumberElement,
  StripeCardExpiryElement,
  StripeCardCvcElement,
  loadStripe,
} from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';
import { OrderQueries } from '@features/orders/queries/order.queries';
import { OrderRequest, BasketDTO, ErrorDetails } from '@core/models';
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
  totalAmount: number | null = this.navigationState?.['total'];

  // Stripe.js state
  stripe: Stripe | null = null;
  elements: any;

  @ViewChild('cardNumber') cardNumberRef?: ElementRef;
  @ViewChild('cardExpiry') cardExpiryRef?: ElementRef;
  @ViewChild('cardCvc') cardCvcRef?: ElementRef;

  // UI state signals
  isLoading = signal(true);
  isProcessing = signal(false);
  cardError = signal<string | null>(null);

  createOrderMutation = injectMutation(() => this.orderQueries.createOrder());

  constructor() {
    if (!this.orderRequest || !this.clientSecret || this.totalAmount === null) {
      this.toastService.showError(
        'Error',
        'Invalid checkout state. Please try again.'
      );
      this.router.navigate(['/cart']);
      return;
    }

    afterNextRender(async () => {
      try {
        this.stripe = await loadStripe(environment.stripePublishableKey);
        this.mountStripeElements();
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        this.cardError.set('Could not initialize payment gateway.');
        this.isLoading.set(false);
      }
    });
  }

  mountStripeElements(): void {
    if (!this.stripe || !this.clientSecret) {
      this.cardError.set('Payment gateway is not ready.');
      this.isLoading.set(false);
      return;
    }

    if (!this.cardNumberRef || !this.cardExpiryRef || !this.cardCvcRef) {
      setTimeout(() => this.mountStripeElements(), 50);
      return;
    }

    this.elements = this.stripe.elements({
      // Store the elements instance
      clientSecret: this.clientSecret,
      appearance: { theme: 'stripe' },
    });

    this.elements.create('cardNumber').mount(this.cardNumberRef.nativeElement);
    this.elements.create('cardExpiry').mount(this.cardExpiryRef.nativeElement);
    this.elements.create('cardCvc').mount(this.cardCvcRef.nativeElement);

    this.isLoading.set(false);
  }

  async processPayment() {
    if (
      !this.stripe ||
      !this.elements ||
      !this.orderRequest ||
      !this.clientSecret
    ) {
      this.cardError.set('Payment form is not ready. Please refresh.');
      return;
    }
    this.isProcessing.set(true);
    this.cardError.set(null);

    // Step 1: Create the Order in our database (this is a good practice)
    this.createOrderMutation.mutate(this.orderRequest, {
      onSuccess: async (order) => {
        // Step 2: Confirm the payment with Stripe

        const { error, paymentIntent } = await this.stripe!.confirmPayment({
          elements: this.elements, // Pass the elements group, not a single element
          confirmParams: {
            return_url: `${window.location.origin}/orders/success/${order.id}`,
          },
          redirect: 'if_required', // Prevents unnecessary redirects
        });

        if (error) {
          this.cardError.set(
            error.message ?? 'An unknown payment error occurred.'
          );
          this.isProcessing.set(false);
        } else if (paymentIntent?.status === 'succeeded') {
          // Payment succeeded!
          this.queryClient.removeQueries({ queryKey: ['basket'] });
          StorageUtils.removeLocalItem(STORAGE_KEYS.BASKET_ID);
          this.toastService.showSuccess(
            'Payment Successful!',
            `Order #${order.id.substring(0, 8)} placed.`
          );
          this.router.navigate(['/orders/success', order.id]);
        } else {
          this.cardError.set('Payment requires further action or has failed.');
          this.isProcessing.set(false);
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
