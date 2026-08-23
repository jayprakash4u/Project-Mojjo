import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';
import { shadows } from './shadows';
import { Theme } from './types';

export const lightTheme: Theme = {
  isDark: false,
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export const darkTheme: Theme = {
  isDark: true,
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  shadows,
};
