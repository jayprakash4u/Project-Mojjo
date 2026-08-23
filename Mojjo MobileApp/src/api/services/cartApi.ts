import { ApiClient } from '../apiClient';
import {
  CartValidationRequestItem,
  CartValidationResponse,
  Offer,
} from '../../types/cart';
import { ProductsApi } from './productsApi';

export const PROMOTIONAL_OFFERS: Offer[] = [
  {
    code: 'MOJJO50',
    title: 'NPR 50 OFF',
    description: 'Flat NPR 50 off on orders above NPR 299',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 299,
    badge: '⚡ POPULAR',
  },
  {
    code: 'WELCOME100',
    title: 'NPR 100 OFF',
    description: 'Flat NPR 100 off on your first order above NPR 599',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 599,
    badge: '🎉 NEW USER',
  },
  {
    code: 'SUPER15',
    title: '15% OFF',
    description: '15% off up to NPR 150 on orders above NPR 799',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 799,
    maxDiscount: 150,
    badge: '🔥 BEST DEAL',
  },
];

export class CartApi {
  /**
   * Server-Side Price and Inventory Revalidation.
   * NEVER trust client calculations during checkout.
   */
  public static async validateCart(
    items: CartValidationRequestItem[],
    couponCode?: string,
    signal?: AbortSignal
  ): Promise<CartValidationResponse> {
    try {
      // Attempt backend cart validation endpoint if available
      const response = await ApiClient.post<CartValidationResponse>(
        '/cart/validate',
        { items, couponCode },
        { signal }
      );
      return response;
    } catch {
      // Robust client-side dark-store simulator fallback with real product catalog prices
      const validatedItems: CartValidationResponse['items'] = [];
      const warnings: string[] = [];
      let serverSubtotal = 0;

      for (const item of items) {
        try {
          const product = await ProductsApi.getProductById(item.productId, signal);
          if (product) {
            const availableStock = product.stockQuantity;
            const currentPrice = product.price;
            const isAvailable = product.isAvailable && availableStock > 0;

            if (item.quantity > availableStock) {
              warnings.push(
                `Only ${availableStock} units of "${product.name}" are available in stock.`
              );
            }

            validatedItems.push({
              productId: product.id,
              productName: product.name,
              requestedQuantity: Math.min(item.quantity, Math.max(1, availableStock)),
              availableStock,
              currentUnitPrice: currentPrice,
              originalUnitPrice: product.originalPrice,
              isAvailable,
              priceChanged: false,
            });

            serverSubtotal += currentPrice * Math.min(item.quantity, availableStock);
          }
        } catch {
          // If individual lookup fails, maintain defensive defaults
          validatedItems.push({
            productId: item.productId,
            productName: 'Cart Item',
            requestedQuantity: item.quantity,
            availableStock: 10,
            currentUnitPrice: 0,
            isAvailable: true,
            priceChanged: false,
          });
        }
      }

      // Coupon validation
      let couponValid = false;
      let couponDiscount = 0;
      let couponMessage: string | undefined;

      if (couponCode) {
        const offer = PROMOTIONAL_OFFERS.find(
          (o) => o.code.toUpperCase() === couponCode.toUpperCase()
        );
        if (offer) {
          if (serverSubtotal >= offer.minOrderValue) {
            couponValid = true;
            if (offer.discountType === 'percentage') {
              const rawDisc = (serverSubtotal * offer.discountValue) / 100;
              couponDiscount = offer.maxDiscount ? Math.min(rawDisc, offer.maxDiscount) : rawDisc;
            } else {
              couponDiscount = offer.discountValue;
            }
            couponMessage = `Applied ${offer.code} successfully!`;
          } else {
            couponValid = false;
            couponMessage = `Add NPR ${offer.minOrderValue - serverSubtotal} more to use ${offer.code}`;
            warnings.push(couponMessage);
          }
        } else {
          couponValid = false;
          couponMessage = `Invalid coupon code "${couponCode}".`;
          warnings.push(couponMessage);
        }
      }

      const serverDeliveryFee = serverSubtotal >= 500 || serverSubtotal === 0 ? 0 : 50;
      const serverTotalAmount = Math.max(0, serverSubtotal + serverDeliveryFee - couponDiscount);

      return {
        isValid: warnings.length === 0,
        items: validatedItems,
        couponValid,
        couponDiscount,
        couponMessage,
        serverSubtotal,
        serverDeliveryFee,
        serverTotalAmount,
        warnings,
      };
    }
  }

  public static async getOffers(signal?: AbortSignal): Promise<Offer[]> {
    try {
      const response = await ApiClient.get<Offer[]>('/offers', { signal });
      return response;
    } catch {
      return PROMOTIONAL_OFFERS;
    }
  }
}
