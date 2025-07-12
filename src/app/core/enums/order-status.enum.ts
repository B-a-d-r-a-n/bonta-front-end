export enum OrderStatus {
  PENDING = 'Pending',
  PAYMENT_RECEIVED = 'PaymentReceived',
  PAYMENT_FAILED = 'PaymentFailed',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PAYMENT_RECEIVED]: 'Payment Received',
  [OrderStatus.PAYMENT_FAILED]: 'Payment Failed',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PAYMENT_RECEIVED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PAYMENT_FAILED]: 'bg-red-100 text-red-800',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
};
