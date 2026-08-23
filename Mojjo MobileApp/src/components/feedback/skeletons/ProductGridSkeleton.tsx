import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Skeleton } from '../../common/Skeleton';
import { Card } from '../../common/Card';

export interface ProductGridSkeletonProps {
  count?: number;
  horizontal?: boolean;
  style?: ViewStyle;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = memo(({
  count = 4,
  horizontal = false,
  style,
}) => {
  const items = Array.from({ length: count });

  if (horizontal) {
    return (
      <View style={[styles.horizontalRow, style]}>
        {items.map((_, i) => (
          <Card key={i} variant="elevated" style={styles.dealCardSkeleton} padding="sm">
            <Skeleton height={110} borderRadius={10} style={styles.imageSkeleton} />
            <Skeleton width="40%" height={12} style={styles.unitSkeleton} />
            <Skeleton width="90%" height={16} style={styles.titleSkeleton} />
            <Skeleton width="50%" height={16} style={styles.priceSkeleton} />
            <Skeleton height={32} borderRadius={8} style={styles.buttonSkeleton} />
          </Card>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.gridContainer, style]}>
      {items.map((_, i) => (
        <Card key={i} variant="elevated" style={styles.gridCardSkeleton} padding="sm">
          <Skeleton height={120} borderRadius={12} style={styles.imageSkeleton} />
          <Skeleton width="50%" height={12} style={styles.unitSkeleton} />
          <Skeleton width="85%" height={16} style={styles.titleSkeleton} />
          <Skeleton width="60%" height={18} style={styles.priceSkeleton} />
          <Skeleton height={36} borderRadius={8} style={styles.buttonSkeleton} />
        </Card>
      ))}
    </View>
  );
});

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

const styles = StyleSheet.create({
  horizontalRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  dealCardSkeleton: {
    width: 160,
    marginRight: 12,
    borderRadius: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  gridCardSkeleton: {
    width: '48%',
    marginBottom: 14,
    borderRadius: 16,
  },
  imageSkeleton: {
    marginBottom: 8,
  },
  unitSkeleton: {
    marginBottom: 6,
  },
  titleSkeleton: {
    marginBottom: 6,
  },
  priceSkeleton: {
    marginBottom: 10,
  },
  buttonSkeleton: {
    marginTop: 4,
  },
});
