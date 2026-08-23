import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ProductsApi } from '../api/services/productsApi';
import { queryKeys } from '../api/queryKeys';
import { Product, ProductFilterParams } from '../types/product';
import { PagedResult } from '../types/api';

const DEFAULT_PAGE_SIZE = 12;

export interface UseInfiniteProductsOptions {
  params?: ProductFilterParams;
  enabled?: boolean;
  pageSize?: number;
}

export function useInfiniteProducts(options: UseInfiniteProductsOptions = {}) {
  const { params, enabled = true, pageSize = DEFAULT_PAGE_SIZE } = options;

  const query = useInfiniteQuery<PagedResult<Product>, Error>({
    queryKey: queryKeys.products.infinite(params),
    queryFn: async ({ pageParam = 1, signal }) => {
      const result = await ProductsApi.getProducts(
        {
          ...params,
          pageNumber: pageParam as number,
          pageSize,
        },
        signal
      );
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.hasNextPage && lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes stale time for catalog
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
  });

  const products = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.items || []);
  }, [query.data?.pages]);

  const totalCount = query.data?.pages[0]?.totalCount || 0;

  return {
    ...query,
    products,
    totalCount,
    isEmpty: !query.isLoading && products.length === 0,
  };
}
