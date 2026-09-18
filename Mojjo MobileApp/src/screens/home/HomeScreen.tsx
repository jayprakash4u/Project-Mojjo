import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Animated,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
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

interface QuickSubcategoryShortcut {
  id: string;
  categoryId: string;
  subcategorySlug: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Popular alcohol subcategories, surfaced as extra quick-tabs alongside the
// top-level categories so users can jump straight to e.g. Beer without
// drilling through Alcohol first. Slugs must match UNIFIED_CATEGORIES in
// CategoriesScreen.tsx.
const QUICK_SUBCATEGORY_SHORTCUTS: QuickSubcategoryShortcut[] = [
  { id: 'beer', categoryId: 'alcohol', subcategorySlug: 'beer', name: 'Beer', icon: 'beer' },
  { id: 'whisky', categoryId: 'alcohol', subcategorySlug: 'whisky', name: 'Whiskey', icon: 'flame' },
  { id: 'wine', categoryId: 'alcohol', subcategorySlug: 'wine', name: 'Wine', icon: 'wine-outline' },
  { id: 'vodka', categoryId: 'alcohol', subcategorySlug: 'vodka', name: 'Vodka', icon: 'water-outline' },
];

interface PromoBannerData {
  id: string;
  badge?: string;
  badgeVariant?: 'accent' | 'secondary' | 'success';
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  background?: 'primary' | 'secondary' | 'primaryLight';
  // When set, this slide renders as ONE full-bleed pre-designed graphic
  // (text baked into the image itself) instead of the code-rendered
  // badge/title/subtitle + bleeding-photo layout the fallback slides use.
  fullImage?: ReturnType<typeof require>;
}

// Swipeable promo carousel — 4 pre-designed graphics (text baked in).
const PROMO_BANNERS: PromoBannerData[] = [
  { id: 'liquor-express', fullImage: require('../../../assets/banners/one.png') },
  { id: 'snacks-cold-drinks', fullImage: require('../../../assets/banners/two.png') },
  { id: 'premium-liquor-collection', fullImage: require('../../../assets/banners/three.png') },
  { id: 'fast-delivery', fullImage: require('../../../assets/banners/four.png') },
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
        <Text weight="600" size={13} numberOfLines={2} style={styles.dealTitle}>
          {product.name}
        </Text>
        <Caption size={11} color={theme.colors.muted} numberOfLines={1}>
          {product.unit}
        </Caption>

        <View style={styles.dealFooter}>
          <PriceText
            amount={product.price}
            originalAmount={product.originalPrice}
            size="md"
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

  // Rotating search placeholder — cycles through one category name at a time.
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholderFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(placeholderFade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setPlaceholderIndex((i) => (i + 1) % MOCK_CATEGORIES.length);
        Animated.timing(placeholderFade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [placeholderFade]);

  // Promo banner carousel
  const [bannerWidth, setBannerWidth] = useState(
    () => Dimensions.get('window').width - 24
  );
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);

  const handleBannerLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setBannerWidth(w);
  }, []);

  // Driven by onScroll (not onMomentumScrollEnd) — react-native-web doesn't
  // reliably fire momentum-end on non-touch (wheel/trackpad) scrolling, so
  // the dots would get stuck. Live onScroll works consistently everywhere.
  const handleBannerScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!bannerWidth) return;
      const idx = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
      setBannerIndex(Math.max(0, Math.min(idx, PROMO_BANNERS.length - 1)));
    },
    [bannerWidth]
  );

  // Jump to a slide directly — used by the dots, arrow buttons, and
  // auto-rotate. A mouse click-drag doesn't scroll RN Web's ScrollView the
  // way a real touch swipe does, so these give desktop users a way to
  // change slides too.
  const goToBanner = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, PROMO_BANNERS.length - 1));
      bannerScrollRef.current?.scrollTo({ x: clamped * bannerWidth, animated: true });
      setBannerIndex(clamped);
    },
    [bannerWidth]
  );

  // Auto-rotate every 4s, looping back to the first slide.
  useEffect(() => {
    if (!bannerWidth) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % PROMO_BANNERS.length;
        bannerScrollRef.current?.scrollTo({ x: next * bannerWidth, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerWidth]);

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

  const handleSubcategoryPress = useCallback(
    (categoryId: string, subcategorySlug: string) => {
      navigation.navigate('MainTabs', {
        screen: 'CategoriesTab',
        params: { initialCategoryId: categoryId, initialSubcategorySlug: subcategorySlug },
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

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <OfflineBanner />

      {/* 1. Top Location Bar */}
      <View style={styles.topBar}>
        <View style={styles.locationContainer}>
          <TouchableOpacity
            style={styles.addressRow}
            onPress={() => navigation.navigate('SavedAddresses')}
            activeOpacity={0.7}
          >
            <Ionicons name="location-sharp" size={15} color={theme.colors.foreground} />
            <Text
              weight="700"
              size={14}
              numberOfLines={1}
              style={styles.addressText}
            >
              {addressDisplay}
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Quick Search Bar */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Search')}
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.secondary,
          },
          theme.shadows.xs,
        ]}
      >
        <Ionicons name="search" size={18} color={theme.colors.muted} />
        <View style={styles.searchPlaceholderClip}>
          <Animated.Text
            numberOfLines={1}
            style={[
              styles.searchPlaceholder,
              { color: theme.colors.subtle, opacity: placeholderFade },
            ]}
          >
            {MOCK_CATEGORIES[placeholderIndex].name}
          </Animated.Text>
        </View>
        <View style={[styles.searchGoButton, { backgroundColor: theme.colors.secondary }]}>
          <Text weight="700" size={13} color={theme.colors.onSecondary}>
            Search
          </Text>
        </View>
      </TouchableOpacity>

      {/* 2b. Quick Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabsRow}
      >
        <View style={styles.categoryTabItem}>
          <View style={[styles.categoryTabIconBox, { backgroundColor: theme.colors.secondarySoft }]}>
            <Ionicons name="flash-outline" size={16} color={theme.colors.foreground} />
          </View>
          <Text weight="700" size={10} color={theme.colors.foreground} numberOfLines={1}>
            All
          </Text>
          <View style={[styles.categoryTabIndicator, { backgroundColor: theme.colors.secondary }]} />
        </View>

        {MOCK_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryTabItem}
            onPress={() => handleCategoryPress(cat.id)}
            activeOpacity={0.7}
          >
            <Ionicons name={cat.icon} size={20} color={theme.colors.foreground} style={styles.categoryTabIconBare} />
            <Text weight="600" size={10} color={theme.colors.muted} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}

        {QUICK_SUBCATEGORY_SHORTCUTS.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            style={styles.categoryTabItem}
            onPress={() => handleSubcategoryPress(sub.categoryId, sub.subcategorySlug)}
            activeOpacity={0.7}
          >
            <Ionicons name={sub.icon} size={20} color={theme.colors.foreground} style={styles.categoryTabIconBare} />
            <Text weight="600" size={10} color={theme.colors.muted} numberOfLines={1}>
              {sub.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.categoryTabsDivider, { backgroundColor: theme.colors.border }]} />

      {/* 3. Promo Banner Carousel */}
      <View onLayout={handleBannerLayout} style={styles.bannerWrapper}>
        <View style={styles.bannerScrollArea}>
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleBannerScroll}
          scrollEventThrottle={16}
        >
          {PROMO_BANNERS.map((banner) =>
            banner.fullImage ? (
              // Pre-designed graphic — text is already baked into the image.
              <View key={banner.id} style={[styles.bannerSlide, { width: bannerWidth }]}>
                <Image
                  source={banner.fullImage}
                  style={styles.bannerFullImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View
                key={banner.id}
                style={[
                  styles.bannerSlide,
                  { width: bannerWidth, backgroundColor: theme.colors[banner.background || 'primary'] },
                ]}
              >
                <View style={styles.bannerTextCol}>
                  <View style={styles.heroBadgeRow}>
                    <Badge label={banner.badge || ''} variant={banner.badgeVariant || 'secondary'} size="sm" />
                    <Caption color={theme.colors.onPrimaryMuted} numberOfLines={1}>
                      {banner.eyebrow}
                    </Caption>
                  </View>

                  <Heading
                    level={3}
                    color={theme.colors.onPrimary}
                    numberOfLines={3}
                    style={styles.heroTitle}
                  >
                    {banner.title}
                  </Heading>
                  <Text
                    size={12}
                    color={theme.colors.onPrimaryMuted}
                    numberOfLines={2}
                    style={styles.heroSubtitle}
                  >
                    {banner.subtitle}
                  </Text>
                </View>

                <View style={styles.bannerImageWrap}>
                  <OptimizedImage
                    uri={banner.image}
                    width="100%"
                    height="100%"
                    resizeMode="cover"
                  />
                  <View style={styles.bannerImageScrim} />
                </View>
              </View>
            )
          )}
        </ScrollView>

        {/* Arrow buttons — only show on wide desktop viewports where mouse drag is needed */}
        {bannerWidth > 540 && bannerIndex > 0 && (
          <TouchableOpacity
            onPress={() => goToBanner(bannerIndex - 1)}
            style={[styles.bannerArrowBtn, styles.bannerArrowLeft]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {bannerWidth > 540 && bannerIndex < PROMO_BANNERS.length - 1 && (
          <TouchableOpacity
            onPress={() => goToBanner(bannerIndex + 1)}
            style={[styles.bannerArrowBtn, styles.bannerArrowRight]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        </View>

        {/* Pagination Dots */}
        <View style={styles.bannerDotsRow}>
          {PROMO_BANNERS.map((banner, idx) => (
            <TouchableOpacity
              key={banner.id}
              onPress={() => goToBanner(idx)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              style={[
                styles.bannerDot,
                {
                  width: idx === bannerIndex ? 18 : 6,
                  backgroundColor:
                    idx === bannerIndex ? theme.colors.secondary : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* 4. Deals of the Day (DealBand) */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleCol}>
          <View style={styles.sectionTitleRow}>
            <Heading level={3}>Deals of the Day</Heading>
            <Badge label="⏳ Midnight" variant="error" size="sm" style={styles.headerBadge} />
          </View>
          <Caption color={theme.colors.muted} numberOfLines={1}>Reduced until midnight, while stock lasts.</Caption>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.sectionActionBtn}>
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
        <View style={styles.sectionTitleCol}>
          <Heading level={3}>Shop by Category</Heading>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'CategoriesTab' })}
          style={styles.sectionActionBtn}
        >
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
        <View style={styles.sectionTitleCol}>
          <Heading level={3}>Popular Now</Heading>
          <Caption color={theme.colors.muted} numberOfLines={1}>What people in your area are ordering tonight</Caption>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.sectionActionBtn}>
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
        <View style={styles.sectionTitleCol}>
          <Heading level={3}>Hard Drinks & Liquors</Heading>
          <Caption color={theme.colors.muted} numberOfLines={1}>Single malts, reserve wines, craft beer & spirits</Caption>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'CategoriesTab',
              params: { initialCategoryId: 'alcohol' },
            })
          }
          style={styles.sectionActionBtn}
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
        <View style={styles.sectionTitleCol}>
          <Heading level={3}>Snacks</Heading>
          <Caption color={theme.colors.muted} numberOfLines={1}>Crisps, roasted nuts, chocolate and quick bites</Caption>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'CategoriesTab',
              params: { initialCategoryId: 'snacks' },
            })
          }
          style={styles.sectionActionBtn}
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
        <View style={styles.sectionTitleCol}>
          <Heading level={3}>Drinks & Mixers</Heading>
          <Caption color={theme.colors.muted} numberOfLines={1}>Chilled colas, sparkling water, energy drinks & tonic</Caption>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MainTabs', {
              screen: 'CategoriesTab',
              params: { initialCategoryId: 'cold-drinks' },
            })
          }
          style={styles.sectionActionBtn}
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
    paddingVertical: 6,
  },
  locationContainer: {
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    marginRight: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 3,
    borderRadius: 22,
    borderWidth: 1.5,
    marginVertical: 8,
  },
  searchPlaceholderClip: {
    flex: 1,
    marginLeft: 8,
  },
  searchPlaceholder: {
    fontSize: 13,
  },
  searchGoButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  categoryTabsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 4,
  },
  categoryTabItem: {
    alignItems: 'center',
    minWidth: 52,
    paddingHorizontal: 2,
  },
  categoryTabIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  categoryTabIconBare: {
    marginBottom: 2,
  },
  categoryTabIndicator: {
    height: 2,
    width: 20,
    borderRadius: 1,
    marginTop: 2,
  },
  categoryTabsDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -12,
    marginBottom: 6,
  },
  bannerWrapper: {
    marginBottom: 16,
  },
  bannerScrollArea: {
    position: 'relative',
  },
  bannerSlide: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 160,
    aspectRatio: 2.1,
  },
  bannerFullImage: {
    width: '100%',
    height: '100%',
  },
  bannerTextCol: {
    flex: 1,
    padding: 16,
    paddingRight: 8,
    justifyContent: 'center',
  },
  bannerImageWrap: {
    width: '38%',
  },
  bannerImageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  bannerDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  bannerDot: {
    height: 6,
    borderRadius: 3,
  },
  bannerArrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bannerArrowLeft: {
    left: 8,
  },
  bannerArrowRight: {
    right: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroTitle: {
    marginBottom: 6,
    lineHeight: 24,
  },
  heroSubtitle: {
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  sectionTopMargin: {
    marginTop: 20,
  },
  sectionTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sectionActionBtn: {
    flexShrink: 0,
    paddingLeft: 4,
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
    minHeight: 34,
    lineHeight: 17,
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
});
