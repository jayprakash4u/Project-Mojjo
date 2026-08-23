import React, { useEffect, useMemo } from 'react';
import { InteractionManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { RootStackParamList } from './types';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { CheckoutScreen } from '../screens/cart/CheckoutScreen';
import { ProductDetailScreen } from '../screens/catalog/ProductDetailScreen';
import { SearchScreen } from '../screens/catalog/SearchScreen';
import { OrderTrackingScreen } from '../screens/orders/OrderTrackingScreen';
import { SavedAddressesScreen } from '../screens/address/SavedAddressesScreen';
import { AddEditAddressScreen } from '../screens/address/AddEditAddressScreen';
import { WishlistScreen } from '../screens/catalog/WishlistScreen';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useAddressStore } from '../store/addressStore';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initializeSession = useAuthStore((s) => s.initializeSession);
  const initializeCart = useCartStore((s) => s.initializeCart);
  const loadAddresses = useAddressStore((s) => s.loadAddresses);

  useEffect(() => {
    // Stage 1 (Critical Path): Resolve auth session immediately & reveal initial frame
    const startCriticalSession = async () => {
      try {
        await initializeSession();
      } catch (e) {
        console.warn('[RootNavigator] Session initialization error', e);
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    };

    startCriticalSession();

    // Stage 2 (Deferred Path): Hydrate cart and secondary storage in background after initial animations
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      initializeCart();
      loadAddresses();
    });

    return () => {
      interactionTask.cancel();
    };
  }, [initializeSession, initializeCart, loadAddresses]);

  const navTheme = useMemo(
    () => ({
      dark: theme.isDark,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.foreground,
        border: theme.colors.border,
        notification: theme.colors.secondary,
      },
      fonts: {
        regular: {
          fontFamily: theme.typography.presets.body.fontFamily || 'System',
          fontWeight: '400' as const,
        },
        medium: {
          fontFamily: theme.typography.presets.bodyMedium.fontFamily || 'System',
          fontWeight: '500' as const,
        },
        bold: {
          fontFamily: theme.typography.presets.bodyBold.fontFamily || 'System',
          fontWeight: '700' as const,
        },
        heavy: {
          fontFamily: theme.typography.presets.h1.fontFamily || 'System',
          fontWeight: '800' as const,
        },
      },
    }),
    [theme]
  );

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={AppNavigator} />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="OrderTracking"
              component={OrderTrackingScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="SavedAddresses"
              component={SavedAddressesScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="AddEditAddress"
              component={AddEditAddressScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Wishlist"
              component={WishlistScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
