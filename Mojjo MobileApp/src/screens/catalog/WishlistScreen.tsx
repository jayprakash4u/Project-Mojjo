import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption, PriceText } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { useTheme } from '../../theme';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../components/feedback/ToastContext';
import { Product } from '../../types/product';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { HapticsService } from '../../services/haptics';

export const WishlistScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { showSuccess, showInfo } = useToast();

  const items = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addItem(product, 1);
      showSuccess('Added to Basket', `${product.name} added`);
    },
    [addItem, showSuccess]
  );

  const handleRemove = useCallback(
    (product: Product) => {
      HapticsService.light();
      removeFromWishlist(product.id);
      showInfo('Removed from Wishlist', product.name);
    },
    [removeFromWishlist, showInfo]
  );

  const renderWishlistItem: ListRenderItem<Product> = useCallback(
    ({ item }) => {
      const discountPercent =
        item.originalPrice && item.originalPrice > item.price
          ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
          : null;

      return (
        <Card
          variant="outlined"
          style={styles.itemCard}
          padding="sm"
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <View style={styles.itemRow}>
            <View style={styles.imageWrapper}>
              <OptimizedImage
                uri={item.thumbnailUrl || (item.images && item.images[0])}
                width={72}
                height={72}
                fallbackIcon="cube-outline"
              />
              {discountPercent ? (
                <Badge
                  label={`${discountPercent}% OFF`}
                  variant="accent"
                  size="sm"
                  style={styles.discountBadge}
                />
              ) : null}
            </View>

            <View style={styles.itemInfo}>
              <Text weight="700" size={14} numberOfLines={2}>
                {item.name}
              </Text>
              <Caption color={theme.colors.muted} style={styles.unitText}>
                {item.unit} • {item.brand || 'Mojjo'}
              </Caption>
              <PriceText
                amount={item.price}
                originalAmount={item.originalPrice}
                size="sm"
              />
            </View>

            <View style={styles.actionCol}>
              <TouchableOpacity
                onPress={() => handleRemove(item)}
                style={styles.heartBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="heart" size={22} color="#B93B3B" />
              </TouchableOpacity>

              <Button
                title="+ Add"
                variant="secondary"
                size="sm"
                onPress={() => handleAddToCart(item)}
                style={styles.addBtn}
              />
            </View>
          </View>
        </Card>
      );
    },
    [handleAddToCart, handleRemove, navigation, theme]
  );

  return (
    <ScreenWrapper
      headerComponent={
        <Header
          showBack
          onBack={() => navigation.goBack()}
          title="My Wishlist"
          subtitle={`${items.length} saved products`}
          showCart
        />
      }
      style={styles.container}
    >
      <OfflineBanner />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="heart-outline"
            title="Your Wishlist is Empty"
            description="Tap the heart icon on any product to save it here for fast re-ordering."
            actionTitle="Explore Catalog"
            onAction={() => navigation.navigate('MainTabs', { screen: 'CategoriesTab' })}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderWishlistItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text weight="700" size={13} color={theme.colors.muted}>
                {items.length} ITEMS SAVED
              </Text>
              <TouchableOpacity onPress={clearWishlist}>
                <Caption color={theme.colors.error} bold>
                  Clear All
                </Caption>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  itemCard: {
    marginBottom: 10,
    borderRadius: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  unitText: {
    marginVertical: 2,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 68,
  },
  heartBtn: {
    padding: 2,
  },
  addBtn: {
    paddingHorizontal: 10,
  },
});
