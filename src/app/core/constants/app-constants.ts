export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 6,
  MAX_PAGE_SIZE: 50,

  // Cart
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,

  // Validation
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,

  // UI
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,

  // Storage Keys
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  BASKET_ID_KEY: 'basketId',

  // Sort Options
  SORT_OPTIONS: {
    NAME_ASC: 'name',
    NAME_DESC: 'nameDesc',
    PRICE_ASC: 'price',
    PRICE_DESC: 'priceDesc',
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'Pending',
    PAYMENT_RECEIVED: 'PaymentReceived',
    PAYMENT_FAILED: 'PaymentFailed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
  },
} as const;
