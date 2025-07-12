import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { BasketDTO } from '@core/models';
import {
  injectQuery,
  injectMutation,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    ToastModule,
    MessageModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    InputTextModule,
    CheckboxModule,
  ],
  providers: [MessageService],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  // Form signals
  selectedPaymentMethod = signal('card');
  cardNumber = signal('');
  expiryDate = signal('');
  cvv = signal('');
  billingAddress = signal('');
  acceptedTerms = signal(false);

  // Basket query
  basketId = signal(
    StorageUtils.getLocalItem<string>(STORAGE_KEYS.BASKET_ID) || ''
  );

  basketQuery = injectQuery(() => ({
    queryKey: ['basket', this.basketId()],
    queryFn: () =>
      lastValueFrom(
        this.http.get<BasketDTO>(
          `${environment.apiUrl}${API_ENDPOINTS.BASKETS.GET}/${this.basketId()}`
        )
      ),
    enabled: !!this.basketId(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  }));

  paymentMutation = injectMutation(() => ({
    mutationFn: (basketId: string) =>
      lastValueFrom(
        this.http.post<BasketDTO>(
          `${environment.apiUrl}${API_ENDPOINTS.PAYMENTS.CREATE_PAYMENT_INTENT}/${basketId}`,
          {}
        )
      ),
    onSuccess: (basket: BasketDTO) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Payment Successful',
        detail: 'Your payment has been processed successfully.',
      });
      // Navigate to success page or order confirmation
      this.router.navigate(['/orders/success']);
    },
    onError: (error: any) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Failed',
        detail: 'There was an error processing your payment. Please try again.',
      });
    },
    retry: 3,
  }));

  // Computed signals for template usage
  isBasketLoading = computed(() => this.basketQuery.isPending());
  basketData = computed(() => this.basketQuery.data());
  basketError = computed(() => this.basketQuery.error());
  isPaymentPending = computed(() => this.paymentMutation.isPending());

  getSubtotal(): number {
    const basket = this.basketData();
    if (!basket?.items) return 0;
    return basket.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  getTax(): number {
    return this.getSubtotal() * 0.1; // 10% tax
  }

  getTotal(): number {
    const basket = this.basketData();
    const shipping = basket?.shippingPrice || 0;
    return this.getSubtotal() + this.getTax() + shipping;
  }

  processPayment(): void {
    if (this.acceptedTerms() && this.basketId()) {
      this.paymentMutation.mutate(this.basketId());
    }
  }
}
