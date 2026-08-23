import { ViewStyle, Platform } from 'react-native';

export interface ShadowLevels {
  none: ViewStyle;
  xs: ViewStyle;
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  xl: ViewStyle;
}

export const shadows: ShadowLevels = {
  none: {
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  xs: {
    ...Platform.select({
      ios: {
        shadowColor: '#0B1F2A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sm: {
    ...Platform.select({
      ios: {
        shadowColor: '#0B1F2A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  md: {
    ...Platform.select({
      ios: {
        shadowColor: '#0B1F2A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  lg: {
    ...Platform.select({
      ios: {
        shadowColor: '#0B1F2A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  xl: {
    ...Platform.select({
      ios: {
        shadowColor: '#0B1F2A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
};
