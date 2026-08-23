import { APP_CONFIG } from '../constants/config';

/**
 * Format a number as Nepal Rupee with currency symbol and thousands separators
 * e.g. 1250 -> "रू 1,250"
 */
export const formatNPR = (amount: number | undefined | null, showDecimals = false): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${APP_CONFIG.CURRENCY_SYMBOL} 0`;
  }

  const rounded = showDecimals ? amount.toFixed(2) : Math.round(amount).toString();
  
  // Format with South Asian / Indian numbering system (thousands separator)
  const parts = rounded.split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
  return `${APP_CONFIG.CURRENCY_SYMBOL} ${result}`;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (!originalPrice || originalPrice <= discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};
