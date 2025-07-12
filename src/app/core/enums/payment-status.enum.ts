export enum PaymentStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SUCCEEDED = 'Succeeded',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
  REFUNDED = 'Refunded',
  PARTIALLY_REFUNDED = 'PartiallyRefunded',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.PROCESSING]: 'Processing',
  [PaymentStatus.SUCCEEDED]: 'Succeeded',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.CANCELLED]: 'Cancelled',
  [PaymentStatus.REFUNDED]: 'Refunded',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'Partially Refunded',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [PaymentStatus.SUCCEEDED]: 'bg-green-100 text-green-800',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
  [PaymentStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  [PaymentStatus.REFUNDED]: 'bg-purple-100 text-purple-800',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'bg-orange-100 text-orange-800',
};
