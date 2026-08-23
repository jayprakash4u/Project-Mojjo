export interface ColorPalette {
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  foreground: string;
  muted: string;
  subtle: string;
  border: string;
  borderStrong: string;

  primary: string;
  primaryLight: string;
  onPrimary: string;
  onPrimaryMuted: string;

  secondary: string;
  secondaryLight: string;
  secondarySoft: string;
  onSecondary: string;

  accent: string;
  accentLight: string;
  accentSoft: string;
  onAccent: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;

  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  cardBackground: string;
  badgeBackground: string;
  overlay: string;
}

export const lightColors: ColorPalette = {
  background: '#F7F5EF',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#EFECE3',
  foreground: '#141C22',
  muted: '#5D6A73',
  subtle: '#8B969D',
  border: '#E4E2D9',
  borderStrong: '#CFCCC0',

  primary: '#0B1F2A',
  primaryLight: '#16323F',
  onPrimary: '#F7F5EF',
  onPrimaryMuted: '#9AA8B0',

  secondary: '#0F766E',
  secondaryLight: '#139288',
  secondarySoft: '#E6F2F0',
  onSecondary: '#FFFFFF',

  accent: '#C08B32',
  accentLight: '#D49D3D',
  accentSoft: '#F8EFDD',
  onAccent: '#2A1D06',

  success: '#157A58',
  successSoft: '#E2F2EC',
  warning: '#A8680B',
  warningSoft: '#FBEEDA',
  error: '#B93B3B',
  errorSoft: '#FBE9E9',
  info: '#2563A8',
  infoSoft: '#E6EFF9',

  tabBarBackground: '#FFFFFF',
  tabBarActive: '#0F766E',
  tabBarInactive: '#8B969D',
  cardBackground: '#FFFFFF',
  badgeBackground: '#0B1F2A',
  overlay: 'rgba(11, 31, 42, 0.55)',
};

export const darkColors: ColorPalette = {
  background: '#0B1218',
  surface: '#121D25',
  surfaceRaised: '#192833',
  surfaceSunken: '#070D12',
  foreground: '#F5F7F8',
  muted: '#9CA9B3',
  subtle: '#6A7882',
  border: '#1F2F3B',
  borderStrong: '#2D4152',

  primary: '#F7F5EF',
  primaryLight: '#E5E1D5',
  onPrimary: '#0B1F2A',
  onPrimaryMuted: '#6A7882',

  secondary: '#14B8A6',
  secondaryLight: '#2DD4BF',
  secondarySoft: '#0A2E2B',
  onSecondary: '#042220',

  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentSoft: '#332305',
  onAccent: '#1F1401',

  success: '#10B981',
  successSoft: '#062E21',
  warning: '#F59E0B',
  warningSoft: '#332305',
  error: '#EF4444',
  errorSoft: '#371111',
  info: '#3B82F6',
  infoSoft: '#0F264A',

  tabBarBackground: '#121D25',
  tabBarActive: '#14B8A6',
  tabBarInactive: '#6A7882',
  cardBackground: '#121D25',
  badgeBackground: '#192833',
  overlay: 'rgba(0, 0, 0, 0.7)',
};
