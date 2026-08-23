import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { OfflineState } from './OfflineState';
import { OfflineBanner } from './OfflineBanner';
import { ErrorState } from './ErrorState';
import { useNetwork } from '../../hooks/useNetwork';
import { ApiError } from '../../api/errors';

export interface StateViewProps {
  isLoading?: boolean;
  isError?: boolean;
  isOffline?: boolean;
  isEmpty?: boolean;
  hasCachedData?: boolean;
  error?: Error | ApiError | string | null;
  onRetry?: () => Promise<void> | void;
  skeletonComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  offlineComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  showOfflineBanner?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const StateView: React.FC<StateViewProps> = memo(({
  isLoading = false,
  isError = false,
  isOffline: customIsOffline,
  isEmpty = false,
  hasCachedData = false,
  error,
  onRetry,
  skeletonComponent,
  emptyComponent,
  offlineComponent,
  errorComponent,
  showOfflineBanner = true,
  style,
  children,
}) => {
  const { isOnline } = useNetwork();
  const effectiveIsOffline = customIsOffline !== undefined ? customIsOffline : !isOnline;

  // 1. Offline with NO cached data to show: render full offline screen
  if (effectiveIsOffline && !hasCachedData && !isLoading) {
    return (
      <View style={[styles.container, style]}>
        {offlineComponent || <OfflineState onRetry={onRetry} />}
      </View>
    );
  }

  // 2. Loading state: render skeleton loader
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        {skeletonComponent || null}
      </View>
    );
  }

  // 3. Error state with no cached data: render error state
  if (isError && !hasCachedData) {
    return (
      <View style={[styles.container, style]}>
        {errorComponent || <ErrorState error={error} onRetry={onRetry} />}
      </View>
    );
  }

  // 4. Empty data state
  if (isEmpty) {
    return (
      <View style={[styles.container, style]}>
        {emptyComponent || null}
      </View>
    );
  }

  // 5. Normal content (with optional non-blocking offline banner if offline with cached data)
  return (
    <View style={[styles.contentWrapper, style]}>
      {effectiveIsOffline && showOfflineBanner && <OfflineBanner onRetry={onRetry} />}
      {children}
    </View>
  );
});

StateView.displayName = 'StateView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
});
