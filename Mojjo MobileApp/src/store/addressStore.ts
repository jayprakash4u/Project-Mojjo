import { create } from 'zustand';
import { Address } from '../types/address';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StorageService } from '../services/storage';
import { DeliveryZoneService } from '../services/delivery/deliveryZoneService';
import { CustomerLocationService, DetectedLocationResult } from '../services/delivery/customerLocationService';
import { HapticsService } from '../services/haptics';

export interface AddressState {
  addresses: Address[];
  selectedAddressId?: string;
  detectedLocation: DetectedLocationResult | null;
  isDetectingLocation: boolean;
  isLoading: boolean;

  // Actions
  addAddress: (addressData: Omit<Address, 'id' | 'createdAt' | 'isServiceable' | 'etaMinutes'>) => Promise<Address>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  selectAddress: (id: string) => Promise<void>;
  getSelectedAddress: () => Address | undefined;
  loadAddresses: () => Promise<void>;
  detectAndApplyCurrentLocation: () => Promise<DetectedLocationResult>;
  applyDetectedLocation: (result: DetectedLocationResult) => Promise<Address>;
}

const DEFAULT_SEED_ADDRESS: Address = {
  id: 'addr-default-1',
  label: 'Home',
  recipientName: 'Jay Prakash',
  phoneNumber: '9841234567',
  streetAddress: 'Jhamsikhel Rd, Ward 3',
  area: 'Jhamsikhel',
  city: 'Lalitpur',
  landmark: 'Near St. Xavier’s College',
  deliveryInstructions: 'Ring bell twice, leave at door',
  isDefault: true,
  isServiceable: true,
  etaMinutes: 10,
  createdAt: new Date().toISOString(),
};

