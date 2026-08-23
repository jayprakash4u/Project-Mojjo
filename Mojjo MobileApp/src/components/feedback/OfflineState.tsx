import React, { useState, memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Heading, Subheading, Text } from '../common/Typography';
import { Button } from '../common/Button';
import { useNetwork } from '../../hooks/useNetwork';

export interface OfflineStateProps {
  onRetry?: () => Promise<void> | void;
  title?: string;
  description?: string;
  style?: ViewStyle;
}

export const OfflineState: React.FC<OfflineStateProps> = memo(({
  onRetry,
  title = "You're offline",
  description = 'Check your internet connection and try again to browse fresh groceries & flash deals.',
  style,
}) => {
  const { theme } = useTheme();
  const { checkConnection } = useNetwork();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const isOnline = await checkConnection();
      if (onRetry) {
        await onRetry();
      }
    } finally {
      setRetrying(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.warningSoft },
        ]}
      >
        <Ionicons name="cloud-offline-outline" size={54} color={theme.colors.warning} />
      </View>

      <Heading level={2} align="center" style={styles.title}>
        {title}
      </Heading>

      <Subheading align="center" style={styles.description}>
        {description}
      </Subheading>

      <Button
        title="Retry Connection"
        leftIcon={<Ionicons name="reload-outline" size={18} color="#FFFFFF" />}
        onPress={handleRetry}
        loading={retrying}
        variant="primary"
        size="lg"
        style={styles.retryButton}
      />
    </View>
  );
});

OfflineState.displayName = 'OfflineState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 380,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 10,
  },
  description: {
    marginBottom: 28,
    lineHeight: 22,
    maxWidth: 320,
  },
  retryButton: {
    minWidth: 200,
  },
});
