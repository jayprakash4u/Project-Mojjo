import { ApiClient } from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import { CreateOrderRequest, Order } from '../../types/order';

export class OrdersApi {
  static async getOrders(): Promise<Order[]> {
    return await ApiClient.get<Order[]>(ENDPOINTS.ORDERS.LIST);
  }

  static async getOrderById(id: string): Promise<Order> {
    return await ApiClient.get<Order>(ENDPOINTS.ORDERS.BY_ID(id));
  }

  static async createOrder(request: CreateOrderRequest): Promise<Order> {
    return await ApiClient.post<Order>(ENDPOINTS.ORDERS.CREATE, request);
  }

  static async cancelOrder(id: string): Promise<Order> {
    return await ApiClient.post<Order>(ENDPOINTS.ORDERS.CANCEL(id));
  }

  static async trackOrder(id: string): Promise<Order> {
    return await ApiClient.get<Order>(ENDPOINTS.ORDERS.TRACK(id));
  }
}
