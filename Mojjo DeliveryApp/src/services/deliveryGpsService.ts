import * as signalR from '@microsoft/signalr';
import { GpsLocation } from '../types/rider';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5177';

// Kathmandu Real-World Waypoints for Delivery Route Simulation
export const KATHMANDU_DELIVERY_ROUTE: { lat: number; lng: number; name: string }[] = [
  { lat: 27.6915, lng: 85.3420, name: 'Mojjo Baneshwor Dark Store Hub (Departed)' },
  { lat: 27.6892, lng: 85.3445, name: 'Baneshwor Chowk Intersection' },
  { lat: 27.6870, lng: 85.3475, name: 'Minbhawan Road' },
  { lat: 27.6845, lng: 85.3498, name: 'Tinkune Overhead Bridge' },
  { lat: 27.6812, lng: 85.3480, name: 'Koteshwor Ring Road Junction' },
  { lat: 27.6780, lng: 85.3452, name: 'Mahadevsthan Marg' },
  { lat: 27.6765, lng: 85.3428, name: 'Customer Gate (Arrived)' },
];

export const JHAMSIKHEL_DELIVERY_ROUTE: { lat: number; lng: number; name: string }[] = [
  { lat: 27.6782, lng: 85.3123, name: 'Mojjo Jhamsikhel Dark Store (Departed)' },
  { lat: 27.6795, lng: 85.3148, name: 'St. Xavier / St. Mary Corner' },
  { lat: 27.6778, lng: 85.3180, name: 'Pulchowk Road' },
  { lat: 27.6740, lng: 85.3195, name: 'Jawalakhel Roundabout' },
  { lat: 27.6720, lng: 85.3168, name: 'Kumaripati Lane' },
  { lat: 27.6834, lng: 85.3168, name: 'Customer Residence (Arrived)' },
];

export type GpsUpdateCallback = (location: GpsLocation, syncedWithServer: boolean) => void;

class DeliveryGpsService {
  private hubConnection: signalR.HubConnection | null = null;
  private watchId: number | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;
  private simStepIndex = 0;
  private isPublishing = false;
  private activeOrderId: string | null = null;
  private activeDriverId: string = 'r-101';
  private activeDriverName: string = 'Bikash Maharjan';
  private lastLocation: GpsLocation | null = null;
  private updateListeners: Set<GpsUpdateCallback> = new Set();

  private async ensureSignalR(): Promise<signalR.HubConnection> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection;
    }

    const hubUrl = `${BACKEND_URL.replace(/\/api\/v1\/?$/, '')}/hubs/order-tracking`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    await this.hubConnection.start();
    return this.hubConnection;
  }

  public async startLiveGps(
    orderId: string,
    driverId: string = 'r-101',
    driverName: string = 'Bikash Maharjan'
  ): Promise<void> {
    this.stopGps();
    this.activeOrderId = orderId;
    this.activeDriverId = driverId;
    this.activeDriverName = driverName;
    this.isPublishing = true;

    try {
      await this.ensureSignalR();
    } catch (e) {
      console.warn('SignalR initial connection failed, will use REST fallback:', e);
    }

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const loc: GpsLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading ?? undefined,
            speedKmH: position.coords.speed ? Math.round(position.coords.speed * 3.6) : 28,
            accuracyMeters: Math.round(position.coords.accuracy),
            timestamp: new Date().toISOString(),
          };

          this.broadcastLocation(loc);
        },
        (error) => {
          console.warn('HTML5 Geolocation warning:', error.message, '- Falling back to route simulation.');
          this.startSimulation(orderId, driverId, driverName);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000,
        }
      );
    } else {
      this.startSimulation(orderId, driverId, driverName);
    }
  }

  public startSimulation(
    orderId: string,
    driverId: string = 'r-101',
    driverName: string = 'Bikash Maharjan'
  ): void {
    this.stopGps();
    this.activeOrderId = orderId;
    this.activeDriverId = driverId;
    this.activeDriverName = driverName;
    this.isPublishing = true;
    this.simStepIndex = 0;

    const route = KATHMANDU_DELIVERY_ROUTE;

    this.ensureSignalR().catch((e) => console.warn('SignalR simulation fallback:', e));

    // Send initial point
    const firstPt = route[0];
    const initialLoc: GpsLocation = {
      latitude: firstPt.lat,
      longitude: firstPt.lng,
      heading: 45,
      speedKmH: 26,
      accuracyMeters: 5,
      timestamp: new Date().toISOString(),
    };
    this.broadcastLocation(initialLoc);

    // Step every 3.5 seconds
    this.simulationInterval = setInterval(() => {
      this.simStepIndex = (this.simStepIndex + 1) % route.length;
      const pt = route[this.simStepIndex];
      const prevPt = route[(this.simStepIndex - 1 + route.length) % route.length];

      // Calculate bearing
      const dLon = ((pt.lng - prevPt.lng) * Math.PI) / 180;
      const lat1 = (prevPt.lat * Math.PI) / 180;
      const lat2 = (pt.lat * Math.PI) / 180;
      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      const heading = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);

      const loc: GpsLocation = {
        latitude: pt.lat,
        longitude: pt.lng,
        heading,
        speedKmH: 24 + Math.floor(Math.random() * 12),
        accuracyMeters: 4,
        timestamp: new Date().toISOString(),
      };

      this.broadcastLocation(loc);
    }, 3500);
  }

  public stopGps(): void {
    this.isPublishing = false;
    if (this.watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private async broadcastLocation(loc: GpsLocation): Promise<void> {
    this.lastLocation = loc;
    if (!this.activeOrderId) return;

    const payload = {
      orderId: this.activeOrderId,
      driverId: this.activeDriverId,
      driverName: this.activeDriverName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      heading: loc.heading ?? 0,
      speedKmH: loc.speedKmH ?? 25,
      updatedAt: loc.timestamp,
    };

    let serverSynced = false;

    // 1. Try SignalR
    try {
      if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
        await this.hubConnection.invoke('SendDriverLocation', payload);
        serverSynced = true;
      } else {
        await this.ensureSignalR();
        if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
          await this.hubConnection.invoke('SendDriverLocation', payload);
          serverSynced = true;
        }
      }
    } catch (err) {
      // 2. Fallback to REST endpoint
      try {
        await fetch(`${BACKEND_URL}/api/v1/orders/${this.activeOrderId}/driver-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        serverSynced = true;
      } catch (restErr) {
        // Broadcast locally even if backend is offline
      }
    }

    // Notify UI listeners
    this.updateListeners.forEach((listener) => listener(loc, serverSynced));
  }

  public async broadcastStatusChange(status: string, note?: string): Promise<void> {
    if (!this.activeOrderId) return;

    try {
      await fetch(`${BACKEND_URL}/api/v1/orders/${this.activeOrderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: note || `Order status updated to ${status}`,
          deliveryAgentId: this.activeDriverId,
          deliveryAgentName: this.activeDriverName,
          deliveryAgentPhone: '9801122334',
        }),
      });
    } catch (e) {
      console.warn('Could not post status update to backend:', e);
    }
  }

  public subscribe(callback: GpsUpdateCallback): () => void {
    this.updateListeners.add(callback);
    if (this.lastLocation) {
      callback(this.lastLocation, true);
    }
    return () => this.updateListeners.delete(callback);
  }

  public getIsPublishing(): boolean {
    return this.isPublishing;
  }

  public getLastLocation(): GpsLocation | null {
    return this.lastLocation;
  }
}

export const deliveryGpsService = new DeliveryGpsService();
