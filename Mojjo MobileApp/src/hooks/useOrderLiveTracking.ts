import { useState, useEffect, useRef, useCallback } from 'react';
import { liveTrackingService } from '../services/delivery/liveTrackingService';
import { DriverLocationUpdate, LatLng, LiveTrackingState, OrderStatusUpdate } from '../types/tracking';
import { ApiClient } from '../api/apiClient';
import {
  ORDER_STAGE_MILESTONES,
  OrderStageMilestone,
  getStageIndexFromStatus,
} from '../services/delivery/orderNotificationManager';
import { HapticsService } from '../services/haptics';

// Realistic Kathmandu Route: Dark Store (New Baneshwor) -> Maitighar / Tinkune -> Koteshwor / Jhamsikhel
export const KATHMANDU_SAMPLE_ROUTE: LatLng[] = [
  { latitude: 27.6915, longitude: 85.3420 }, // 1. Mojjo Baneshwor Dark Store
  { latitude: 27.6892, longitude: 85.3445 }, // 2. Baneshwor Chowk
  { latitude: 27.6870, longitude: 85.3475 }, // 3. Minbhawan
  { latitude: 27.6845, longitude: 85.3498 }, // 4. Tinkune Inter-junction
  { latitude: 27.6812, longitude: 85.3480 }, // 5. Koteshwor Ring Road
  { latitude: 27.6780, longitude: 85.3452 }, // 6. Mahadevsthan Marg
  { latitude: 27.6765, longitude: 85.3428 }, // 7. Customer Drop-off Doorstep
];

export const LALITPUR_SAMPLE_ROUTE: LatLng[] = [
  { latitude: 27.6782, longitude: 85.3123 }, // 1. Mojjo Jhamsikhel Dark Store Hub
  { latitude: 27.6795, longitude: 85.3148 }, // 2. St. Mary's School Corner
  { latitude: 27.6778, longitude: 85.3180 }, // 3. Pulchowk Engineering Campus
  { latitude: 27.6740, longitude: 85.3195 }, // 4. Jawalakhel Roundabout
  { latitude: 27.6720, longitude: 85.3168 }, // 5. Kumaripati Gate
  { latitude: 27.6834, longitude: 85.3168 }, // 6. Customer Residence
];

// Helper to compute distance in km using Haversine formula
export const calculateDistanceKm = (from: LatLng, to: LatLng): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

