import { ColorPalette } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { ShadowLevels } from './shadows';

export interface Theme {
  isDark: boolean;
  colors: ColorPalette;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: ShadowLevels;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}
