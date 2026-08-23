import { Platform } from 'react-native';

const getBaseApiUrl = (): string => {
  // If set explicitly via environment variables (e.g. .env)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Default development backends
  if (Platform.OS === 'android') {
    // 10.0.2.2 maps to host machine localhost in standard Android Emulator
    return 'http://10.0.2.2:5177/api/v1';
  }

  // iOS Simulator / Web
  return 'http://localhost:5177/api/v1';
};

export const APP_CONFIG = {
  APP_NAME: 'Mojjo',
  APP_VERSION: '1.0.0',
  API_BASE_URL: getBaseApiUrl(),
  API_TIMEOUT_MS: 15000,
  
  // Delivery & Business Constants (Ultra-Fast 10-Minute Dark Store Delivery)
  DELIVERY_GUARANTEE_MINUTES: 10,
  FREE_DELIVERY_THRESHOLD: 1000, // NPR
  BASE_DELIVERY_FEE: 50, // NPR
  CURRENCY_SYMBOL: 'रू',
  CURRENCY_CODE: 'NPR',
  
  // Loyalty Points: 100 Mojjo Coins = NPR 10
  COIN_CONVERSION_RATE: 0.1,

  // Support
  SUPPORT_PHONE: '+977-9800000000',
  SUPPORT_EMAIL: 'support@mojjo.com.np',
};
