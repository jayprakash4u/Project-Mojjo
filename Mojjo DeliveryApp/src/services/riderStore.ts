import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ActiveDeliveryOrder,
  DeliveryStep,
  RiderProfile,
  DoorstepPaymentMode,
  GpsLocation,
  GpsPublishingState,
} from '../types/rider';
import { deliveryGpsService } from './deliveryGpsService';

export const INITIAL_RIDER_PROFILE: RiderProfile = {
  id: 'r-101',
  name: 'Bikash Maharjan',
  phone: '9801122334',
  rating: 4.94,
  totalTrips: 418,
  onTimeRatePercent: 99.2,
  acceptanceRatePercent: 98.5,
  vehicleType: 'Yamaha FZ-S v3 (Dark Matte)',
  vehicleNumber: 'Ba 88 Pa 4921',
  currentHub: 'Hub-01 (Jhamsikhel Dark Store)',
  isOnline: true,
  batteryLevel: 94,
  gpsAccuracy: 'High (3m)',
  todayEarningsNpr: 2150,
  cashInHandNpr: 4200,
  cashLimitNpr: 15000,
  digitalCollectedNpr: 14800,
};

export const SAMPLE_INCOMING_ORDER: ActiveDeliveryOrder = {
  id: 'ord-101',
  orderNumber: 'MOJ-94821',
  customerName: 'Jay Prakash Yadav',
  customerPhone: '9841234567',
  paymentMethod: 'PayOnDelivery',
  paymentStatus: 'Pending',
  totalAmountNpr: 8820,
  
  // Payout Breakdown
  basePayNpr: 120,
  distancePayNpr: 70,
  surgePayNpr: 50, // Late night Kathmandu surge
  tipNpr: 80,
  totalRiderEarningNpr: 320,

  distanceToStoreKm: 0.7,
  distanceToCustomerKm: 1.8,
  totalDistanceKm: 2.5,
  estimatedTimeMins: 14,
  slaDeadlineMins: 35, // 45-minute promise with 10 mins elapsed

  darkStoreHub: {
    id: 'hub-01',
    name: 'Mojjo Jhamsikhel Hub (Hub-01)',
    address: 'Near St. Xavier’s College, Jhamsikhel',
    landmark: 'Opposite Himalayan Java & Big Mart',
    phone: '015542000',
    latitude: 27.6782,
    longitude: 85.3123,
  },

  deliveryAddress: {
    street: 'House #14, Jhamsikhel Road, Ward 3',
    area: 'Jhamsikhel',
    city: 'Lalitpur',
    landmark: 'Behind British School, next to Coffee Bean',
    houseNumber: '14-B',
    gateInstructions: 'Brown iron gate on right, please ring bell twice. Watch out for pet beagle.',
    latitude: 27.6834,
    longitude: 85.3168,
  },

  items: [
    {
      id: 'i1',
      name: 'Premium Single Malt Whisky (750ml)',
      unit: '1 Bottle (750ml)',
      quantity: 1,
      price: 8500,
      category: 'Alcohol',
      isVerified: false,
      image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=300',
    },
    {
      id: 'i2',
      name: 'Surya 24 Carat Lights (Pack of 20)',
      unit: '1 Pack',
      quantity: 2,
      price: 600,
      category: 'Cigarettes',
      isVerified: false,
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300',
    },
  ],

  currentStep: 'incoming_request',
  otpCode: '4921',
  bagSealCode: 'MOJ-SEAL-8821',
  requiresAgeCheck: true,
  createdAt: 'Just now',
};

interface CompletePaymentParams {
  mode: DoorstepPaymentMode;
  cashCollected: number;
  changeGiven: number;
  qrAmount: number;
  qrRef: string;
  isAgeVerified: boolean;
}

interface RiderStoreState {
  profile: RiderProfile;
  activeOrder: ActiveDeliveryOrder | null;
  completedOrders: ActiveDeliveryOrder[];
  gpsState: GpsPublishingState;

  toggleDutyStatus: () => void;
  acceptOrder: () => void;
  rejectOrder: () => void;
  advanceStep: () => void;
  toggleItemVerification: (itemId: string) => void;
  verifyAllItems: () => void;
  completeDoorstepDelivery: (params: CompletePaymentParams) => void;
  simulateNewOrder: () => void;
  startGpsPublishing: (mode?: 'device_gps' | 'simulation') => void;
  stopGpsPublishing: () => void;
  updateGpsLocation: (loc: GpsLocation, synced: boolean) => void;
  resetAll: () => void;
}

