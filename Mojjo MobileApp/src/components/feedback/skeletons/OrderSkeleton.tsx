import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Skeleton } from '../../common/Skeleton';
import { Card } from '../../common/Card';

export interface OrderSkeletonProps {
  count?: number;
  style?: ViewStyle;
}

export const OrderSkeleton: React.FC<OrderSkeletonProps> = memo(({
  count = 3,
  style,
}) => {
  const items = Array.from({ length: count });

  return (
    <View style={[styles.container, style]}>
      {items.map((_, i) => (
        <Card key={i} variant="elevated" style={styles.card} padding="md">
          <View style={styles.headerRow}>
            <View>
              <Skeleton width={90} height={16} style={styles.orderNumber} />
              <Skeleton width={130} height={12} style={styles.date} />
            </View>
            <Skeleton width={80} height={24} borderRadius={12} />
          </View>
          <View style={styles.divider} />
          <Skeleton width="100%" height={14} style={styles.itemSummary} />
          <Skeleton width="70%" height={14} style={styles.itemSummary} />
          <View style={styles.footerRow}>
            <View>
              <Skeleton width={90} height={12} style={styles.meta} />
              <Skeleton width={70} height={18} />
            </View>
            <Skeleton width={100} height={32} borderRadius={8} />
          </View>
        </Card>
      ))}
    </View>
  );
});

OrderSkeleton.displayName = 'OrderSkeleton';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  card: {
    marginBottom: 14,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    marginBottom: 4,
  },
  date: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 10,
  },
  itemSummary: {
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meta: {
    marginBottom: 4,
  },
});
