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
  shortName: string; // From network response, this appears to be camelCase
  deliveryTime: string; // This too
  description: string; // And this
  price: number; // And this one is 'price' not 'Price'
}
export interface OrderListResponse {
  data: OrderResponse[];
  count: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