const persistAddresses = async (addresses: Address[], selectedId?: string) => {
  await StorageService.setItem(STORAGE_KEYS.SAVED_ADDRESSES, addresses);
  if (selectedId) {
    await StorageService.setItem(STORAGE_KEYS.SELECTED_ADDRESS, selectedId);
  }
};

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [DEFAULT_SEED_ADDRESS],
  selectedAddressId: DEFAULT_SEED_ADDRESS.id,
  detectedLocation: null,
  isDetectingLocation: false,
  isLoading: false,

  loadAddresses: async () => {
    try {
      set({ isLoading: true });
      const saved = await StorageService.getItem<Address[]>(STORAGE_KEYS.SAVED_ADDRESSES);
      const savedSelectedId = await StorageService.getItem<string>(STORAGE_KEYS.SELECTED_ADDRESS);

      let addresses = saved && saved.length > 0 ? saved : [DEFAULT_SEED_ADDRESS];
      
      // Re-evaluate serviceability on load
      addresses = addresses.map((addr) => {
        const check = DeliveryZoneService.checkServiceability(addr.area, addr.city);
        return {
          ...addr,
          isServiceable: check.isServiceable,
          etaMinutes: check.etaMinutes || 10,
        };
      });

      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      const selectedId = savedSelectedId && addresses.some((a) => a.id === savedSelectedId)
        ? savedSelectedId
        : defaultAddr?.id;

      set({
        addresses,
        selectedAddressId: selectedId,
        isLoading: false,
      });

      persistAddresses(addresses, selectedId);
    } catch {
      set({ addresses: [DEFAULT_SEED_ADDRESS], selectedAddressId: DEFAULT_SEED_ADDRESS.id, isLoading: false });
    }
  },

  detectAndApplyCurrentLocation: async (): Promise<DetectedLocationResult> => {
    set({ isDetectingLocation: true });
    try {
      const result = await CustomerLocationService.requestAndGetLocation();
      set({ detectedLocation: result, isDetectingLocation: false });

      // Automatically add/apply detected address if GPS permission is granted
      if (result.permissionGranted) {
        await get().applyDetectedLocation(result);
      }
      return result;
    } catch (e) {
      set({ isDetectingLocation: false });
      throw e;
    }
  },

  applyDetectedLocation: async (result: DetectedLocationResult): Promise<Address> => {
    const currentAddresses = get().addresses;
    
    // Check if an address with this area already exists
    const existing = currentAddresses.find(
      (a) => a.area.toLowerCase() === result.area.toLowerCase()
    );

    if (existing) {
      // Select existing
      await get().selectAddress(existing.id);
      return existing;
    }

    // Add new detected address
    const newAddr = await get().addAddress({
      label: 'Other',
      recipientName: 'Jay Prakash',
      phoneNumber: '9841234567',
      streetAddress: result.streetAddress,
      area: result.area,
      city: result.city,
      landmark: result.landmark,
      isDefault: true,
      latitude: result.latitude,
      longitude: result.longitude,
    });

    return newAddr;
  },

  addAddress: async (addressData) => {
    HapticsService.success();
    const currentAddresses = get().addresses;
    const check = DeliveryZoneService.checkServiceability(addressData.area, addressData.city);

    const isFirst = currentAddresses.length === 0;
    const shouldBeDefault = addressData.isDefault || isFirst;

    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
      isDefault: shouldBeDefault,
      isServiceable: check.isServiceable,
      etaMinutes: check.etaMinutes || 10,
      createdAt: new Date().toISOString(),
    };

    let updatedAddresses: Address[];
    if (shouldBeDefault) {
      updatedAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
      updatedAddresses.unshift(newAddress);
    } else {
      updatedAddresses = [newAddress, ...currentAddresses];
    }

    const selectedId = shouldBeDefault ? newAddress.id : (get().selectedAddressId || newAddress.id);

    set({
      addresses: updatedAddresses,
      selectedAddressId: selectedId,
    });

    await persistAddresses(updatedAddresses, selectedId);
    return newAddress;
  },

  updateAddress: async (id: string, updates: Partial<Address>) => {
    HapticsService.light();
    const currentAddresses = get().addresses;

    let updatedAddresses = currentAddresses.map((item) => {
      if (item.id === id) {
        const merged = { ...item, ...updates, updatedAt: new Date().toISOString() };
        const check = DeliveryZoneService.checkServiceability(merged.area, merged.city);
        return {
          ...merged,
          isServiceable: check.isServiceable,
          etaMinutes: check.etaMinutes || 10,
        };
      }
      return item;
    });

    if (updates.isDefault) {
      updatedAddresses = updatedAddresses.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }));
    }

    set({ addresses: updatedAddresses });
    await persistAddresses(updatedAddresses, get().selectedAddressId);
  },

  deleteAddress: async (id: string) => {
    HapticsService.warning();
    const currentAddresses = get().addresses;
    const filtered = currentAddresses.filter((item) => item.id !== id);

    let updatedAddresses = filtered;
    let selectedId = get().selectedAddressId;

    if (updatedAddresses.length > 0) {
      const hasDefault = updatedAddresses.some((a) => a.isDefault);
      if (!hasDefault) {
        updatedAddresses[0].isDefault = true;
      }
      if (selectedId === id) {
        selectedId = updatedAddresses[0].id;
      }
    } else {
      selectedId = undefined;
    }

    set({ addresses: updatedAddresses, selectedAddressId: selectedId });
    await persistAddresses(updatedAddresses, selectedId);
  },

  setDefaultAddress: async (id: string) => {
    HapticsService.selection();
    const currentAddresses = get().addresses;

    const updatedAddresses = currentAddresses.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));

    set({ addresses: updatedAddresses, selectedAddressId: id });
    await persistAddresses(updatedAddresses, id);
  },

  selectAddress: async (id: string) => {
    HapticsService.selection();
    set({ selectedAddressId: id });
    await StorageService.setItem(STORAGE_KEYS.SELECTED_ADDRESS, id);
  },

  getSelectedAddress: (): Address | undefined => {
    const { addresses, selectedAddressId } = get();
    if (selectedAddressId) {
      const found = addresses.find((a) => a.id === selectedAddressId);
      if (found) return found;
    }
    return addresses.find((a) => a.isDefault) || addresses[0];
  },
}));

/**
 * Selectors for optimized components
 */
export const useAddresses = (): Address[] => {
  return useAddressStore((state) => state.addresses);
};

export const useSelectedAddress = (): Address | undefined => {
  return useAddressStore((state) => state.getSelectedAddress());
};

export const useDefaultAddress = (): Address | undefined => {
  return useAddressStore((state) => state.addresses.find((a) => a.isDefault));
};
