import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../constants/config';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StorageService } from '../services/storage';
import { NetworkService } from '../services/network/NetworkService';
import { ApiError } from './errors';
import { ApiResponse } from '../types/api';

export class ApiClient {
  private static instance: AxiosInstance;

  public static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: APP_CONFIG.API_BASE_URL,
        timeout: APP_CONFIG.API_TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      // Request Interceptor: Attach JWT Bearer Token
      ApiClient.instance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
          try {
            const token = await StorageService.getSecureItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN);
            if (token && config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (e) {
            console.warn('[ApiClient] Failed to attach auth token', e);
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response Interceptor: Format responses & handle errors
      ApiClient.instance.interceptors.response.use(
        (response) => {
          NetworkService.recordNetworkSuccess();
          return response;
        },
        async (error: AxiosError<ApiResponse<unknown>>) => {
          if (axios.isCancel(error)) {
            // Request was aborted by signal
            return Promise.reject(new ApiError('Request cancelled', 499, undefined, 'CANCELLED', false));
          }

          if (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
            // Network or connection failure
            NetworkService.recordNetworkFailure();
            return Promise.reject(
              new ApiError(
                'Network connection error. Please check your internet connection.',
                0,
                undefined,
                'NETWORK_ERROR',
                true
              )
            );
          }

          const { status, data } = error.response;

          // 401 Unauthorized handling
          if (status === 401) {
            // Clear expired tokens if unauthenticated
            await StorageService.deleteSecureItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN);
            await StorageService.deleteSecureItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
          }

          const message = data?.message || error.message || 'Request failed';
          const errors = data?.errors;

          return Promise.reject(new ApiError(message, status, errors));
        }
      );
    }

    return ApiClient.instance;
  }

  // Generic request helpers with AbortSignal cancellation support
  public static async get<T>(
    url: string,
    params?: Record<string, unknown>,
    options?: AxiosRequestConfig
  ): Promise<T> {
    const client = ApiClient.getInstance();
    const response = await client.get<ApiResponse<T> | T>(url, {
      params,
      ...options,
    });
    const data = response.data as ApiResponse<T>;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return data.data;
    }
    return response.data as T;
  }

  public static async post<T>(
    url: string,
    body?: unknown,
    options?: AxiosRequestConfig
  ): Promise<T> {
    const client = ApiClient.getInstance();
    const response = await client.post<ApiResponse<T> | T>(url, body, options);
    const data = response.data as ApiResponse<T>;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return data.data;
    }
    return response.data as T;
  }

  public static async put<T>(
    url: string,
    body?: unknown,
    options?: AxiosRequestConfig
  ): Promise<T> {
    const client = ApiClient.getInstance();
    const response = await client.put<ApiResponse<T> | T>(url, body, options);
    const data = response.data as ApiResponse<T>;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return data.data;
    }
    return response.data as T;
  }

  public static async delete<T>(
    url: string,
    options?: AxiosRequestConfig
  ): Promise<T> {
    const client = ApiClient.getInstance();
    const response = await client.delete<ApiResponse<T> | T>(url, options);
    const data = response.data as ApiResponse<T>;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return data.data;
    }
    return response.data as T;
  }
}

export const apiClient = ApiClient.getInstance();
