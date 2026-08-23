import React, { useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption, PriceText } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { useTheme } from '../../theme';
import {
  useCartStore,
  useCartItems,
  useCartSummary,
  useCartAppliedCoupon,
} from '../../store/cartStore';
import { Ionicons } from '@expo/vector-icons';
import { formatNPR } from '../../utils/currency';
import { useNavigation } from '@react-navigation/native';
import { CartItem } from '../../types/cart';
import { useToast } from '../../components/feedback/ToastContext';
import { PROMOTIONAL_OFFERS } from '../../api/services/cartApi';

const CART_ITEM_HEIGHT = 104;

/**
 * Memoized Rich Cart List Item Component
 */
const CartListItem = memo<{
  cartItem: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}>(({ cartItem, onUpdateQuantity }) => {
  const { theme } = useTheme();
  const { product, quantity, unitPrice, originalPrice, unitDiscount, stockQuantity } = cartItem;
  const isMaxStock = quantity >= stockQuantity;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;

  return (
    <Card style={styles.itemCard} padding="md">
      <View style={styles.itemRow}>
        <View style={styles.itemImageContainer}>
          <OptimizedImage
            uri={product.thumbnailUrl || (product.images && product.images[0])}
            width={64}
            height={64}
            style={styles.productThumbnail}
            fallbackIcon="cube-outline"
          />
        </View>

        <View style={styles.itemDetails}>
          <Text weight="700" size={14} numberOfLines={1}>
            {product.name}
          </Text>
          <Caption color={theme.colors.muted} style={styles.unitText}>
            {product.unit}
          </Caption>

          {/* Pricing Row with MRP & Savings */}
          <View style={styles.pricingRow}>
            <PriceText amount={unitPrice} originalAmount={originalPrice} size="sm" />
            {unitDiscount > 0 ? (
              <Badge label={`Save ${formatNPR(unitDiscount)}`} variant="success" size="sm" style={styles.saveBadge} />
            ) : null}
          </View>

          {/* Low Stock Warning */}
          {isLowStock ? (
            <Text size={11} weight="600" color={theme.colors.warning} style={styles.stockWarning}>
              ⚠️ Only {stockQuantity} left in stock
            </Text>
          ) : null}
        </View>

        {/* Quantity Stepper */}
        <View
          style={[
            styles.quantityStepper,
            {
              backgroundColor: theme.colors.surfaceSunken,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => onUpdateQuantity(product.id, quantity - 1)}
            style={styles.stepperButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={quantity === 1 ? 'trash-outline' : 'remove'}
              size={16}
              color={quantity === 1 ? theme.colors.error : theme.colors.foreground}
            />
          </TouchableOpacity>

          <Text weight="700" size={13} style={styles.quantityText}>
            {quantity}
          </Text>

          <TouchableOpacity
            onPress={() => onUpdateQuantity(product.id, quantity + 1)}
            disabled={isMaxStock}
            style={[styles.stepperButton, isMaxStock && styles.stepperButtonDisabled]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="add"
              size={16}
              color={isMaxStock ? theme.colors.subtle : theme.colors.foreground}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
});
CartListItem.displayName = 'CartListItem';

export const CartScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { showSuccess, showError, showWarning } = useToast();

  const items = useCartItems();
  const summary = useCartSummary();
  const appliedCoupon = useCartAppliedCoupon();

  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const revalidateCart = useCartStore((s) => s.revalidateCartWithServer);

  const [couponInput, setCouponInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const res = updateQuantity(productId, quantity);
      if (res && res.message) {
        showWarning('Stock Limit', res.message);
      }
    },
    [updateQuantity, showWarning]
  );

  const handleApplyCoupon = useCallback(
    (codeToApply?: string) => {
      const code = (codeToApply || couponInput).trim();
      if (!code) {
        showWarning('Coupon Code Required', 'Please enter a valid coupon code.');
        return;
      }

      const res = applyCoupon(code);
      if (res.success) {
        showSuccess('Offer Applied! 🎉', res.message);
        setCouponInput('');
      } else {
        showError('Coupon Error', res.message);
      }
    },
    [couponInput, applyCoupon, showSuccess, showError, showWarning]
  );

  const handleRemoveCoupon = useCallback(() => {
    removeCoupon();
    showSuccess('Coupon Removed', 'Applied offer has been removed.');
  }, [removeCoupon, showSuccess]);

  const handleProceedToCheckout = async () => {
    setIsValidating(true);
    try {
      // Revalidate real-time prices & stock with backend before advancing
      const validation = await revalidateCart();

      if (!validation.isValid && validation.warnings.length > 0) {
        Alert.alert(
          'Cart Updated',
          validation.warnings.join('\n'),
          [
            { text: 'Review Cart', style: 'cancel' },
            {
              text: 'Proceed Anyway',
              onPress: () => navigation.navigate('Checkout' as never),
            },
          ]
        );
      } else {
        navigation.navigate('Checkout' as never);
      }
    } catch {
      navigation.navigate('Checkout' as never);
    } finally {
      setIsValidating(false);
    }
  };

  const renderCartItem: ListRenderItem<CartItem> = useCallback(
    ({ item }) => (
      <CartListItem cartItem={item} onUpdateQuantity={handleUpdateQuantity} />
    ),
    [handleUpdateQuantity]
  );

  const cartKeyExtractor = useCallback((item: CartItem) => item.product.id, []);

  const cartGetItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CART_ITEM_HEIGHT,
      offset: CART_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Delivery Progress Calculation
  const progressRatio = Math.min(1, summary.itemSubtotal / summary.freeDeliveryThreshold);

  const listHeader = (
    <View style={styles.headerSection}>
      {/* Free Delivery Goal Tracker */}
      <Card
        variant="sunken"
        style={[
          styles.freeDeliveryCard,
          summary.isFreeDelivery && { backgroundColor: theme.colors.successSoft },
        ]}
        padding="sm"
      >
        <View style={styles.deliveryProgressRow}>
          <Ionicons
            name={summary.isFreeDelivery ? 'checkmark-circle' : 'bicycle-outline'}
            size={22}
            color={summary.isFreeDelivery ? theme.colors.success : theme.colors.primary}
          />
          <View style={styles.deliveryProgressDetails}>
            <Text weight="700" size={13} color={summary.isFreeDelivery ? theme.colors.success : theme.colors.foreground}>
              {summary.isFreeDelivery
                ? '🎉 You unlocked FREE 10-Minute Delivery!'
                : `Add ${formatNPR(summary.remainingForFreeDelivery)} more for FREE Delivery`}
            </Text>
            {/* Progress Track */}
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: summary.isFreeDelivery ? theme.colors.success : theme.colors.primary,
                    width: `${progressRatio * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </Card>
    </View>
  );

  const listFooter = (
    <View style={styles.footerContainer}>
      {/* Offers & Promo Codes Section */}
      <Card style={styles.promoCard} padding="md">
        <View style={styles.promoHeaderRow}>
          <Ionicons name="pricetag-outline" size={18} color={theme.colors.secondary} />
          <Heading level={4} style={styles.promoTitle}>
            Coupons & Offers
          </Heading>
        </View>

        {appliedCoupon ? (
          <View style={[styles.appliedCouponBox, { backgroundColor: theme.colors.secondarySoft }]}>
            <View style={styles.appliedCouponInfo}>
              <Badge label={appliedCoupon.code} variant="accent" size="sm" />
              <Text weight="700" size={13} color={theme.colors.secondary} style={styles.appliedCodeText}>
                {appliedCoupon.title} (Saved {formatNPR(summary.couponDiscount)})
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponBtn}>
              <Caption color={theme.colors.error} bold>
                Remove
              </Caption>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.couponInputRow}>
              <TextInput
                style={[
                  styles.couponInput,
                  {
                    backgroundColor: theme.colors.surfaceSunken,
                    borderColor: theme.colors.border,
                    color: theme.colors.foreground,
                  },
                ]}
                placeholder="Enter promo code (e.g. MOJJO50)"
                placeholderTextColor={theme.colors.subtle}
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
              />
              <Button
                title="Apply"
                size="sm"
                variant="secondary"
                onPress={() => handleApplyCoupon()}
                style={styles.applyButton}
              />
            </View>

            {/* Quick Available Promo Chips */}
            <View style={styles.quickOffersRow}>
              {PROMOTIONAL_OFFERS.map((offer) => (
                <TouchableOpacity
                  key={offer.code}
                  onPress={() => handleApplyCoupon(offer.code)}
                  style={[styles.offerChip, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                >
                  <Text size={11} weight="700" color={theme.colors.secondary}>
                    {offer.code}
                  </Text>
                  <Caption size={10} color={theme.colors.muted}>
                    {offer.title}
                  </Caption>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </Card>

      {/* Transparent Bill Details Breakdown Card */}
      <Card style={styles.billCard} padding="md">
        <Heading level={4} style={styles.billTitle}>
          Bill Summary
        </Heading>

        {/* Item Total (MRP) */}
        <View style={styles.billRow}>
          <Text color={theme.colors.muted}>Item Total (MRP)</Text>
          <PriceText amount={summary.mrpSubtotal} size="sm" />
        </View>

        {/* Product Discounts */}
        {summary.itemDiscountTotal > 0 ? (
          <View style={styles.billRow}>
            <Text color={theme.colors.success}>Product Savings</Text>
            <Text weight="700" size={13} color={theme.colors.success}>
              - {formatNPR(summary.itemDiscountTotal)}
            </Text>
          </View>
        ) : null}

        {/* Coupon Discount */}
        {summary.couponDiscount > 0 ? (
          <View style={styles.billRow}>
            <Text color={theme.colors.success}>Coupon Savings ({summary.couponCode})</Text>
            <Text weight="700" size={13} color={theme.colors.success}>
              - {formatNPR(summary.couponDiscount)}
            </Text>
          </View>
        ) : null}

        {/* Delivery Fee */}
        <View style={styles.billRow}>
          <View style={styles.deliveryLabelRow}>
            <Text color={theme.colors.muted}>10-Min Delivery Fee</Text>
            {summary.isFreeDelivery && (
              <Badge label="FREE" variant="success" size="sm" style={styles.freeBadge} />
            )}
          </View>
          {summary.isFreeDelivery ? (
            <Text weight="700" size={13} color={theme.colors.success}>
              FREE
            </Text>
          ) : (
            <PriceText amount={summary.deliveryFee} size="sm" />
          )}
        </View>

        {/* Taxes & Handling */}
        <View style={styles.billRow}>
          <Text color={theme.colors.muted}>Taxes & Handling</Text>
          <Text size={12} color={theme.colors.muted}>
            Included in MRP
          </Text>
        </View>

        <View style={[styles.billDivider, { backgroundColor: theme.colors.border }]} />

        {/* Final Total */}
        <View style={styles.billTotalRow}>
          <View>
            <Heading level={3}>To Pay</Heading>
            <Caption color={theme.colors.muted}>Inclusive of all taxes</Caption>
          </View>
          <PriceText amount={summary.totalAmount} size="lg" />
        </View>
      </Card>

      {/* Total Savings Celebration Card */}
      {summary.totalSavings > 0 ? (
        <Card
          variant="elevated"
          style={[styles.savingsCard, { backgroundColor: theme.colors.successSoft }]}
          padding="sm"
        >
          <View style={styles.savingsRow}>
            <Ionicons name="sparkles" size={20} color={theme.colors.success} />
            <Text weight="700" size={13} color={theme.colors.success} style={styles.savingsText}>
              🎉 You're saving {formatNPR(summary.totalSavings)} on this order!
            </Text>
          </View>
        </Card>
      ) : null}

      {/* Checkout Button */}
      <Button
        title={isValidating ? 'Validating Live Prices...' : `Proceed to Checkout • ${formatNPR(summary.totalAmount)}`}
        variant="secondary"
        size="lg"
        fullWidth
        loading={isValidating}
        onPress={handleProceedToCheckout}
        style={styles.checkoutButton}
      />
    </View>
  );

  if (items.length === 0) {
    return (
      <ScreenWrapper headerComponent={<Header title="Your Basket" />}>
        <EmptyState
          icon="cart-outline"
          title="Your basket is empty"
          description="Add fresh groceries, snacks, cold beverages, and items to get ultra-fast 10-min delivery."
          actionTitle="Explore Catalog"
          onAction={() => {
            navigation.navigate('MainTabs' as never, { screen: 'HomeTab' } as never);
          }}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      headerComponent={
        <Header
          title="Your Basket"
          subtitle={`${summary.totalItemCount} ${summary.totalItemCount === 1 ? 'item' : 'items'}`}
          rightAction={
            <TouchableOpacity onPress={clearCart}>
              <Caption color={theme.colors.error} bold>
                Clear All
              </Caption>
            </TouchableOpacity>
          }
        />
      }
      style={styles.container}
    >
      <OfflineBanner />
      <FlatList
        data={items}
        keyExtractor={cartKeyExtractor}
        renderItem={renderCartItem}
        getItemLayout={cartGetItemLayout}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  listContent: {
    paddingVertical: 8,
  },
  headerSection: {
    marginBottom: 8,
  },
  freeDeliveryCard: {
    borderRadius: 12,
  },
  deliveryProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryProgressDetails: {
    marginLeft: 10,
    flex: 1,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  itemCard: {
    marginBottom: 8,
    borderRadius: 14,
    minHeight: 88,
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    marginRight: 10,
  },
  productThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
  },
  unitText: {
    marginTop: 1,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  mrpText: {
    marginLeft: 2,
  },
  saveBadge: {
    marginLeft: 4,
  },
  stockWarning: {
    marginTop: 4,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepperButton: {
    padding: 4,
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  quantityText: {
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  footerContainer: {
    marginTop: 8,
  },
  promoCard: {
    marginBottom: 14,
    borderRadius: 16,
  },
  promoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  promoTitle: {
    marginLeft: 8,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  applyButton: {
    height: 42,
    minWidth: 72,
  },
  appliedCouponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  appliedCodeText: {
    flex: 1,
  },
  removeCouponBtn: {
    paddingHorizontal: 8,
  },
  quickOffersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  offerChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  billCard: {
    marginBottom: 14,
    borderRadius: 16,
  },
  billTitle: {
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeBadge: {
    marginLeft: 4,
  },
  billDivider: {
    height: 1,
    marginVertical: 10,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  savingsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsText: {
    marginLeft: 8,
  },
  checkoutButton: {
    marginBottom: 24,
  },
});
