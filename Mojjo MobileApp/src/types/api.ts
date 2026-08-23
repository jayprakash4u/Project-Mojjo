export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  statusCode: number;
  timestamp: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]> | string[];
  statusCode: number;
  errorCode?: string;
}
