export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
  REFRESH_TOKEN: 'refresh_token',

  // Cart
  BASKET_ID: 'basket_id',
  CART_ITEMS: 'cart_items',

  // User Preferences
  USER_PREFERENCES: 'user_preferences',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',

  // Filters
  PRODUCT_FILTERS: 'product_filters',
  SEARCH_HISTORY: 'search_history',

  // Checkout
  CHECKOUT_ADDRESS: 'checkout_address',
  SELECTED_DELIVERY_METHOD: 'selected_delivery_method',

  // App State
  LAST_VISITED_PAGE: 'last_visited_page',
  SESSION_ID: 'session_id',
} as const;
