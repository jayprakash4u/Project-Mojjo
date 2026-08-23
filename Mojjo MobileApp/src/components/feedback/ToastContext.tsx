import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { HapticsService } from '../../services/haptics';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [animation] = useState(new Animated.Value(0));

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      title: string,
      message?: string,
      type: ToastType = 'info',
      duration: number = 3500
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      if (type === 'success') HapticsService.success();
      else if (type === 'error') HapticsService.error();
      else if (type === 'warning') HapticsService.warning();
      else HapticsService.light();

      setToasts([newToast]);

      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();

      setTimeout(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          dismissToast(id);
        });
      }, duration);
    },
    [animation, dismissToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => showToast(title, message, 'success'),
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => showToast(title, message, 'error'),
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => showToast(title, message, 'info'),
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => showToast(title, message, 'warning'),
    [showToast]
  );

  const currentToast = toasts[0];

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: theme.colors.surfaceRaised,
          accent: theme.colors.success,
          icon: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          bg: theme.colors.surfaceRaised,
          accent: theme.colors.error,
          icon: 'alert-circle' as const,
        };
      case 'warning':
        return {
          bg: theme.colors.surfaceRaised,
          accent: theme.colors.warning,
          icon: 'warning' as const,
        };
      case 'info':
      default:
        return {
          bg: theme.colors.surfaceRaised,
          accent: theme.colors.info,
          icon: 'information-circle' as const,
        };
    }
  };

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showInfo, showWarning }}
    >
      {children}
      {currentToast && (
        <SafeAreaView pointerEvents="box-none" style={styles.toastContainer}>
          <Animated.View
            style={[
              styles.toastCard,
              {
                backgroundColor: getToastColors(currentToast.type).bg,
                borderLeftColor: getToastColors(currentToast.type).accent,
                opacity: animation,
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
                ...theme.shadows.lg,
              },
            ]}
          >
            <Ionicons
              name={getToastColors(currentToast.type).icon}
              size={24}
              color={getToastColors(currentToast.type).accent}
              style={styles.toastIcon}
            />
            <View style={styles.toastTextContainer}>
              <Text
                style={[
                  theme.typography.presets.bodyBold,
                  { color: theme.colors.foreground },
                ]}
              >
                {currentToast.title}
              </Text>
              {currentToast.message ? (
                <Text
                  style={[
                    theme.typography.presets.caption,
                    { color: theme.colors.muted, marginTop: 2 },
                  ]}
                >
                  {currentToast.message}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => dismissToast(currentToast.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={theme.colors.subtle} />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  toastIcon: {
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
    marginRight: 8,
  },
});
