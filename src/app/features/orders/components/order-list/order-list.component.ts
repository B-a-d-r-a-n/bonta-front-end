import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { OrderResponse } from '@core/models';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@core/enums/order-status.enum';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    PaginatorModule,
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Query for user orders
  ordersQuery = injectQuery(() => ({
    queryKey: ['orders'],
    queryFn: () =>
      lastValueFrom(
        this.http.get<OrderResponse[]>(
          `${environment.apiUrl}${API_ENDPOINTS.ORDERS.GET_ORDERS}`
        )
      ),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  }));

  // Computed signals for template usage
  isOrdersLoading = computed(() => this.ordersQuery.isPending());
  ordersData = computed(() => this.ordersQuery.data());
  ordersError = computed(() => this.ordersQuery.error());

  getStatusLabel(status: string): string {
    return (
      ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status
    );
  }

  getStatusColor(status: string): string {
    return (
      ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] ||
      'bg-gray-500'
    );
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  cancelOrder(orderId: string): void {
    // Implement cancel order logic
    console.log('Cancel order:', orderId);
  }

  trackPackage(orderId: string): void {
    // Implement track package logic
    console.log('Track package:', orderId);
  }

  writeReview(orderId: string): void {
    // Implement write review logic
    console.log('Write review:', orderId);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
