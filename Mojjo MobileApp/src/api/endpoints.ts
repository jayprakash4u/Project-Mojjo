export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  CATEGORIES: {
    LIST: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
    BY_SLUG: (slug: string) => `/categories/slug/${slug}`,
  },
  PRODUCTS: {
    LIST: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    BY_SLUG: (slug: string) => `/products/slug/${slug}`,
    FLASH_DEALS: '/products/flash-deals',
    SEARCH: '/products/search',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACK: (id: string) => `/orders/${id}/track`,
  },
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    VERIFY_ESEWA: '/payments/verify/esewa',
    VERIFY_KHALTI: '/payments/verify/khalti',
    VERIFY_MOCK: (orderId: string) => `/payments/verify-mock/${orderId}`,
    ORDER_STATUS: (orderId: string) => `/payments/order/${orderId}`,
  },
  DELIVERY: {
    ESTIMATE: '/delivery/estimate',
    TRACK_COURIER: (orderId: string) => `/delivery/orders/${orderId}/courier`,
  },
  REWARDS: {
    BALANCE: '/rewards/balance',
    HISTORY: '/rewards/history',
    REDEEM: '/rewards/redeem',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
} as const;
