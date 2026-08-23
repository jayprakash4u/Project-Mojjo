import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, Caption, PriceText } from '../common/Typography';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { OptimizedImage } from '../common/OptimizedImage';
import { useTheme } from '../../theme';
import { useWishlistStore } from '../../store/wishlistStore';
import { useToast } from '../feedback/ToastContext';
import { Product, ProductUnit } from '../../types/product';
import { Ionicons } from '@expo/vector-icons';
import { HapticsService } from '../../services/haptics';

interface UniversalProductCardProps {
  product: Product;
  variant?: 'grid' | 'horizontal';
  onPress: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, unit?: ProductUnit) => void;
  onOpenUnitModal?: (product: Product) => void;
}

export const UniversalProductCard: React.FC<UniversalProductCardProps> = memo(
  ({ product, variant = 'grid', onPress, onAddToCart, onOpenUnitModal }) => {
    const { theme } = useTheme();
    const { showSuccess, showInfo } = useToast();
    const isWishlisted = useWishlistStore((s) => s.items.some((i) => i.id === product.id));
    const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

    const discountPercent =
      product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : null;

    const pieceUnit = product.units?.find(
      (u) => u.id === 'piece' || u.id === 'single' || u.id === '1-stick' || u.contains === 1
    );

    const handleHeartPress = (e: any) => {
      e.stopPropagation?.();
      HapticsService.selection();
      const added = toggleWishlist(product);
      if (added) {
        showSuccess('Saved to Wishlist ❤️', product.name);
      } else {
        showInfo('Removed from Wishlist', product.name);
      }
    };

    // -------------------------------------------------------------
    // 1. GRID VARIANT: 2 CARDS PER ROW (Polished & Pro-Grade)
    // -------------------------------------------------------------
    if (variant === 'grid') {
      return (
        <Card
          variant="outlined"
          style={[
            styles.gridCard,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.border,
            },
          ]}
          padding="none"
          onPress={() => onPress(product)}
        >
          {/* Top Image Showcase Vessel */}
          <View style={styles.gridImageVessel}>
            <OptimizedImage
              uri={product.thumbnailUrl || (product.images && product.images[0])}
              width="100%"
              height="100%"
              resizeMode="contain"
              style={styles.gridImg}
              fallbackIcon="cube-outline"
            />

            {/* Discount Badge */}
            {discountPercent ? (
              <Badge
                label={`${discountPercent}% OFF`}
                variant="accent"
                size="sm"
                style={styles.gridDiscountBadge}
              />
            ) : null}

            {/* Wishlist Floating Button */}
            <TouchableOpacity
              onPress={handleHeartPress}
              style={styles.gridHeartBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={16}
                color={isWishlisted ? '#f43f5e' : '#64748b'}
              />
            </TouchableOpacity>
          </View>

          {/* Product Body Information */}
          <View style={styles.gridInfoBox}>
            <View style={styles.gridMetaRow}>
              <Caption size={10} color={theme.colors.muted} numberOfLines={1} style={styles.gridMetaText}>
                {product.unit} • {product.brand || 'Mojjo'}
              </Caption>
            </View>

            <Text
              weight="800"
              size={12}
              color={theme.colors.foreground}
              numberOfLines={2}
              style={styles.gridTitleText}
            >
              {product.name}
            </Text>

            {/* Cigarette Per-Piece Interactive Chip */}
            {pieceUnit && onOpenUnitModal ? (
              <TouchableOpacity
                onPress={() => onOpenUnitModal(product)}
                style={[
                  styles.gridPieceChip,
                  { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={10} color="#f59e0b" />
                <Text size={9} weight="800" color={theme.colors.secondary}>
                  Per stick रू {pieceUnit.price} ➔
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Footer: Price & Add Action */}
            <View style={styles.gridFooter}>
              <View style={styles.gridPriceStack}>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <Caption color={theme.colors.muted} style={styles.strikethroughText}>
                    रू {product.originalPrice}
                  </Caption>
                ) : null}
                <PriceText amount={product.price} size="sm" />
              </View>

              <Button
                title={pieceUnit && onOpenUnitModal ? 'Unit ▾' : '+ Add'}
                variant={pieceUnit && onOpenUnitModal ? 'outline' : 'secondary'}
                size="sm"
                onPress={() => {
                  if (pieceUnit && onOpenUnitModal) {
                    onOpenUnitModal(product);
                  } else {
                    onAddToCart(product);
                  }
                }}
                style={styles.gridActionBtn}
              />
            </View>
          </View>
        </Card>
      );
    }

    // -------------------------------------------------------------
    // 2. HORIZONTAL VARIANT: Full Width List Card (Search, Cart)
    // -------------------------------------------------------------
    return (
      <Card
        variant="outlined"
        style={[
          styles.horizontalCard,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderColor: theme.colors.border,
          },
        ]}
        padding="sm"
        onPress={() => onPress(product)}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.thumbnailWrapper}>
            <OptimizedImage
              uri={product.thumbnailUrl || (product.images && product.images[0])}
              width="100%"
              height="100%"
              resizeMode="contain"
              style={styles.thumbnail}
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

            <TouchableOpacity
              onPress={handleHeartPress}
              style={styles.heartBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={15}
                color={isWishlisted ? '#f43f5e' : theme.colors.muted}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.productDetails}>
            <Text
              weight="800"
              size={13}
              color={theme.colors.foreground}
              numberOfLines={2}
              style={styles.productTitle}
            >
              {product.name}
            </Text>
            <Caption size={11} color={theme.colors.muted} numberOfLines={1}>
              {product.unit} • {product.brand || 'Mojjo'}
            </Caption>

            {pieceUnit && onOpenUnitModal ? (
              <TouchableOpacity
                onPress={() => onOpenUnitModal(product)}
                style={[
                  styles.pieceChip,
                  { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border },
                ]}
                activeOpacity={0.8}
              >
                <Text size={10} weight="800" color={theme.colors.secondary}>
                  Per piece रू {pieceUnit.price} ➔
                </Text>
              </TouchableOpacity>
            ) : null}

            {product.rewardCoins ? (
              <View style={styles.coinPill}>
                <Text size={10} weight="700" color="#C08B32">
                  🪙 +{product.rewardCoins} coins
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.cardFooterRow}>
          <PriceText
            amount={product.price}
            originalAmount={product.originalPrice}
            size="sm"
          />

          <Button
            title={pieceUnit && onOpenUnitModal ? 'Select Unit' : '+ Add'}
            variant={pieceUnit && onOpenUnitModal ? 'outline' : 'secondary'}
            size="sm"
            onPress={() => {
              if (pieceUnit && onOpenUnitModal) {
                onOpenUnitModal(product);
              } else {
                onAddToCart(product);
              }
            }}
            style={styles.addButton}
          />
        </View>
      </Card>
    );
  }
);
UniversalProductCard.displayName = 'UniversalProductCard';

const styles = StyleSheet.create({
  // 2-Column Grid Card Styles
  gridCard: {
    flex: 1,
    margin: 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  gridImageVessel: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 6,
  },
  gridImg: {
    width: '100%',
    height: '100%',
  },
  gridDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  gridHeartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  gridInfoBox: {
    padding: 8,
    gap: 3,
  },
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridMetaText: {
    fontSize: 10,
  },
  gridTitleText: {
    lineHeight: 16,
    minHeight: 32,
  },
  gridPieceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridPriceStack: {
    gap: 1,
  },
  gridActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 28,
  },
  strikethroughText: {
    textDecorationLine: 'line-through',
    fontSize: 9,
  },

  // Horizontal Card Styles
  horizontalCard: {
    marginBottom: 10,
    borderRadius: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
  },
  thumbnailWrapper: {
    width: 76,
    height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
  },
  heartBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    padding: 3,
  },
  productDetails: {
    flex: 1,
    marginLeft: 10,
    gap: 2,
  },
  productTitle: {
    lineHeight: 16,
  },
  pieceChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2,
  },
  coinPill: {
    alignSelf: 'flex-start',
    marginTop: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  addButton: {
    paddingHorizontal: 12,
  },
});
