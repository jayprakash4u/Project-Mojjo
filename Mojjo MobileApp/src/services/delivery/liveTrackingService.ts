import * as signalR from '@microsoft/signalr';
import { APP_CONFIG } from '../../constants/config';
import { DriverLocationUpdate, OrderStatusUpdate } from '../../types/tracking';

type LocationListener = (location: DriverLocationUpdate) => void;
type StatusListener = (status: OrderStatusUpdate) => void;
type ConnectionListener = (isConnected: boolean, error?: string) => void;

class LiveTrackingService {
  private hubConnection: signalR.HubConnection | null = null;
  private currentOrderId: string | null = null;
  private locationListeners: Set<LocationListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private isConnecting: boolean = false;

  private getHubUrl(): string {
    // Base hub URL derived from API base URL
    const baseUrl = APP_CONFIG.API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${baseUrl}/hubs/order-tracking`;
  }

  public async connect(orderId: string): Promise<void> {
    if (this.currentOrderId === orderId && this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.currentOrderId = orderId;

    try {
      if (this.hubConnection) {
        await this.disconnect();
      }

      this.isConnecting = true;
      this.notifyConnectionState(false);

      const hubUrl = this.getHubUrl();

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Register SignalR Client handlers matching IOrderTrackingHubClient
      this.hubConnection.on('DriverLocationUpdated', (data: DriverLocationUpdate) => {
        if (data && (!this.currentOrderId || data.orderId === this.currentOrderId)) {
          this.locationListeners.forEach((listener) => listener(data));
        }
      });

      this.hubConnection.on('OrderStatusChanged', (data: OrderStatusUpdate) => {
        if (data && (!this.currentOrderId || data.orderId === this.currentOrderId)) {
          this.statusListeners.forEach((listener) => listener(data));
        }
      });

      this.hubConnection.on('OrderTrackingJoined', (joinedOrderId: string, message: string) => {
        // Successfully connected to order room
      });

      this.hubConnection.onreconnecting((error) => {
        this.notifyConnectionState(false, error?.message || 'Reconnecting to tracking server...');
      });

      this.hubConnection.onreconnected(async () => {
        this.notifyConnectionState(true);
        if (this.currentOrderId && this.hubConnection) {
          try {
            await this.hubConnection.invoke('JoinOrderTracking', this.currentOrderId);
          } catch (e) {
            // Ignore reconnection join errors
          }
        }
      });

      this.hubConnection.onclose((error) => {
        this.notifyConnectionState(false, error?.message);
      });

      await this.hubConnection.start();
      this.isConnecting = false;
      this.notifyConnectionState(true);

      // Join room for this order
      await this.hubConnection.invoke('JoinOrderTracking', orderId);
    } catch (error: any) {
      this.isConnecting = false;
      this.notifyConnectionState(false, error?.message || 'Failed to connect to tracking hub');
    }
  }

  public async disconnect(): Promise<void> {
    if (this.hubConnection) {
      try {
        if (this.currentOrderId && this.hubConnection.state === signalR.HubConnectionState.Connected) {
          await this.hubConnection.invoke('LeaveOrderTracking', this.currentOrderId);
        }
        await this.hubConnection.stop();
      } catch (err) {
        // Ignore disconnect errors
      } finally {
        this.hubConnection = null;
        this.currentOrderId = null;
        this.notifyConnectionState(false);
      }
    }
  }

  public subscribeLocation(listener: LocationListener): () => void {
    this.locationListeners.add(listener);
    return () => this.locationListeners.delete(listener);
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.isConnected());
    return () => this.connectionListeners.delete(listener);
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  private notifyConnectionState(connected: boolean, error?: string): void {
    this.connectionListeners.forEach((listener) => listener(connected, error));
  }
}

export const liveTrackingService = new LiveTrackingService();
