import { ApiClient } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import { Category, Product, ProductFilterParams } from '../../types/product';
import { PagedResult } from '../../types/api';

export class ProductsApi {
  static async getCategories(signal?: AbortSignal): Promise<Category[]> {
    return await ApiClient.get<Category[]>(ENDPOINTS.CATEGORIES.LIST, undefined, { signal });
  }

  static async getCategoryBySlug(slug: string, signal?: AbortSignal): Promise<Category> {
    return await ApiClient.get<Category>(ENDPOINTS.CATEGORIES.BY_SLUG(slug), undefined, { signal });
  }

  static async getProducts(
    params?: ProductFilterParams,
    signal?: AbortSignal
  ): Promise<PagedResult<Product>> {
    return await ApiClient.get<PagedResult<Product>>(
      ENDPOINTS.PRODUCTS.LIST,
      params as Record<string, unknown>,
      { signal }
    );
  }

  static async getProductById(id: string, signal?: AbortSignal): Promise<Product> {
    return await ApiClient.get<Product>(ENDPOINTS.PRODUCTS.BY_ID(id), undefined, { signal });
  }

  static async getProductBySlug(slug: string, signal?: AbortSignal): Promise<Product> {
    return await ApiClient.get<Product>(ENDPOINTS.PRODUCTS.BY_SLUG(slug), undefined, { signal });
  }

  static async getFlashDeals(signal?: AbortSignal): Promise<Product[]> {
    return await ApiClient.get<Product[]>(ENDPOINTS.PRODUCTS.FLASH_DEALS, undefined, { signal });
  }

  static async searchProducts(query: string, signal?: AbortSignal): Promise<Product[]> {
    return await ApiClient.get<Product[]>(ENDPOINTS.PRODUCTS.SEARCH, { q: query }, { signal });
  }
}
