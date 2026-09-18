import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption, PriceText } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { useTheme } from '../../theme';
import {
  useCartStore,
  useCartItems,
  useCartSummary,
  useCartAppliedCoupon,
} from '../../store/cartStore';
import { useSelectedAddress } from '../../store/addressStore';
import { Ionicons } from '@expo/vector-icons';
import { formatNPR } from '../../utils/currency';
import { useNavigation } from '@react-navigation/native';
import { CartItem } from '../../types/cart';
import { Product } from '../../types/product';
import { useToast } from '../../components/feedback/ToastContext';
import { PROMOTIONAL_OFFERS } from '../../api/services/cartApi';
import { UNIFIED_MOCK_PRODUCTS } from '../../data/mockProducts';
import { HapticsService } from '../../services/haptics';

// Delivery Instructions Options
const DELIVERY_INSTRUCTIONS = [
  { id: 'dont-ring', label: "Don't ring bell", icon: 'notifications-off-outline' as const },
  { id: 'leave-door', label: 'Leave at door', icon: 'home-outline' as const },
  { id: 'call-arrival', label: 'Call upon arrival', icon: 'call-outline' as const },
  { id: 'avoid-contact', label: 'Avoid contact', icon: 'shield-checkmark-outline' as const },
];

// Rider Tip Options
const RIDER_TIP_OPTIONS = [0, 20, 30, 50, 100];

/**
 * Memoized Cart List Item Component
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
          <Caption color={theme.colors.muted} style={styles.unitText} numberOfLines={1}>
            {product.unit} {product.brand ? `• ${product.brand}` : ''}
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

/**
 * Quick Add Recommendation Card (Impulse Add-ons)
 */