// Helper to compute heading angle in degrees (0-360)
export const calculateHeading = (from: LatLng, to: LatLng): number => {
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

interface UseOrderLiveTrackingProps {
  orderId: string;
  initialStoreLocation?: LatLng;
  initialDestinationLocation?: LatLng;
  autoConnect?: boolean;
}

export const useOrderLiveTracking = ({
  orderId,
  initialStoreLocation = KATHMANDU_SAMPLE_ROUTE[0],
  initialDestinationLocation = KATHMANDU_SAMPLE_ROUTE[KATHMANDU_SAMPLE_ROUTE.length - 1],
  autoConnect = true,
}: UseOrderLiveTrackingProps) => {
  const [trackingState, setTrackingState] = useState<LiveTrackingState>({
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    riderLocation: initialStoreLocation,
    heading: 45,
    speedKmH: 28,
    storeLocation: initialStoreLocation,
    destinationLocation: initialDestinationLocation,
    waypoints: [
      { id: 'store', title: 'Mojjo Dark Store Hub', latitude: initialStoreLocation.latitude, longitude: initialStoreLocation.longitude, type: 'store' },
      { id: 'dest', title: 'Delivery Address', latitude: initialDestinationLocation.latitude, longitude: initialDestinationLocation.longitude, type: 'destination' },
    ],
    estimatedMinutes: 8,
    distanceRemainingKm: calculateDistanceKm(initialStoreLocation, initialDestinationLocation),
    isSimulating: false,
    lastUpdated: null,
  });

  const [orderStatus, setOrderStatus] = useState<string>('OutForDelivery');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(3); // Default at Step 4 (OutForDelivery)
  const [activeNotification, setActiveNotification] = useState<OrderStageMilestone | null>(null);

  const simStepRef = useRef<number>(0);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNotificationForStage = (stageIdx: number) => {
    const milestone = ORDER_STAGE_MILESTONES[stageIdx];
    if (milestone) {
      setActiveNotification(milestone);
      HapticsService.success();
    }
  };

  // Connect to SignalR tracking hub
  useEffect(() => {
    if (!autoConnect || !orderId) return;

    let isMounted = true;

    const setupTracking = async () => {
      // 1. Subscribe to connection state
      const unsubConnection = liveTrackingService.subscribeConnection((connected, error) => {
        if (!isMounted) return;
        setTrackingState((prev) => ({
          ...prev,
          isConnected: connected,
          connectionError: error || null,
        }));
      });

      // 2. Subscribe to driver location updates
      const unsubLocation = liveTrackingService.subscribeLocation((loc: DriverLocationUpdate) => {
        if (!isMounted) return;
        
        const newRiderLoc = { latitude: loc.latitude, longitude: loc.longitude };
        setTrackingState((prev) => {
          const dist = calculateDistanceKm(newRiderLoc, prev.destinationLocation);
          const computedSpeed = loc.speedKmH ?? prev.speedKmH;
          const computedEta = Math.max(1, Math.round((dist / (computedSpeed || 25)) * 60));
          const computedHeading = loc.heading ?? calculateHeading(prev.riderLocation, newRiderLoc);

          // If rider gets within 150m of doorstep, automatically trigger Stage 5 (Near Doorstep)
          if (dist <= 0.15 && currentStageIndex < 4) {
            setCurrentStageIndex(4);
            triggerNotificationForStage(4);
          }

          return {
            ...prev,
            riderLocation: newRiderLoc,
            heading: computedHeading,
            speedKmH: computedSpeed,
            distanceRemainingKm: dist,
            estimatedMinutes: computedEta,
            lastUpdated: new Date(),
          };
        });
      });

      // 3. Subscribe to order status updates from server
      const unsubStatus = liveTrackingService.subscribeStatus((statusUpdate: OrderStatusUpdate) => {
        if (!isMounted) return;
        setOrderStatus(statusUpdate.status);
        const stageIdx = getStageIndexFromStatus(statusUpdate.status);
        setCurrentStageIndex(stageIdx);
        triggerNotificationForStage(stageIdx);
      });

      // 4. Connect
      await liveTrackingService.connect(orderId);

      // 5. Try fetching latest known driver location from REST endpoint as instant snapshot
      try {
        const response = await ApiClient.get<DriverLocationUpdate | null>(`/orders/${orderId}/driver-location`);
        if (response && response.latitude && response.longitude && isMounted) {
          const fetchedLoc = { latitude: response.latitude, longitude: response.longitude };
          setTrackingState((prev) => ({
            ...prev,
            riderLocation: fetchedLoc,
            heading: response.heading ?? prev.heading,
            speedKmH: response.speedKmH ?? prev.speedKmH,
            distanceRemainingKm: calculateDistanceKm(fetchedLoc, prev.destinationLocation),
            lastUpdated: new Date(),
          }));
        }
      } catch (e) {
        // Fallback gracefully
      }

      return () => {
        unsubConnection();
        unsubLocation();
        unsubStatus();
      };
    };

    const cleanupPromise = setupTracking();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => cleanup && cleanup());
      liveTrackingService.disconnect();
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, [orderId, autoConnect, currentStageIndex]);

  // Advance to next status stage in simulation
  const simulateNextStage = useCallback(() => {
    setCurrentStageIndex((prev) => {
      const nextIdx = (prev + 1) % ORDER_STAGE_MILESTONES.length;
      triggerNotificationForStage(nextIdx);

      // Adjust map location based on milestone
      if (nextIdx === 0 || nextIdx === 1 || nextIdx === 2) {
        // At store
        setTrackingState((curr) => ({
          ...curr,
          riderLocation: KATHMANDU_SAMPLE_ROUTE[0],
          distanceRemainingKm: calculateDistanceKm(KATHMANDU_SAMPLE_ROUTE[0], curr.destinationLocation),
          estimatedMinutes: 10,
        }));
      } else if (nextIdx === 3) {
        // Mid-route
        setTrackingState((curr) => ({
          ...curr,
          riderLocation: KATHMANDU_SAMPLE_ROUTE[3],
          distanceRemainingKm: calculateDistanceKm(KATHMANDU_SAMPLE_ROUTE[3], curr.destinationLocation),
          estimatedMinutes: 6,
        }));
      } else if (nextIdx === 4) {
        // Near doorstep
        setTrackingState((curr) => ({
          ...curr,
          riderLocation: KATHMANDU_SAMPLE_ROUTE[5],
          distanceRemainingKm: 0.1,
          estimatedMinutes: 1,
        }));
      } else if (nextIdx === 5) {
        // Delivered
        setTrackingState((curr) => ({
          ...curr,
          riderLocation: curr.destinationLocation,
          distanceRemainingKm: 0,
          estimatedMinutes: 0,
        }));
      }

      return nextIdx;
    });
  }, []);

  // Toggle Route Simulation (Smoothly moves rider across waypoints)
  const toggleSimulation = useCallback(() => {
    setTrackingState((prev) => {
      const nextSim = !prev.isSimulating;

      if (nextSim) {
        // Start simulation
        simStepRef.current = 0;
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);

        const route = KATHMANDU_SAMPLE_ROUTE;

        simIntervalRef.current = setInterval(() => {
          simStepRef.current = (simStepRef.current + 1) % route.length;
          const nextPos = route[simStepRef.current];
          const prevPos = route[(simStepRef.current - 1 + route.length) % route.length];
          const heading = calculateHeading(prevPos, nextPos);

          setTrackingState((curr) => {
            const dist = calculateDistanceKm(nextPos, curr.destinationLocation);
            const speed = 26 + Math.floor(Math.random() * 8);
            const eta = Math.max(1, Math.round((dist / speed) * 60));

            return {
              ...curr,
              riderLocation: nextPos,
              heading,
              speedKmH: speed,
              distanceRemainingKm: dist,
              estimatedMinutes: eta,
              lastUpdated: new Date(),
            };
          });
        }, 2500);
      } else {
        // Stop simulation
        if (simIntervalRef.current) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
        }
      }

      return {
        ...prev,
        isSimulating: nextSim,
      };
    });
  }, []);

  return {
    trackingState,
    orderStatus,
    currentStageIndex,
    activeNotification,
    dismissNotification: () => setActiveNotification(null),
    simulateNextStage,
    toggleSimulation,
    reconnect: () => liveTrackingService.connect(orderId),
  };
};
