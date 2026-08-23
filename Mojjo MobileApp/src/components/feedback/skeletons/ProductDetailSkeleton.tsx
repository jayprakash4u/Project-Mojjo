import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Skeleton } from '../../common/Skeleton';
import { Card } from '../../common/Card';

export interface ProductDetailSkeletonProps {
  style?: ViewStyle;
}

export const ProductDetailSkeleton: React.FC<ProductDetailSkeletonProps> = memo(({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Skeleton height={240} borderRadius={20} style={styles.heroSkeleton} />
      <Skeleton width={80} height={14} style={styles.brandSkeleton} />
      <Skeleton width="90%" height={24} style={styles.titleSkeleton} />
      <Skeleton width="60%" height={24} style={styles.titleSkeleton} />

      <View style={styles.unitRow}>
        <Skeleton width={70} height={24} borderRadius={12} />
        <Skeleton width={100} height={24} borderRadius={12} style={styles.rating} />
      </View>

      <View style={styles.priceRow}>
        <Skeleton width={120} height={28} />
        <Skeleton width={80} height={18} style={styles.strikethrough} />
      </View>

      <Card style={styles.detailsCard} padding="md">
        <Skeleton width={140} height={18} style={styles.sectionHeader} />
        <Skeleton width="100%" height={14} style={styles.descLine} />
        <Skeleton width="95%" height={14} style={styles.descLine} />
        <Skeleton width="70%" height={14} style={styles.descLine} />
      </Card>
    </View>
  );
});

ProductDetailSkeleton.displayName = 'ProductDetailSkeleton';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  heroSkeleton: {
    marginBottom: 20,
  },
  brandSkeleton: {
    marginBottom: 8,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  rating: {
    marginLeft: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 12,
  },
  strikethrough: {
    marginLeft: 10,
  },
  detailsCard: {
    marginTop: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  descLine: {
    marginBottom: 8,
  },
});
