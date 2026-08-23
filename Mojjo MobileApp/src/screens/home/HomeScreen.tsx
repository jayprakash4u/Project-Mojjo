import React, { useCallback, useMemo, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Heading, Text, Caption, PriceText } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useSelectedAddress } from '../../store/addressStore';
import { Product } from '../../types/product';
import { useToast } from '../../components/feedback/ToastContext';
import { useWishlistStore } from '../../store/wishlistStore';
import { useProductStore } from '../../store/productStore';
import { HapticsService } from '../../services/haptics';

interface CategoryItemData {
  id: string;
  name: string;
  tagline: string;
  image: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

// Exactly matching the 4 canonical categories on Mojjo Frontend with HD Photography
const MOCK_CATEGORIES: CategoryItemData[] = [
  {
    id: 'alcohol',
    name: 'Alcohol',
    tagline: 'Whisky, wine, beer & spirits',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500',
    icon: 'beer-outline',
    color: '#7C3AED',
  },
  {
    id: 'cigarettes',
    name: 'Cigarettes',
    tagline: 'Familiar brands, delivered',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',
    icon: 'flame-outline',
    color: '#4B5563',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    tagline: 'Chips, nuts & quick bites',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
    icon: 'fast-food-outline',
    color: '#B93B3B',
  },
  {
    id: 'cold-drinks',
    name: 'Cold Drinks',
    tagline: 'Soft drinks, water & mixers',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
    icon: 'wine-outline',
    color: '#0F766E',
  },
];

const DEAL_CARD_WIDTH = 156;
const DEAL_CARD_GAP = 10;

/**
 * Category Card with Full Photographic Image matching Mojjo Frontend Category Showcase
 */
const CategoryShowcaseCard = memo<{
  category: CategoryItemData;
  onPress: (id: string) => void;
}>(({ category, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(category.id)}
      activeOpacity={0.85}
      style={[
        styles.categoryCard,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.categoryImageWrapper}>
        <OptimizedImage
          uri={category.image}
          width="100%"
          height="100%"
          resizeMode="cover"
          style={styles.categoryImage}
          fallbackIcon={category.icon}
        />
        <View style={styles.categoryBadgeOverlay}>
          <View style={[styles.categoryIconPill, { backgroundColor: category.color }]}>
            <Ionicons name={category.icon} size={13} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={styles.categoryContent}>
        <Text weight="800" size={14} numberOfLines={1} style={styles.categoryName}>
          {category.name}
        </Text>
        <Caption size={11} color={theme.colors.muted} numberOfLines={1}>
          {category.tagline}
        </Caption>
      </View>
    </TouchableOpacity>
  );
});
CategoryShowcaseCard.displayName = 'CategoryShowcaseCard';

/**
 * Product Card Component with Photographic HD Image & Wishlist Heart Button
 */
const ProductShowcaseCard = memo<{
  product: Product;
  onPress: (product: Product) => void;
  onAdd: (product: Product) => void;
}>(({ product, onPress, onAdd }) => {
  const { theme } = useTheme();
  const { showSuccess, showInfo } = useToast();
  const isWishlisted = useWishlistStore((s) => s.items.some((i) => i.id === product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

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

  return (
    <Card
      variant="elevated"
      style={styles.dealCard}
      padding="sm"
      onPress={() => onPress(product)}
    >
      <View style={styles.dealImageContainer}>
        <OptimizedImage
          uri={product.thumbnailUrl || (product.images && product.images[0])}
          width={140}
          height={110}
          style={styles.productImage}
          fallbackIcon="cube-outline"
        />

        {/* Heart Wishlist Button */}
        <TouchableOpacity
          onPress={handleHeartPress}
          style={styles.heartButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={isWishlisted ? '#B93B3B' : '#5D6A73'}
          />
        </TouchableOpacity>

        {discountPercent ? (
          <Badge
            label={`${discountPercent}% OFF`}
            variant="accent"
            size="sm"
            style={styles.dealDiscountBadge}
          />
        ) : null}

        {product.rewardCoins ? (
          <View style={styles.rewardBadgeOverlay}>
            <Text weight="800" size={10} color="#C08B32">
              🪙 +{product.rewardCoins}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.dealContent}>
        <Text weight="700" size={13} numberOfLines={1} style={styles.dealTitle}>
          {product.name}
        </Text>
        <Caption size={11} color={theme.colors.muted} numberOfLines={1}>
          {product.unit}
        </Caption>

        <View style={styles.dealFooter}>
          <PriceText
            amount={product.price}
            originalAmount={product.originalPrice}
            size="sm"
          />
          <Button
            title="+ Add"
            size="sm"
            variant="secondary"
            onPress={() => onAdd(product)}
            style={styles.dealAddButton}
          />
        </View>
      </View>
    </Card>
  );
});
ProductShowcaseCard.displayName = 'ProductShowcaseCard';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { showSuccess } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const selectedAddress = useSelectedAddress();
  const products = useProductStore((s) => s.products);

  const dealsOfTheDay = useMemo(() => products.filter((p) => p.isFlashDeal), [products]);
  const popularNow = useMemo(() => products.filter((p) => (p.ratingsAverage || 0) >= 4.4), [products]);
  const alcoholProducts = useMemo(() => products.filter((p) => p.categoryId === 'alcohol'), [products]);
  const snacksProducts = useMemo(() => products.filter((p) => p.categoryId === 'snacks'), [products]);
  const coldDrinksProducts = useMemo(() => products.filter((p) => p.categoryId === 'cold-drinks'), [products]);

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      navigation.navigate('MainTabs', {
        screen: 'CategoriesTab',
        params: { initialCategoryId: categoryId },
      });
    },
    [navigation]
  );

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { product });
    },
    [navigation]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addItem(product, 1);
      showSuccess('Added to Basket', `${product.name} added`);
    },
    [addItem, showSuccess]
  );

  const renderProductItem: ListRenderItem<Product> = useCallback(
    ({ item }) => (
      <ProductShowcaseCard
        product={item}
        onPress={handleProductPress}
        onAdd={handleAddToCart}
      />
    ),
    [handleProductPress, handleAddToCart]
  );

  const dealKeyExtractor = useCallback((item: Product) => item.id, []);

  const dealGetItemLayout = useCallback(
    (_: any, index: number) => ({
      length: DEAL_CARD_WIDTH + DEAL_CARD_GAP,
      offset: (DEAL_CARD_WIDTH + DEAL_CARD_GAP) * index,
      index,
    }),
    []
  );

  const addressDisplay = selectedAddress
    ? `${selectedAddress.area}, ${selectedAddress.city}`
    : 'Jhamsikhel, Lalitpur';
  const etaDisplay = selectedAddress?.isServiceable
    ? `⚡ ${selectedAddress.etaMinutes || 45} MINS DELIVERY`
    : '⚠️ OUTSIDE DELIVERY ZONE';

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <OfflineBanner />

      {/* 1. Top Location & Delivery Bar */}
      <View style={styles.topBar}>
        <View style={styles.locationContainer}>
          <View style={styles.locationHeaderRow}>
            <Ionicons
              name={selectedAddress?.isServiceable ? 'flash' : 'location-outline'}
              size={16}
              color={selectedAddress?.isServiceable ? theme.colors.accent : theme.colors.warning}
            />
            <Text
              weight="800"
              size={12}
              color={selectedAddress?.isServiceable ? theme.colors.accent : theme.colors.warning}
              style={styles.etaText}
            >
              {etaDisplay}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addressRow}
            onPress={() => navigation.navigate('SavedAddresses')}
            activeOpacity={0.7}
          >
            <Heading level={4} numberOfLines={1} style={styles.addressText}>
              {addressDisplay}
            </Heading>
            <Ionicons name="chevron-down" size={16} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileTab')}
          style={[styles.profileButton, { backgroundColor: theme.colors.surfaceRaised }]}
        >
          <Ionicons name="person-circle-outline" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 2. Quick Search Bar */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Search')}
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons name="search" size={20} color={theme.colors.secondary} />
        <Text style={[styles.searchPlaceholder, { color: theme.colors.subtle }]}>
          Search "whisky, wine, beer, cigarettes, snacks, cold drinks..."
        </Text>
      </TouchableOpacity>

      {/* 3. Hero Marketplace Banner directly matching Mojjo Frontend */}
      <Card
        variant="elevated"
        style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}
        padding="md"
      >
        <View style={styles.heroBadgeRow}>
          <Badge label="⚡ UNDER AN HOUR" variant="accent" size="sm" />
          <Caption color={theme.colors.onPrimaryMuted}>Kathmandu Tonight</Caption>
        </View>

        <Heading level={2} color={theme.colors.onPrimary} style={styles.heroTitle}>
          The good stuff, at your door in under an hour.
        </Heading>
        <Text size={13} color={theme.colors.onPrimaryMuted} style={styles.heroSubtitle}>
          Whisky, wine and beer alongside cigarettes, snacks and cold drinks. One order, one delivery.
        </Text>

        {/* Value Prop Highlights matching Website promises */}
        <View style={styles.heroPromisesRow}>
          <View style={styles.heroPromiseItem}>
            <Ionicons name="flash" size={14} color={theme.colors.accent} />
            <Text size={11} weight="600" color={theme.colors.onPrimary}>
              45-Min Delivery
            </Text>
          </View>
          <View style={styles.heroPromiseItem}>
            <Ionicons name="car" size={14} color={theme.colors.accent} />
            <Text size={11} weight="600" color={theme.colors.onPrimary}>
              Free over रू 2,000
            </Text>
          </View>
          <View style={styles.heroPromiseItem}>
            <Ionicons name="shield-checkmark" size={14} color={theme.colors.accent} />
            <Text size={11} weight="600" color={theme.colors.onPrimary}>
              Licensed Stores Only
            </Text>
          </View>
        </View>
      </Card>

      {/* 4. Deals of the Day (DealBand) */}
      <View style={styles.sectionHeader}>
        <View>
          <View style={styles.sectionTitleRow}>
            <Heading level={3}>Deals of the Day</Heading>
            <Badge label="⏳ Midnight" variant="error" size="sm" style={styles.headerBadge} />
          </View>
          <Caption color={theme.colors.muted}>Reduced until midnight, while stock lasts.</Caption>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Caption color={theme.colors.secondary} bold>
            See All Offers
          </Caption>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={dealsOfTheDay}
        keyExtractor={dealKeyExtractor}
        renderItem={renderProductItem}
        getItemLayout={dealGetItemLayout}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      />

      {/* 5. 4 Canonical Categories with Photographic Tiles (CategoryShowcase) */}
      <View style={[styles.sectionHeader, styles.sectionTopMargin]}>
        <Heading level={3}>Shop by Category</Heading>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'CategoriesTab' })}>
          <Caption color={theme.colors.secondary} bold>
            All Categories
          </Caption>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryGrid}>
        {MOCK_CATEGORIES.map((cat) => (
          <CategoryShowcaseCard
            key={cat.id}
            category={cat}
            onPress={handleCategoryPress}
          />
        ))}
      </View>

      {/* 6. Popular Now Showcase */}
      <View style={[styles.sectionHeader, styles.sectionTopMargin]}>
        <View>
          <Heading level={3}>Popular Now</Heading>
          <Caption color={theme.colors.muted}>What people in your area are ordering tonight</Caption>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Caption color={theme.colors.secondary} bold>
            Browse
          </Caption>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={popularNow}
        keyExtractor={dealKeyExtractor}
        renderItem={renderProductItem}
        getItemLayout={dealGetItemLayout}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      />

      {/* 7. Hard Drinks & Liquors Showcase (Alcohol) */}
      <View style={[styles.sectionHeader, styles.sectionTopMargin]}>
        <View>
          <Heading level={3}>Hard Drinks & Liquors</Heading>
          <Caption color={theme.colors.muted}>Single malts, reserve wines, craft beer & spirits</Caption>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'CategoriesTab',
              params: { initialCategoryId: 'alcohol' },
            })
          }
        >
          <Caption color={theme.colors.secondary} bold>
            All Alcohol
          </Caption>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={alcoholProducts}
        keyExtractor={dealKeyExtractor}
        renderItem={renderProductItem}
        getItemLayout={dealGetItemLayout}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      />

      {/* 8. Snacks Showcase */}
      <View style={[styles.sectionHeader, styles.sectionTopMargin]}>
        <View>
          <Heading level={3}>Snacks</Heading>
          <Caption color={theme.colors.muted}>Crisps, roasted nuts, chocolate and quick bites</Caption>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'CategoriesTab',
              params: { initialCategoryId: 'snacks' },
            })
          }
        >
          <Caption color={theme.colors.secondary} bold>
            All Snacks
          </Caption>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={snacksProducts}
        keyExtractor={dealKeyExtractor}
        renderItem={renderProductItem}
        getItemLayout={dealGetItemLayout}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      />

      {/* 9. Cold Drinks Showcase */}
      <View style={[styles.sectionHeader, styles.sectionTopMargin]}>
        <View>
          <Heading level={3}>Drinks & Mixers</Heading>
          <Caption color={theme.colors.muted}>Chilled colas, sparkling water, energy drinks & tonic</Caption>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'CategoriesTab',
              params: { initialCategoryId: 'cold-drinks' },
            })
          }
        >
          <Caption color={theme.colors.secondary} bold>
            All Cold Drinks
          </Caption>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={coldDrinksProducts}
        keyExtractor={dealKeyExtractor}
        renderItem={renderProductItem}
        getItemLayout={dealGetItemLayout}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      />

      {/* 10. Why Mojjo Trust Section directly from Mojjo Frontend */}
      <Card style={styles.whyMojjoCard} padding="md">
        <Heading level={4} style={styles.whyMojjoTitle}>
          Why Mojjo?
        </Heading>
        <View style={styles.whyMojjoGrid}>
          <View style={styles.whyMojjoItem}>
            <View style={[styles.whyIconCircle, { backgroundColor: theme.colors.secondarySoft }]}>
              <Ionicons name="flash" size={18} color={theme.colors.secondary} />
            </View>
            <View style={styles.whyContent}>
              <Text weight="700" size={13}>Delivered in 45 minutes</Text>
              <Caption color={theme.colors.muted}>Dispatched from partner stores across Kathmandu.</Caption>
            </View>
          </View>

          <View style={styles.whyMojjoItem}>
            <View style={[styles.whyIconCircle, { backgroundColor: theme.colors.accentSoft }]}>
              <Ionicons name="snow" size={18} color={theme.colors.accent} />
            </View>
            <View style={styles.whyContent}>
              <Text weight="700" size={13}>Cold on arrival</Text>
              <Caption color={theme.colors.muted}>Thermal bags and ice packs for beers, wines and soft drinks.</Caption>
            </View>
          </View>

          <View style={styles.whyMojjoItem}>
            <View style={[styles.whyIconCircle, { backgroundColor: theme.colors.successSoft }]}>
              <Ionicons name="shield-checkmark" size={18} color={theme.colors.success} />
            </View>
            <View style={styles.whyContent}>
              <Text weight="700" size={13}>Licensed stores only</Text>
              <Caption color={theme.colors.muted}>Every bottle and pack comes from verified retailers.</Caption>
            </View>
          </View>
        </View>
      </Card>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    paddingHorizontal: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  locationContainer: {
    flex: 1,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  etaText: {
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    marginRight: 4,
  },
  profileButton: {
    padding: 2,
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 10,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 13,
  },
  heroCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroTitle: {
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    marginBottom: 12,
    lineHeight: 18,
  },
  heroPromisesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 10,
  },
  heroPromiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTopMargin: {
    marginTop: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBadge: {
    marginLeft: 4,
  },
  horizontalListContent: {
    paddingVertical: 4,
    gap: DEAL_CARD_GAP,
  },
  dealCard: {
    width: DEAL_CARD_WIDTH,
    borderRadius: 16,
  },
  dealImageContainer: {
    width: '100%',
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  dealDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  rewardBadgeOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dealContent: {
    gap: 2,
  },
  dealTitle: {
    marginTop: 2,
  },
  dealFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dealAddButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  categoryCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryImageWrapper: {
    width: '100%',
    height: 100,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  categoryIconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    padding: 10,
  },
  categoryName: {
    marginBottom: 2,
  },
  whyMojjoCard: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 18,
  },
  whyMojjoTitle: {
    marginBottom: 14,
  },
  whyMojjoGrid: {
    gap: 12,
  },
  whyMojjoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  whyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyContent: {
    flex: 1,
  },
});
