export interface BasketDTO {
  id: string;
  items: BasketItemDTO[];
  paymentIntentId?: string;
  clientSecret?: string;
  deliveryMethodId?: number;
  shippingPrice: number;
}

export interface BasketItemDTO {
  id: number; // Product ID
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

export interface AddItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateItemRequest {
  id: number;
  quantity: number;
}

export interface RemoveItemRequest {
  id: number;
}
