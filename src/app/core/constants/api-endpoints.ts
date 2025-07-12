export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/Authentication/login',
    REGISTER: '/api/Authentication/register',
    EMAIL_CHECK: '/api/Authentication/emailExists',
    CURRENT_USER: '/api/Authentication/currentUser',
    ADDRESS: '/api/Authentication/address',
  },

  // Baskets (Cart)
  BASKETS: {
    GET: '/api/Baskets',
    ADD_ITEM: '/api/Baskets',
    UPDATE_ITEM: '/api/Baskets',
    REMOVE_ITEM: '/api/Baskets',
  },

  // Orders
  ORDERS: {
    CREATE: '/api/Orders',
    GET_ORDERS: '/api/Orders',
    DELIVERY_METHODS: '/api/Orders/deliveryMethods',
  },

  // Payments
  PAYMENTS: {
    CREATE_PAYMENT_INTENT: '/api/Payments',
    WEBHOOK: '/api/Payments/WebHook',
  },

  // Products
  PRODUCTS: {
    GET_PRODUCTS: '/api/Products',
    GET_PRODUCT: (id: number) => `/api/Products/${id}`,
    GET_BRANDS: '/api/Products/brands',
    GET_TYPES: '/api/Products/types',
  },
} as const;
