import { create } from 'zustand';
import { AuthTokens, UserProfile } from '../types/auth';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StorageService } from '../services/storage';

interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (tokens: AuthTokens, user: UserProfile) => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  initializeSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: async (tokens: AuthTokens, user: UserProfile) => {
    await StorageService.setSecureItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN, tokens.accessToken);
    await StorageService.setSecureItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, tokens.refreshToken);
    await StorageService.setItem(STORAGE_KEYS.AUTH_USER_PROFILE, user);

    set({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: async (updatedFields: Partial<UserProfile>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const mergedUser: UserProfile = { ...currentUser, ...updatedFields };
    await StorageService.setItem(STORAGE_KEYS.AUTH_USER_PROFILE, mergedUser);
    set({ user: mergedUser });
  },

  logout: async () => {
    await StorageService.deleteSecureItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN);
    await StorageService.deleteSecureItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    await StorageService.removeItem(STORAGE_KEYS.AUTH_USER_PROFILE);

    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeSession: async () => {
    try {
      set({ isLoading: true });
      const accessToken = await StorageService.getSecureItem(STORAGE_KEYS.AUTH_ACCESS_TOKEN);
      const refreshToken = await StorageService.getSecureItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
      const user = await StorageService.getItem<UserProfile>(STORAGE_KEYS.AUTH_USER_PROFILE);

      if (accessToken && user) {
        set({
          tokens: {
            accessToken,
            refreshToken: refreshToken || '',
            expiresAt: '',
          },
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.warn('[authStore] Failed to initialize session', error);
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
