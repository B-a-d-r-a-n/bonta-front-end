import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  OrderRequest,
  OrderResponse,
  DeliveryMethodResponse,
  OrderListResponse,
  ErrorDetails,
} from '@core/models';
import { API_URL } from 'app/app.config';

@Injectable({ providedIn: 'root' })
export class OrderQueries {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private apiUrl = inject(API_URL);

  // Query keys
  private static readonly ORDERS_KEY = ['orders'];
  private static readonly DELIVERY_METHODS_KEY = ['deliveryMethods'];

  // Get user orders
  getOrders() {
    return {
      queryKey: OrderQueries.ORDERS_KEY,
      queryFn: () => this.fetchOrders(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    };
  }

  // Get delivery methods
  getDeliveryMethods() {
    return {
      queryKey: OrderQueries.DELIVERY_METHODS_KEY,
      queryFn: () => this.fetchDeliveryMethods(),
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
    };
  }

  // Create order mutation
  createOrder() {
    return {
      mutationFn: (request: OrderRequest) => this.createOrderRequest(request),
      onSuccess: () => {
        // Invalidate orders query
        this.queryClient.invalidateQueries({
          queryKey: OrderQueries.ORDERS_KEY,
        });
        // Invalidate basket query (since order creation clears the basket)
        this.queryClient.invalidateQueries({ queryKey: ['basket'] });
      },
      onError: (error: ErrorDetails) => {
        console.error('Order creation failed:', error.errorMessage);
      },
      retry: 3,
    };
  }

  // API methods
  private fetchOrders(): Promise<OrderResponse[]> {
    return lastValueFrom(
      this.http.get<OrderResponse[]>(
        `${this.apiUrl}${API_ENDPOINTS.ORDERS.GET_ORDERS}`
      )
    );
  }

  private fetchDeliveryMethods(): Promise<DeliveryMethodResponse[]> {
    return lastValueFrom(
      this.http.get<DeliveryMethodResponse[]>(
        `${this.apiUrl}${API_ENDPOINTS.ORDERS.DELIVERY_METHODS}`
      )
    );
  }

  private createOrderRequest(request: OrderRequest): Promise<OrderResponse> {
    return lastValueFrom(
      this.http.post<OrderResponse>(
        `${this.apiUrl}${API_ENDPOINTS.ORDERS.CREATE}`,
        request
      )
    );
  }
}
