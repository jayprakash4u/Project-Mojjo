import { ProductFilterParams } from '../types/product';

/**
 * Type-Safe Hierarchical Query Key Factory
 * Enables clean granular cache invalidation, background refetching, and prefetching.
 */
export const queryKeys = {
  // Auth query keys
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // Categories query keys (Static, long cache duration)
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.categories.all, 'detail', slug] as const,
  },

  // Products query keys (Catalog, moderate cache duration)
  products: {
    all: ['products'] as const,
    list: (params?: ProductFilterParams) => [...queryKeys.products.all, 'list', params || {}] as const,
    infinite: (params?: ProductFilterParams) => [...queryKeys.products.all, 'infinite', params || {}] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
    bySlug: (slug: string) => [...queryKeys.products.all, 'slug', slug] as const,
    flashDeals: () => [...queryKeys.products.all, 'flashDeals'] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
  },

  // Orders query keys (Dynamic / Real-time, short cache duration)
  orders: {
    all: ['orders'] as const,
    list: () => [...queryKeys.orders.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
    tracking: (id: string) => [...queryKeys.orders.all, 'tracking', id] as const,
  },
};
