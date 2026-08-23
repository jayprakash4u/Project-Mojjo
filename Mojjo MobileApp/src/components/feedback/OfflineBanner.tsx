import React, { useEffect, useRef, useState, memo } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Text } from '../common/Typography';
import { useNetwork } from '../../hooks/useNetwork';

export interface OfflineBannerProps {
  onRetry?: () => Promise<void> | void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = memo(({ onRetry }) => {
  const { theme } = useTheme();
  const { isOnline, checkConnection } = useNetwork();
  const [retrying, setRetrying] = useState(false);
  const [showRestored, setShowRestored] = useState(false);
  const wasOffline = useRef(false);

  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      setShowRestored(false);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (wasOffline.current) {
      // Transition to restored state
      setShowRestored(true);
      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowRestored(false);
          wasOffline.current = false;
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOnline, translateY]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await checkConnection();
      if (onRetry) {
        await onRetry();
      }
    } finally {
      setRetrying(false);
    }
  };

  if (isOnline && !showRestored && !wasOffline.current) {
    return null;
  }

  const bgColor = showRestored
    ? theme.colors.success
    : theme.colors.warning;
  const textColor = '#FFFFFF';

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: bgColor,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.contentRow}>
        <Ionicons
          name={showRestored ? 'checkmark-circle' : 'cloud-offline'}
          size={18}
          color={textColor}
        />
        <Text weight="700" size={12} color={textColor} style={styles.bannerText}>
          {showRestored
            ? '✓ Back Online • Live updates active'
            : "⚠️ You're offline • Showing cached catalog"}
        </Text>
      </View>

      {!showRestored && (
        <TouchableOpacity
          onPress={handleRetry}
          disabled={retrying}
          style={styles.retryChip}
        >
          {retrying ? (
            <ActivityIndicator size="small" color={textColor} />
          ) : (
            <Text weight="700" size={11} color={textColor}>
              Retry
            </Text>
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

OfflineBanner.displayName = 'OfflineBanner';

const styles = StyleSheet.create({
  bannerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerText: {
    marginLeft: 8,
    flex: 1,
  },
  retryChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
