import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import {
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { BasketDTO, ErrorDetails } from '@core/models';
import { API_URL } from 'app/app.config';

export interface PaymentIntentRequest {
  basketId: string;
}

export interface PaymentWebhookRequest {
  // Add webhook request properties as needed
  [key: string]: any;
}

export class PaymentQueries {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private apiUrl = inject(API_URL);

  // Query keys
  private static readonly PAYMENT_INTENT_KEY = ['paymentIntent'];

  // Create payment intent mutation
  createPaymentIntent = injectMutation(() => ({
    mutationFn: (request: PaymentIntentRequest) =>
      this.createPaymentIntentRequest(request),
    onSuccess: (updatedBasket: BasketDTO) => {
      // Update basket with payment intent data
      this.queryClient.setQueryData(['basket'], updatedBasket);
    },
    onError: (error: ErrorDetails) => {
      console.error('Payment intent creation failed:', error.errorMessage);
    },
    retry: 3,
  }));

  // Process webhook mutation
  processWebhook = injectMutation(() => ({
    mutationFn: (request: PaymentWebhookRequest) =>
      this.processWebhookRequest(request),
    onSuccess: () => {
      // Invalidate relevant queries after webhook processing
      this.queryClient.invalidateQueries({ queryKey: ['orders'] });
      this.queryClient.invalidateQueries({ queryKey: ['basket'] });
    },
    onError: (error: ErrorDetails) => {
      console.error('Webhook processing failed:', error.errorMessage);
    },
    retry: 1,
  }));

  // API methods
  private createPaymentIntentRequest(
    request: PaymentIntentRequest
  ): Promise<BasketDTO> {
    return lastValueFrom(
      this.http.post<BasketDTO>(
        `${this.apiUrl}${API_ENDPOINTS.PAYMENTS.CREATE_PAYMENT_INTENT}`,
        request
      )
    );
  }

  private processWebhookRequest(request: PaymentWebhookRequest): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(
        `${this.apiUrl}${API_ENDPOINTS.PAYMENTS.WEBHOOK}`,
        request
      )
    );
  }
}
