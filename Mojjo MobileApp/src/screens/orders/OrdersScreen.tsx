import React, { useCallback, memo } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption, PriceText } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { useTheme } from '../../theme';
import { formatDateTime } from '../../utils/date';

interface MockOrder {
  id: string;
  orderNumber: string;
  status: 'OutForDelivery' | 'Delivered';
  itemsSummary: string;
  itemCount: number;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ord_101',
    orderNumber: 'MJ-8921',
    status: 'OutForDelivery',
    itemsSummary: 'Real Fruit Juice (1L), Wai Wai 12-Pack, DDC Butter',
    itemCount: 3,
    totalAmount: 1030,
    createdAt: new Date().toISOString(),
    paymentMethod: 'eSewa',
  },
  {
    id: 'ord_100',
    orderNumber: 'MJ-7840',
    status: 'Delivered',
    itemsSummary: 'Coca Cola 2.25L, Lays Classic Salted, Kurkure',
    itemCount: 3,
    totalAmount: 580,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    paymentMethod: 'Khalti',
  },
];

const ORDER_CARD_HEIGHT = 180;

/**
 * Memoized Order Card Item Component
 */
const OrderCardItem = memo<{
  order: MockOrder;
  onTrack: (orderNumber: string) => void;
  onReorder: () => void;
}>(({ order, onTrack, onReorder }) => {
  const { theme } = useTheme();

  return (
    <Card variant="elevated" style={styles.orderCard} padding="md">
      <View style={styles.orderHeader}>
        <View>
          <Heading level={4}>#{order.orderNumber}</Heading>
          <Caption color={theme.colors.muted}>{formatDateTime(order.createdAt)}</Caption>
        </View>

        <Badge
          label={order.status === 'OutForDelivery' ? '⚡ On the Way' : '✓ Delivered'}
          variant={order.status === 'OutForDelivery' ? 'accent' : 'success'}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <Text numberOfLines={2} size={14} color={theme.colors.foreground} style={styles.itemsSummary}>
        {order.itemsSummary}
      </Text>

      <View style={styles.orderFooter}>
        <View>
          <Caption color={theme.colors.subtle}>{order.paymentMethod} • {order.itemCount} items</Caption>
          <PriceText amount={order.totalAmount} size="md" />
        </View>

        {order.status === 'OutForDelivery' ? (
          <Button
            title="Live Track 📍"
            size="sm"
            variant="secondary"
            onPress={() => onTrack(order.orderNumber)}
          />
        ) : (
          <Button
            title="Reorder"
            size="sm"
            variant="outline"
            onPress={onReorder}
          />
        )}
      </View>
    </Card>
  );
});
OrderCardItem.displayName = 'OrderCardItem';

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleTrack = useCallback(
    (orderNumber: string) => {
      navigation.navigate('OrderTracking' as never, { orderId: orderNumber } as never);
    },
    [navigation]
  );

  const handleReorder = useCallback(() => {
    navigation.navigate('MainTabs' as never, { screen: 'CartTab' } as never);
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('CartTab' as never);
  }, [navigation]);

  const renderOrderItem: ListRenderItem<MockOrder> = useCallback(
    ({ item }) => (
      <OrderCardItem
        order={item}
        onTrack={handleTrack}
        onReorder={handleReorder}
      />
    ),
    [handleTrack, handleReorder]
  );

  const orderKeyExtractor = useCallback((item: MockOrder) => item.id, []);

  const orderGetItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ORDER_CARD_HEIGHT,
      offset: ORDER_CARD_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <ScreenWrapper
      headerComponent={
        <Header
          title="Your Orders"
          showCart
          onCartPress={handleCartPress}
        />
      }
      style={styles.container}
    >
      <OfflineBanner />
      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={orderKeyExtractor}
        renderItem={renderOrderItem}
        getItemLayout={orderGetItemLayout}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  listContent: {
    paddingVertical: 12,
  },
  orderCard: {
    marginBottom: 14,
    borderRadius: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  itemsSummary: {
    marginBottom: 12,
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
