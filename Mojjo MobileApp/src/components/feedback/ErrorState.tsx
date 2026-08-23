import React, { useState, memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Heading, Subheading } from '../common/Typography';
import { Button } from '../common/Button';
import { ApiError } from '../../api/errors';

export interface ErrorStateProps {
  error?: Error | ApiError | string | null;
  onRetry?: () => Promise<void> | void;
  title?: string;
  description?: string;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = memo(({
  error,
  onRetry,
  title,
  description,
  style,
}) => {
  const { theme } = useTheme();
  const [retrying, setRetrying] = useState(false);

  const isNetworkError =
    (error && typeof error === 'object' && 'isNetworkError' in error && (error as ApiError).isNetworkError) ||
    (error && typeof error === 'object' && 'message' in error && error.message.toLowerCase().includes('network'));

  const statusCode =
    error && typeof error === 'object' && 'statusCode' in error ? (error as ApiError).statusCode : undefined;

  let resolvedTitle = title;
  let resolvedDescription = description;
  let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle-outline';

  if (!resolvedTitle) {
    if (isNetworkError) {
      resolvedTitle = 'Connection Timeout';
      iconName = 'wifi-outline';
    } else if (statusCode && statusCode >= 500) {
      resolvedTitle = 'Server Unavailable';
      iconName = 'server-outline';
    } else if (statusCode === 404) {
      resolvedTitle = 'Item Not Found';
      iconName = 'search-outline';
    } else {
      resolvedTitle = 'Unable to Load';
      iconName = 'alert-circle-outline';
    }
  }

  if (!resolvedDescription) {
    if (isNetworkError) {
      resolvedDescription =
        'Your connection seems slow or disconnected. Check your connection and try again.';
    } else if (statusCode && statusCode >= 500) {
      resolvedDescription =
        'Our servers encountered a temporary issue. Please tap below to retry.';
    } else if (error && typeof error === 'object' && 'message' in error && error.message) {
      resolvedDescription = error.message;
    } else if (typeof error === 'string') {
      resolvedDescription = error;
    } else {
      resolvedDescription = 'An unexpected error occurred while fetching data.';
    }
  }

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.errorSoft },
        ]}
      >
        <Ionicons name={iconName} size={48} color={theme.colors.error} />
      </View>

      <Heading level={2} align="center" style={styles.title}>
        {resolvedTitle}
      </Heading>

      <Subheading align="center" style={styles.description}>
        {resolvedDescription}
      </Subheading>

      {onRetry && (
        <Button
          title="Try Again"
          leftIcon={<Ionicons name="refresh-outline" size={18} color="#FFFFFF" />}
          onPress={handleRetry}
          loading={retrying}
          variant="secondary"
          size="lg"
          style={styles.retryButton}
        />
      )}
    </View>
  );
});

ErrorState.displayName = 'ErrorState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 360,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
    maxWidth: 320,
  },
  retryButton: {
    minWidth: 180,
  },
});
