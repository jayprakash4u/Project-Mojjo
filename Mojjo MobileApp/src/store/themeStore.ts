import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StorageService } from '../services/storage';

export type ThemeModePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeModePreference;
  setThemeMode: (mode: ThemeModePreference) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'system',

  setThemeMode: async (mode: ThemeModePreference) => {
    await StorageService.setItem(STORAGE_KEYS.THEME_MODE, mode);
    set({ themeMode: mode });
  },

  initializeTheme: async () => {
    try {
      const savedMode = await StorageService.getItem<ThemeModePreference>(
        STORAGE_KEYS.THEME_MODE,
        'system'
      );
      set({ themeMode: savedMode || 'system' });
    } catch {
      set({ themeMode: 'system' });
    }
  },
}));
