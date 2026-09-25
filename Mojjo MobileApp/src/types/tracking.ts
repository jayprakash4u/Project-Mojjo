export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface DriverLocationUpdate {
  orderId: string;
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speedKmH?: number;
  updatedAt?: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  estimatedDeliveryTime?: string;
  note?: string;
  updatedAt?: string;
}

export interface TrackingWaypoint {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  type: 'store' | 'waypoint' | 'destination';
}

export interface LiveTrackingState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  riderLocation: LatLng;
  heading: number;
  speedKmH: number;
  storeLocation: LatLng;
  destinationLocation: LatLng;
  waypoints: TrackingWaypoint[];
  estimatedMinutes: number;
  distanceRemainingKm: number;
  isSimulating: boolean;
  lastUpdated: Date | null;
}
