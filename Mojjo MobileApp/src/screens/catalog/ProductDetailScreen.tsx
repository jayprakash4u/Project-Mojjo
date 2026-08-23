import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption, PriceText } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { useTheme } from '../../theme';
import { useCartStore, useCartItemQuantity } from '../../store/cartStore';
import { formatNPR } from '../../utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../components/feedback/ToastContext';
import { Product } from '../../types/product';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const DEFAULT_PRODUCT: Product = {
  id: 'p_detail_1',
  categoryId: '3',
  name: 'Real Mixed Fruit Juice (100% Natural)',
  slug: 'real-mixed-fruit-juice',
  description:
    'Real Mixed Fruit Juice brings together the goodness of 9 delicious fruits in every sip. Made from pure fruit concentrates, rich in Vitamin C, and free from added preservatives.',
  brand: 'Real',
  unit: '1 Litre',
  price: 240,
  originalPrice: 280,
  stockQuantity: 25,
  isAvailable: true,
  isFlashDeal: true,
  images: ['https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600'],
  thumbnailUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600',
  tags: ['Juice', 'Beverages', 'Breakfast', 'Vitamin C'],
  ratingsAverage: 4.8,
  ratingsCount: 142,
};

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { showSuccess } = useToast();

  const product: Product =
    route.params && 'product' in route.params ? route.params.product : DEFAULT_PRODUCT;

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const quantity = useCartItemQuantity(product.id);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = useCallback(() => {
    addItem(product, 1);
    showSuccess('Added to Basket', `${product.name} added`);
  }, [addItem, product, showSuccess]);

  const handleUpdateQuantity = useCallback(
    (qty: number) => {
      updateQuantity(product.id, qty);
    },
    [updateQuantity, product.id]
  );

  return (
    <ScreenWrapper
      headerComponent={
        <Header
          showBack
          onBack={() => navigation.goBack()}
          showCart
          onCartPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
        />
      }
      scrollable
      contentContainerStyle={styles.scrollContent}
    >
      <OfflineBanner />

      {/* Product Image Section */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border },
        ]}
      >
        <OptimizedImage
          uri={product.thumbnailUrl || (product.images && product.images[0])}
          height={240}
          style={styles.heroImage}
          fallbackIcon="cube-outline"
        />
        {discountPercent > 0 ? (
          <Badge
            label={`${discountPercent}% OFF`}
            variant="accent"
            size="md"
            style={styles.discountBadge}
          />
        ) : null}

        {product.isFlashDeal ? (
          <Badge
            label="⚡ 10 MINS DELIVERY"
            variant="secondary"
            size="sm"
            style={styles.deliveryBadge}
          />
        ) : null}
      </View>

      {/* Product Information */}
      <View style={styles.infoSection}>
        {product.brand ? (
          <Caption color={theme.colors.secondary} bold style={styles.brandText}>
            {product.brand.toUpperCase()}
          </Caption>
        ) : null}

        <Heading level={2} style={styles.productTitle}>
          {product.name}
        </Heading>

        <View style={styles.unitRow}>
          <Badge label={product.unit} variant="outline" size="sm" />
          {product.ratingsAverage ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={theme.colors.accent} />
              <Text weight="700" size={13} style={styles.ratingText}>
                {product.ratingsAverage}
              </Text>
              <Caption color={theme.colors.subtle}>({product.ratingsCount})</Caption>
            </View>
          ) : null}
        </View>

        <View style={styles.pricingContainer}>
          <PriceText amount={product.price} originalAmount={product.originalPrice} size="lg" />
          {discountPercent > 0 ? (
            <Text weight="600" size={13} color={theme.colors.success} style={styles.savingsText}>
              Save {formatNPR(product.originalPrice! - product.price)}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Product Description */}
      <Card style={styles.detailsCard} padding="md">
        <Heading level={4} style={styles.sectionHeader}>
          Product Description
        </Heading>
        <Text color={theme.colors.muted} style={styles.descriptionText}>
          {product.description ||
            'Freshly sourced quality product delivered directly to your doorstep in 10 minutes with temperature-controlled handling.'}
        </Text>
      </Card>

      {/* Highlights / Delivery Promise */}
      <Card style={styles.highlightsCard} padding="md">
        <View style={styles.highlightItem}>
          <Ionicons name="flash-outline" size={20} color={theme.colors.secondary} />
          <View style={styles.highlightText}>
            <Text weight="700" size={13}>
              Ultra-Fast 10-Minute Delivery
            </Text>
            <Caption color={theme.colors.muted}>Packed fresh from nearest Mojjo Dark Store</Caption>
          </View>
        </View>

        <View style={[styles.highlightDivider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.highlightItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.success} />
          <View style={styles.highlightText}>
            <Text weight="700" size={13}>
              100% Quality Guaranteed
            </Text>
            <Caption color={theme.colors.muted}>Instant replacement or refund if unsatisfied</Caption>
          </View>
        </View>
      </Card>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderTopColor: theme.colors.border,
            ...theme.shadows.lg,
          },
        ]}
      >
        <View style={styles.bottomPriceCol}>
          <Caption color={theme.colors.muted}>Total Price</Caption>
          <PriceText
            amount={quantity > 0 ? product.price * quantity : product.price}
            size="md"
          />
        </View>

        {quantity === 0 ? (
          <Button
            title="+ Add to Basket"
            variant="secondary"
            size="lg"
            onPress={handleAddToCart}
            style={styles.addCtaButton}
          />
        ) : (
          <View
            style={[
              styles.quantityStepper,
              {
                backgroundColor: theme.colors.surfaceSunken,
                borderColor: theme.colors.secondary,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => updateQuantity(product.id, quantity - 1)}
              style={styles.stepperBtn}
            >
              <Ionicons
                name={quantity === 1 ? 'trash-outline' : 'remove'}
                size={18}
                color={quantity === 1 ? theme.colors.error : theme.colors.foreground}
              />
            </TouchableOpacity>

            <Text weight="700" size={16} style={styles.stepperNumber}>
              {quantity}
            </Text>

            <TouchableOpacity
              onPress={() => updateQuantity(product.id, quantity + 1)}
              style={styles.stepperBtn}
            >
              <Ionicons name="add" size={18} color={theme.colors.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  infoSection: {
    marginBottom: 16,
  },
  brandText: {
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  productTitle: {
    marginBottom: 10,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  ratingText: {
    marginHorizontal: 4,
  },
  pricingContainer: {
    marginTop: 4,
  },
  savingsText: {
    marginTop: 4,
  },
  detailsCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  descriptionText: {
    lineHeight: 22,
  },
  highlightsCard: {
    marginBottom: 24,
    borderRadius: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  highlightText: {
    marginLeft: 12,
  },
  highlightDivider: {
    height: 1,
    marginVertical: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    marginTop: 10,
    borderRadius: 16,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  addCtaButton: {
    minWidth: 180,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 140,
    justifyContent: 'space-between',
  },
  stepperBtn: {
    padding: 6,
  },
  stepperNumber: {
    marginHorizontal: 12,
  },
});