const QuickAddCard = memo<{
  product: Product;
  onAdd: (product: Product) => void;
}>(({ product, onAdd }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.quickAddCard,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.quickAddImageWrap}>
        <OptimizedImage
          uri={product.thumbnailUrl || (product.images && product.images[0])}
          width={60}
          height={60}
          style={styles.quickAddImage}
          fallbackIcon="cube-outline"
        />
      </View>
      <View style={styles.quickAddInfo}>
        <Text weight="600" size={12} numberOfLines={1} style={styles.quickAddTitle}>
          {product.name}
        </Text>
        <Caption size={10} color={theme.colors.muted} numberOfLines={1}>
          {product.unit}
        </Caption>
        <View style={styles.quickAddFooter}>
          <PriceText amount={product.price} size="sm" />
          <TouchableOpacity
            onPress={() => onAdd(product)}
            style={[styles.quickAddBtn, { backgroundColor: theme.colors.secondarySoft, borderColor: theme.colors.secondary }]}
            activeOpacity={0.7}
          >
            <Text weight="800" size={11} color={theme.colors.secondary}>
              + Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
QuickAddCard.displayName = 'QuickAddCard';

export const CartScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const items = useCartItems();
  const summary = useCartSummary();
  const appliedCoupon = useCartAppliedCoupon();
  const selectedAddress = useSelectedAddress();

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const revalidateCart = useCartStore((s) => s.revalidateCartWithServer);

  const [couponInput, setCouponInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>(null);

  // Address text
  const addressLabel = selectedAddress
    ? `${selectedAddress.area}, ${selectedAddress.city}`
    : 'Jhamsikhel, Lalitpur';

  // Cross-sell recommendations (snacks, cold drinks, essentials) not currently in cart
  const quickAddRecommendations = useMemo(() => {
    const itemIds = new Set(items.map((i) => i.product.id));
    return UNIFIED_MOCK_PRODUCTS.filter(
      (p) => !itemIds.has(p.id) && (p.categoryId === 'snacks' || p.categoryId === 'cold-drinks')
    ).slice(0, 8);
  }, [items]);

  // Trending recommendations for Empty State
  const emptyStateRecommendations = useMemo(() => {
    return UNIFIED_MOCK_PRODUCTS.filter((p) => p.isFlashDeal || (p.ratingsAverage || 0) >= 4.7).slice(0, 6);
  }, []);

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const res = updateQuantity(productId, quantity);
      if (res && res.message) {
        showWarning('Stock Limit', res.message);
      }
    },
    [updateQuantity, showWarning]
  );

  const handleQuickAdd = useCallback(
    (product: Product) => {
      HapticsService.selection();
      addItem(product, 1);
      showSuccess('Added to Basket', `${product.name} added`);
    },
    [addItem, showSuccess]
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

  const handleTipSelect = (tipAmount: number) => {
    HapticsService.selection();
    setSelectedTip((prev) => (prev === tipAmount ? 0 : tipAmount));
  };

  const handleInstructionToggle = (instructionId: string) => {
    HapticsService.selection();
    setSelectedInstruction((prev) => (prev === instructionId ? null : instructionId));
  };

  const handleClearCart = () => {
    HapticsService.warning();
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to clear your entire basket?') : true;
      if (confirmed) {
        clearCart();
        showInfo('Basket Cleared', 'All items have been removed.');
      }
      return;
    }

    Alert.alert(
      'Clear Basket',
      'Are you sure you want to remove all items from your basket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearCart();
            showInfo('Basket Cleared', 'All items have been removed.');
          },
        },
      ]
    );
  };

  // Grand Total calculation with rider tip
  const finalPayAmount = summary.totalAmount + selectedTip;

  const handleProceedToCheckout = async () => {
    setIsValidating(true);
    try {
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

  // Delivery Progress Calculation
  const progressRatio = Math.min(1, summary.itemSubtotal / (summary.freeDeliveryThreshold || 1));

  // Top Delivery Location Bar + Free Delivery Tracker
  const listHeader = (
    <View style={styles.headerSection}>
      {/* 1. Top Delivery Location & Instant ETA Card */}
      <View
        style={[
          styles.locationBanner,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.locationIconWrap}>
          <Ionicons name="flash" size={16} color={theme.colors.secondary} />
        </View>
        <View style={styles.locationDetails}>
          <View style={styles.locationTitleRow}>
            <Text weight="800" size={13} color={theme.colors.foreground} numberOfLines={1}>
              10-Min Delivery to {addressLabel}
            </Text>
          </View>
          <Caption color={theme.colors.muted} numberOfLines={1}>
            Dark Store Express • Thermal sealed bag
          </Caption>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('SavedAddresses')}
          style={[styles.changeAddrBtn, { backgroundColor: theme.colors.surfaceSunken }]}
          activeOpacity={0.7}
        >
          <Text weight="700" size={11} color={theme.colors.secondary}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Free Delivery Goal Tracker */}
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

  // Footer: Impulse carousel, delivery instructions, rider tip, coupons, bill summary
  const listFooter = (
    <View style={styles.footerContainer}>
      {/* 1. Before You Checkout (Quick-Add Addons Carousel) */}
      {quickAddRecommendations.length > 0 && (
        <View style={styles.quickAddSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Heading level={4}>Before You Checkout</Heading>
              <Caption color={theme.colors.muted}>Popular snacks & cold mixers</Caption>
            </View>
            <Ionicons name="sparkles" size={16} color="#f59e0b" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickAddScroll}
          >
            {quickAddRecommendations.map((product) => (
              <QuickAddCard
                key={product.id}
                product={product}
                onAdd={handleQuickAdd}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* 2. Delivery Instructions */}
      <Card style={styles.instructionCard} padding="md">
        <View style={styles.cardHeaderRow}>
          <Ionicons name="hand-left-outline" size={18} color={theme.colors.secondary} />
          <Heading level={4} style={styles.cardHeaderTitle}>
            Delivery Instructions
          </Heading>
        </View>

        <View style={styles.instructionsGrid}>
          {DELIVERY_INSTRUCTIONS.map((inst) => {
            const isSelected = selectedInstruction === inst.id;
            return (
              <TouchableOpacity
                key={inst.id}
                onPress={() => handleInstructionToggle(inst.id)}
                style={[
                  styles.instructionPill,
                  {
                    backgroundColor: isSelected ? theme.colors.secondarySoft : theme.colors.surfaceSunken,
                    borderColor: isSelected ? theme.colors.secondary : theme.colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={inst.icon}
                  size={14}
                  color={isSelected ? theme.colors.secondary : theme.colors.muted}
                />
                <Text
                  weight={isSelected ? '700' : '600'}
                  size={11}
                  color={isSelected ? theme.colors.secondary : theme.colors.foreground}
                >
                  {inst.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* 3. Delivery Partner Tip */}
      <Card style={styles.tipCard} padding="md">
        <View style={styles.cardHeaderRow}>
          <Ionicons name="heart-outline" size={18} color={theme.colors.secondary} />
          <Heading level={4} style={styles.cardHeaderTitle}>
            Tip Delivery Partner
          </Heading>
        </View>
        <Caption color={theme.colors.muted} style={styles.tipSubtitle}>
          100% of your tip goes directly to your Kathmandu delivery rider.
        </Caption>

        <View style={styles.tipOptionsRow}>
          {RIDER_TIP_OPTIONS.map((tip) => {
            const isSelected = selectedTip === tip;
            return (
              <TouchableOpacity
                key={tip}
                onPress={() => handleTipSelect(tip)}
                style={[
                  styles.tipPill,
                  {
                    backgroundColor: isSelected ? theme.colors.secondary : theme.colors.surfaceSunken,
                    borderColor: isSelected ? theme.colors.secondary : theme.colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  weight="800"
                  size={12}
                  color={isSelected ? '#FFFFFF' : theme.colors.foreground}
                >
                  {tip === 0 ? 'No Tip' : `रू ${tip}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* 4. Offers & Promo Codes Section */}
      <Card style={styles.promoCard} padding="md">
        <View style={styles.cardHeaderRow}>
          <Ionicons name="pricetag-outline" size={18} color={theme.colors.secondary} />
          <Heading level={4} style={styles.cardHeaderTitle}>
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

      {/* 5. Transparent Bill Details Breakdown Card */}
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

        {/* Rider Tip */}
        {selectedTip > 0 ? (
          <View style={styles.billRow}>
            <Text color={theme.colors.muted}>Delivery Partner Tip</Text>
            <PriceText amount={selectedTip} size="sm" />
          </View>
        ) : null}

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
          <PriceText amount={finalPayAmount} size="lg" />
        </View>
      </Card>

      {/* 6. Total Savings Celebration Card */}
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

      {/* 7. Cancellation Guarantee */}
      <View
        style={[
          styles.guaranteeCard,
          {
            backgroundColor: theme.colors.surfaceSunken,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons name="shield-checkmark" size={18} color={theme.colors.secondary} />
        <View style={styles.guaranteeTextCol}>
          <Text weight="700" size={12} color={theme.colors.foreground}>
            100% Replacement & Refund Guarantee
          </Text>
          <Caption color={theme.colors.muted}>
            Free cancellation within 1 min of order before dispatch. 100% genuine products.
          </Caption>
        </View>
      </View>
    </View>
  );

  // Sticky Floating Bottom Checkout Bar (Dock)
  const stickyBottomCheckoutBar = (
    <View
      style={[
        styles.stickyDock,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.dockLeft}>
        <View style={styles.dockPriceRow}>
          <PriceText amount={finalPayAmount} size="lg" />
          {summary.totalSavings > 0 && (
            <Badge label={`SAVED ${formatNPR(summary.totalSavings)}`} variant="success" size="sm" style={styles.dockSavedBadge} />
          )}
        </View>
        <Caption color={theme.colors.muted} numberOfLines={1}>
          {summary.totalItemCount} {summary.totalItemCount === 1 ? 'item' : 'items'} • To {addressLabel}
        </Caption>
      </View>

      <TouchableOpacity
        onPress={handleProceedToCheckout}
        disabled={isValidating}
        style={[
          styles.dockButton,
          { backgroundColor: theme.colors.secondary },
          isValidating && { opacity: 0.7 },
        ]}
        activeOpacity={0.85}
      >
        <Text weight="800" size={14} color="#FFFFFF">
          {isValidating ? 'Validating...' : 'Proceed ➔'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // -------------------------------------------------------------
  // EMPTY BASKET STATE WITH RECOMMENDATIONS
  // -------------------------------------------------------------
  if (items.length === 0) {
    return (
      <ScreenWrapper
        scrollable
        headerComponent={<Header title="Your Basket" />}
        contentContainerStyle={styles.emptyContainer}
      >
        <View style={styles.emptyHero}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.secondarySoft }]}>
            <Ionicons name="bag-handle-outline" size={48} color={theme.colors.secondary} />
          </View>
          <Heading level={2} style={styles.emptyTitle}>
            Your basket is empty
          </Heading>
          <Caption color={theme.colors.muted} align="center" style={styles.emptySubtitle}>
            Fill your basket with drinks, snacks, mixers, or cigarettes to get ultra-fast 10-min delivery.
          </Caption>

          <Button
            title="Explore Catalog"
            variant="secondary"
            size="md"
            onPress={() => {
              navigation.navigate('MainTabs', { screen: 'HomeTab' });
            }}
            style={styles.emptyExploreBtn}
          />
        </View>

        {/* Popular Essentials in Kathmandu */}
        <View style={styles.emptyRecsSection}>
          <View style={styles.sectionHeaderRow}>
            <Heading level={4}>Popular in Kathmandu</Heading>
            <Caption color={theme.colors.secondary} bold>
              Hot Deals
            </Caption>
          </View>

          <View style={styles.emptyRecsGrid}>
            {emptyStateRecommendations.map((product) => (
              <View
                key={product.id}
                style={[
                  styles.emptyRecCard,
                  {
                    backgroundColor: theme.colors.surfaceRaised,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.emptyRecImageWrap}>
                  <OptimizedImage
                    uri={product.thumbnailUrl || (product.images && product.images[0])}
                    width={80}
                    height={80}
                    style={styles.emptyRecImage}
                    fallbackIcon="cube-outline"
                  />
                </View>
                <View style={styles.emptyRecInfo}>
                  <Text weight="600" size={12} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Caption size={10} color={theme.colors.muted} numberOfLines={1}>
                    {product.unit}
                  </Caption>
                  <View style={styles.emptyRecFooter}>
                    <PriceText amount={product.price} size="sm" />
                    <TouchableOpacity
                      onPress={() => handleQuickAdd(product)}
                      style={[styles.quickAddBtn, { backgroundColor: theme.colors.secondarySoft, borderColor: theme.colors.secondary }]}
                    >
                      <Text weight="800" size={11} color={theme.colors.secondary}>
                        + Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE BASKET VIEW
  // -------------------------------------------------------------
  return (
    <ScreenWrapper
      headerComponent={
        <Header
          title="Your Basket"
          subtitle={`${summary.totalItemCount} ${summary.totalItemCount === 1 ? 'item' : 'items'}`}
          rightAction={
            <TouchableOpacity onPress={handleClearCart}>
              <Caption color={theme.colors.error} bold>
                Clear All
              </Caption>
            </TouchableOpacity>
          }
        />
      }
      footerComponent={stickyBottomCheckoutBar}
      style={styles.container}
    >
      <OfflineBanner />
      <FlatList
        data={items}
        keyExtractor={cartKeyExtractor}
        renderItem={renderCartItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 10,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  locationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locationDetails: {
    flex: 1,
    minWidth: 0,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeAddrBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 6,
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
    marginRight: 8,
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
  quickAddSection: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  quickAddScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  quickAddCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
  },
  quickAddImageWrap: {
    width: '100%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 6,
  },
  quickAddImage: {
    width: 60,
    height: 60,
  },
  quickAddInfo: {
    gap: 2,
  },
  quickAddTitle: {
    lineHeight: 15,
  },
  quickAddFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  quickAddBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderTitle: {
    marginLeft: 8,
  },
  instructionCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  instructionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  tipCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  tipSubtitle: {
    marginBottom: 10,
    marginTop: -4,
  },
  tipOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  promoCard: {
    marginBottom: 12,
    borderRadius: 16,
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
    marginBottom: 12,
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
    marginBottom: 12,
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
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  guaranteeTextCol: {
    flex: 1,
    gap: 2,
  },
  stickyDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  dockLeft: {
    flex: 1,
    marginRight: 12,
  },
  dockPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dockSavedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  dockButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 32,
  },
  emptyHero: {
    alignItems: 'center',
    marginVertical: 20,
    maxWidth: 320,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 6,
  },
  emptySubtitle: {
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyExploreBtn: {
    minWidth: 160,
  },
  emptyRecsSection: {
    width: '100%',
    marginTop: 16,
  },
  emptyRecsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: 8,
  },
  emptyRecCard: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
  },
  emptyRecImageWrap: {
    width: '100%',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyRecImage: {
    width: '100%',
    height: '100%',
  },
  emptyRecInfo: {
    gap: 2,
  },
  emptyRecFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});
