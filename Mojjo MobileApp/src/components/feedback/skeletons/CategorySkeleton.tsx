import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Skeleton } from '../../common/Skeleton';
import { Card } from '../../common/Card';

export interface CategorySkeletonProps {
  count?: number;
  style?: ViewStyle;
}

export const CategorySkeleton: React.FC<CategorySkeletonProps> = memo(({
  count = 6,
  style,
}) => {
  const items = Array.from({ length: count });

  return (
    <View style={[styles.grid, style]}>
      {items.map((_, i) => (
        <Card key={i} variant="elevated" style={styles.card} padding="md">
          <Skeleton width={60} height={60} borderRadius={30} style={styles.circle} />
          <Skeleton width="80%" height={16} style={styles.name} />
          <Skeleton width="50%" height={12} style={styles.count} />
        </Card>
      ))}
    </View>
  );
});

CategorySkeleton.displayName = 'CategorySkeleton';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  card: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    minHeight: 140,
    marginBottom: 12,
  },
  circle: {
    marginBottom: 12,
  },
  name: {
    marginBottom: 6,
  },
  count: {
    marginTop: 2,
  },
});
