import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const LAYOUT = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isTablet: width >= 768,
  
  hitSlop: {
    small: { top: 6, bottom: 6, left: 6, right: 6 },
    medium: { top: 12, bottom: 12, left: 12, right: 12 },
    large: { top: 18, bottom: 18, left: 18, right: 18 },
  },

  tabBarHeight: 64,
  headerHeight: 56,
  bottomBarPadding: 24,
};
