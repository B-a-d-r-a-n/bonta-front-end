import { AddressDTO } from './address.model';

export interface OrderRequest {
  basketId: string;
  shipToAddress: AddressDTO;
  deliveryMethodId: number;
}

export interface OrderResponse {
  id: string; // Guid as string
  buyerEmail: string;
  orderDate: string; // ISO date string
  shipToAddress: AddressDTO;
  deliveryMethod: string;
  items: OrderItemDTO[];
  status: string;
  paymentIntentId: string;
  subtotal: number;
  total: number;
  deliveryCost: number;
}

export interface OrderItemDTO {
  productId: number;
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

export interface DeliveryMethodResponse {
  id: number;
  shortName: string;
  deliveryTime: string;
  description: string;
  price: number;
}

export interface OrderListResponse {
  data: OrderResponse[];
  count: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