export const useRiderStore = create<RiderStoreState>()(
  persist(
    (set, get) => ({
      profile: INITIAL_RIDER_PROFILE,
      activeOrder: SAMPLE_INCOMING_ORDER,
      completedOrders: [],
      gpsState: {
        isPublishing: false,
        mode: 'simulation',
        lastLocation: null,
        serverSynced: false,
        lastSyncError: null,
      },

      toggleDutyStatus: () => {
        const { profile } = get();
        set({ profile: { ...profile, isOnline: !profile.isOnline } });
      },

      acceptOrder: () => {
        const { activeOrder, profile } = get();
        if (!activeOrder) return;
        set({
          activeOrder: {
            ...activeOrder,
            currentStep: 'navigating_to_store',
          },
        });

        // Start GPS tracking automatically & broadcast status
        get().startGpsPublishing('simulation');
        deliveryGpsService.broadcastStatusChange('Confirmed', 'Delivery partner accepted your order.');
      },

      rejectOrder: () => {
        get().stopGpsPublishing();
        set({ activeOrder: null });
      },

      advanceStep: () => {
        const { activeOrder, startGpsPublishing } = get();
        if (!activeOrder) return;

        if (activeOrder.currentStep === 'navigating_to_store') {
          set({ activeOrder: { ...activeOrder, currentStep: 'verifying_at_store' } });
          deliveryGpsService.broadcastStatusChange('Preparing', 'Items being verified & sealed into thermal bag at dark store.');
        } else if (activeOrder.currentStep === 'verifying_at_store') {
          set({ activeOrder: { ...activeOrder, currentStep: 'out_for_delivery' } });
          // Ensure GPS streaming is active when departing to customer
          startGpsPublishing('simulation');
          deliveryGpsService.broadcastStatusChange('OutForDelivery', 'Delivery partner is on the way to your address 🛵');
        } else if (activeOrder.currentStep === 'out_for_delivery') {
          set({ activeOrder: { ...activeOrder, currentStep: 'arrived_at_customer' } });
          deliveryGpsService.broadcastStatusChange('NearDoorstep', 'Delivery partner is near your door / gate 🏠');
        }
      },

      toggleItemVerification: (itemId: string) => {
        const { activeOrder } = get();
        if (!activeOrder) return;
        set({
          activeOrder: {
            ...activeOrder,
            items: activeOrder.items.map((item) =>
              item.id === itemId ? { ...item, isVerified: !item.isVerified } : item
            ),
          },
        });
      },

      verifyAllItems: () => {
        const { activeOrder } = get();
        if (!activeOrder) return;
        set({
          activeOrder: {
            ...activeOrder,
            items: activeOrder.items.map((item) => ({ ...item, isVerified: true })),
          },
        });
      },

      completeDoorstepDelivery: ({
        mode,
        cashCollected,
        changeGiven,
        qrAmount,
        qrRef,
        isAgeVerified,
      }: CompletePaymentParams) => {
        const { activeOrder, profile, completedOrders } = get();
        if (!activeOrder) return;

        get().stopGpsPublishing();
        deliveryGpsService.broadcastStatusChange('Delivered', 'Order successfully delivered at doorstep 🎉');

        const earned = activeOrder.totalRiderEarningNpr;

        const deliveredOrder: ActiveDeliveryOrder = {
          ...activeOrder,
          currentStep: 'delivered',
          paymentStatus: 'Completed',
          doorstepPayment: {
            mode,
            cashCollectedNpr: cashCollected,
            changeGivenNpr: changeGiven,
            qrAmountNpr: qrAmount,
            qrRefNumber: qrRef,
            isAgeVerified,
          },
        };

        set({
          activeOrder: null,
          completedOrders: [deliveredOrder, ...completedOrders],
          profile: {
            ...profile,
            todayEarningsNpr: profile.todayEarningsNpr + earned,
            totalTrips: profile.totalTrips + 1,
            cashInHandNpr: profile.cashInHandNpr + cashCollected,
            digitalCollectedNpr: profile.digitalCollectedNpr + qrAmount,
          },
        });
      },

      simulateNewOrder: () => {
        set({
          activeOrder: {
            ...SAMPLE_INCOMING_ORDER,
            id: `ord-${Date.now()}`,
            orderNumber: `MOJ-${Math.floor(10000 + Math.random() * 90000)}`,
            currentStep: 'incoming_request',
          },
        });
      },

      startGpsPublishing: (mode: 'device_gps' | 'simulation' = 'simulation') => {
        const { activeOrder, profile } = get();
        if (!activeOrder) return;

        set((state) => ({
          gpsState: {
            ...state.gpsState,
            isPublishing: true,
            mode,
          },
        }));

        if (mode === 'device_gps') {
          deliveryGpsService.startLiveGps(activeOrder.id, profile.id, profile.name);
        } else {
          deliveryGpsService.startSimulation(activeOrder.id, profile.id, profile.name);
        }
      },

      stopGpsPublishing: () => {
        deliveryGpsService.stopGps();
        set((state) => ({
          gpsState: {
            ...state.gpsState,
            isPublishing: false,
          },
        }));
      },

      updateGpsLocation: (loc: GpsLocation, synced: boolean) => {
        set((state) => ({
          gpsState: {
            ...state.gpsState,
            lastLocation: loc,
            serverSynced: synced,
          },
        }));
      },

      resetAll: () => {
        deliveryGpsService.stopGps();
        set({
          profile: INITIAL_RIDER_PROFILE,
          activeOrder: SAMPLE_INCOMING_ORDER,
          completedOrders: [],
          gpsState: {
            isPublishing: false,
            mode: 'simulation',
            lastLocation: null,
            serverSynced: false,
            lastSyncError: null,
          },
        });
      },
    }),
    {
      name: 'mojjo-delivery-enterprise-storage',
    }
  )
);
