import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export class StorageService {
  /**
   * Secure Storage for sensitive keys (Tokens, refresh tokens)
   */
  static async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (error) {
      console.warn(`[StorageService] Failed to set secure item: ${key}`, error);
    }
  }

  static async getSecureItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`[StorageService] Failed to get secure item: ${key}`, error);
      return null;
    }
  }

  static async deleteSecureItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`[StorageService] Failed to delete secure item: ${key}`, error);
    }
  }

  /**
   * AsyncStorage for regular data (Cart, Theme, Preferences)
   */
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      console.warn(`[StorageService] Failed to set item: ${key}`, error);
    }
  }

  static async getItem<T>(key: string, fallback: T | null = null): Promise<T | null> {
    try {
      const serialized = await AsyncStorage.getItem(key);
      if (serialized === null) return fallback;
      return JSON.parse(serialized) as T;
    } catch (error) {
      console.warn(`[StorageService] Failed to get item: ${key}`, error);
      return fallback;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`[StorageService] Failed to remove item: ${key}`, error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.warn('[StorageService] Failed to clear storage', error);
    }
  }
}
