export const STORAGE_KEYS = {
  // Secure Storage (Tokens)
  AUTH_ACCESS_TOKEN: 'mojjo_secure_access_token',
  AUTH_REFRESH_TOKEN: 'mojjo_secure_refresh_token',

  // Async Storage (Cache & State)
  AUTH_USER_PROFILE: '@mojjo_user_profile',
  CART_ITEMS: '@mojjo_cart_items',
  THEME_MODE: '@mojjo_theme_mode',
  SELECTED_ADDRESS: '@mojjo_selected_address',
  SAVED_ADDRESSES: '@mojjo_saved_addresses',
  RECENT_SEARCHES: '@mojjo_recent_searches',
  ONBOARDING_COMPLETED: '@mojjo_onboarding_completed',
} as const;
