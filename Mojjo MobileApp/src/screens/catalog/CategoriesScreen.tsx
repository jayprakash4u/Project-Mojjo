import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { AppModal } from '../../components/common/AppModal';
import { Heading, Text } from '../../components/common/Typography';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { useTheme } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../components/feedback/ToastContext';
import { Product, ProductUnit } from '../../types/product';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HapticsService } from '../../services/haptics';
import { UNIFIED_MOCK_PRODUCTS } from '../../data/mockProducts';
import { BuyPerPieceModal } from '../../components/product/BuyPerPieceModal';
import { UniversalProductCard } from '../../components/product/UniversalProductCard';

export interface SubcategoryItem {
  name: string;
  slug: string;
  icon: keyof typeof Ionicons.glyphMap;
  image?: string;
}

export interface MobileCategory {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  tagline: string;
  image: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subcategories: SubcategoryItem[];
}

export const UNIFIED_CATEGORIES: MobileCategory[] = [
  {
    id: 'alcohol',
    name: 'Hard Drinks & Liquors',
    shortName: 'Alcohol',
    slug: 'alcohol',
    tagline: 'Whisky, wine, beer & spirits',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=300',
    icon: 'beer-outline',
    color: '#7C3AED',
    subcategories: [
      {
        name: 'All Liquors',
        slug: 'all',
        icon: 'wine',
        image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200',
      },
      {
        name: 'Whiskey',
        slug: 'whisky',
        icon: 'flame',
        image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200',
      },
      {
        name: 'Beer',
        slug: 'beer',
        icon: 'beer',
        image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200',
      },
      {
        name: 'Vodka',
        slug: 'vodka',
        icon: 'water-outline',
        image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=200',
      },
      {
        name: 'Gin',
        slug: 'gin',
        icon: 'leaf-outline',
        image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=200',
      },
      {
        name: 'Rum',
        slug: 'rum',
        icon: 'sparkles-outline',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200',
      },
      {
        name: 'Wine',
        slug: 'wine',
        icon: 'wine-outline',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200',
      },
      {
        name: 'Tequila',
        slug: 'tequila',
        icon: 'sunny-outline',
        image: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=200',
      },

      // --- PARENT BRANDS ---
      {
        name: 'Old Durbar',
        slug: 'old-durbar',
        icon: 'flame',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200',
      },
      {
        name: 'Signature',
        slug: 'signature',
        icon: 'brush-outline',
        image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200',
      },
      {
        name: 'Gorkha',
        slug: 'gorkha',
        icon: 'beer',
        image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200',
      },
      {
        name: 'Nepal Ice',
        slug: 'nepal-ice',
        icon: 'snow-outline',
        image: 'https://images.unsplash.com/photo-1618886614638-80e3c15cd819?w=200',
      },
      {
        name: 'Arna',
        slug: 'arna',
        icon: 'leaf-outline',
        image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200',
      },
      {
        name: 'Barahsinghe',
        slug: 'barahsinghe',
        icon: 'shield-outline',
        image: 'https://images.unsplash.com/photo-1618886614638-80e3c15cd819?w=200',
      },
      {
        name: 'Tuborg',
        slug: 'tuborg',
        icon: 'beer-outline',
        image: 'https://images.unsplash.com/photo-1618886614638-80e3c15cd819?w=200',
      },
      {
        name: 'Carlsberg',
        slug: 'carlsberg',
        icon: 'trophy-outline',
        image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200',
      },
      {
        name: 'Budweiser',
        slug: 'budweiser',
        icon: 'ribbon-outline',
        image: 'https://images.unsplash.com/photo-1618886614638-80e3c15cd819?w=200',
      },
      {
        name: 'San Miguel',
        slug: 'san-miguel',
        icon: 'star-outline',
        image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200',
      },
      {
        name: 'Corona',
        slug: 'corona',
        icon: 'sunny-outline',
        image: 'https://images.unsplash.com/photo-1618886614638-80e3c15cd819?w=200',
      },
      {
        name: 'Golden Oak',
        slug: 'golden-oak',
        icon: 'shield-checkmark-outline',
        image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200',
      },
      {
        name: 'Black Oak',
        slug: 'black-oak',
        icon: 'shield-outline',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200',
      },
      {
        name: 'Kala Patthar',
        slug: 'kala-patthar',
        icon: 'triangle-outline',
        image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200',
      },
      {
        name: 'Gurkhas & Guns',
        slug: 'gurkha',
        icon: 'shield',
        image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200',
      },
      {
        name: 'Yarchagumba',
        slug: 'yarchagumba',
        icon: 'diamond',
        image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200',
      },
    ],
  },
  {
    id: 'cigarettes',
    name: 'Cigarettes & Tobacco',
    shortName: 'Cigarettes',
    slug: 'cigarettes',
    tagline: 'Familiar brands, delivered',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300',
    icon: 'flame-outline',
    color: '#4B5563',
    subcategories: [
      {
        name: 'All Tobacco',
        slug: 'all',
        icon: 'flame',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200',
      },
      {
        name: 'Marlboro',
        slug: 'marlboro',
        icon: 'disc-outline',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200',
      },
      {
        name: 'Surya',
        slug: 'surya',
        icon: 'flash-outline',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200',
      },
      {
        name: 'Shikhar',
        slug: 'shikhar',
        icon: 'snow-outline',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200',
      },
    ],
  },
  {
    id: 'snacks',
    name: 'Snacks & Munchies',
    shortName: 'Snacks',
    slug: 'snacks',
    tagline: 'Chips, nuts & quick bites',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300',
    icon: 'fast-food-outline',
    color: '#B93B3B',
    subcategories: [
      {
        name: 'All Snacks',
        slug: 'all',
        icon: 'fast-food',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200',
      },
      {
        name: 'Chips',
        slug: 'chips',
        icon: 'pizza-outline',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200',
      },
      {
        name: 'Nuts & Cashews',
        slug: 'nuts',
        icon: 'nutrition-outline',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200',
      },
      {
        name: 'Quick Bites',
        slug: 'bites',
        icon: 'restaurant-outline',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200',
      },
    ],
  },
  {
    id: 'cold-drinks',
    name: 'Drinks & Mixers',
    shortName: 'Cold Drinks',
    slug: 'cold-drinks',
    tagline: 'Soft drinks, water & mixers',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300',
    icon: 'wine-outline',
    color: '#0F766E',
    subcategories: [
      {
        name: 'All Drinks',
        slug: 'all',
        icon: 'water',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200',
      },
      {
        name: 'Energy Drinks',
        slug: 'energy',
        icon: 'flash',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200',
      },
      {
        name: 'Soft Drinks',
        slug: 'soda',
        icon: 'cube-outline',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200',
      },
    ],
  },
];

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'popular';
type PriceFilter = 'all' | 'under500' | '500to2000' | 'above2000';

export const CategoriesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { showSuccess } = useToast();
  const { items: cartItems, addItem } = useCartStore();

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const initialCatId = route.params?.initialCategoryId || 'alcohol';
  const [selectedCategory, setSelectedCategory] = useState<MobileCategory>(
    UNIFIED_CATEGORIES.find((c) => c.id === initialCatId) || UNIFIED_CATEGORIES[0]
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    route.params?.initialSubcategorySlug || 'all'
  );
  const [unitModalProduct, setUnitModalProduct] = useState<Product | null>(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);

  const isAnyFilterActive = sortBy !== 'default' || selectedBrand !== 'all' || priceFilter !== 'all';

  const resetAllFilters = () => {
    HapticsService.selection();
    setSortBy('default');
    setSelectedBrand('all');
    setPriceFilter('all');
  };

  const handleCategorySelect = (category: MobileCategory) => {
    HapticsService.selection();
    setSelectedCategory(category);
    setSelectedSubcategory('all');
    setSelectedBrand('all');
  };

  const handleSubcategorySelect = (subSlug: string) => {
    HapticsService.selection();
    setSelectedSubcategory(subSlug);
    setSelectedBrand('all');
  };

  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    UNIFIED_MOCK_PRODUCTS.filter((p) => p.categoryId === selectedCategory.id).forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [selectedCategory]);

  const currentProducts = useMemo(() => {
    let list = UNIFIED_MOCK_PRODUCTS.filter(
      (p) => p.categoryId === selectedCategory.id
    );

    if (selectedSubcategory !== 'all') {
      const cleanSub = selectedSubcategory.toLowerCase();
      const cleanSubWords = cleanSub.replace(/-/g, ' ');
      list = list.filter(
        (p) =>
          p.tags?.some((t) => t.toLowerCase().includes(cleanSub) || t.toLowerCase().includes(cleanSubWords)) ||
          p.slug?.toLowerCase().includes(cleanSub) ||
          p.name?.toLowerCase().includes(cleanSubWords) ||
          (p.brand && p.brand.toLowerCase().includes(cleanSubWords))
      );
    }

    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    if (priceFilter === 'under500') {
      list = list.filter((p) => p.price < 500);
    } else if (priceFilter === '500to2000') {
      list = list.filter((p) => p.price >= 500 && p.price <= 2000);
    } else if (priceFilter === 'above2000') {
      list = list.filter((p) => p.price > 2000);
    }

    if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      list = [...list].sort((a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0));
    }

    return list;
  }, [selectedCategory, selectedSubcategory, selectedBrand, priceFilter, sortBy]);

  const handleProductPress = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { product });
    },
    [navigation]
  );

  const handleAddToCart = useCallback(
    (product: Product, quantity: number = 1, unit?: ProductUnit) => {
      addItem(product, quantity);
      showSuccess('Added to Basket', `${product.name} added`);
    },
    [addItem, showSuccess]
  );

  const activeSubName =
    selectedCategory.subcategories.find((s) => s.slug === selectedSubcategory)?.name || 'All Items';

  return (
    <ScreenWrapper style={styles.container}>
      {/* 1. ULTRA-MODERN COMPACT COMMAND APP BAR */}
      <View
        style={[
          styles.commandHeader,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.circleActionBtn, { backgroundColor: theme.colors.surfaceSunken }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={[styles.circleActionBtn, { backgroundColor: theme.colors.surfaceSunken }]}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={18} color={theme.colors.foreground} />
          </TouchableOpacity>

          {totalCartCount > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={[styles.cartBadgePill, { backgroundColor: theme.colors.secondary }]}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={14} color="#FFFFFF" />
              <Text weight="900" size={12} color="#FFFFFF">
                {totalCartCount}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <OfflineBanner />

      {/* 2. MODERN HORIZONTAL CATEGORY SEGMENTED PILLS */}
      <View
        style={[
          styles.categorySegmentBar,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorySegmentScroll}
        >
          {UNIFIED_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategorySelect(cat)}
                style={[
                  styles.categorySegmentPill,
                  {
                    backgroundColor: isSelected ? theme.colors.secondary : theme.colors.surfaceSunken,
                    borderColor: isSelected ? theme.colors.secondary : theme.colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon}
                  size={15}
                  color={isSelected ? '#FFFFFF' : theme.colors.foreground}
                  style={styles.categorySegmentIcon}
                />
                <Text
                  weight="800"
                  size={12}
                  color={isSelected ? '#FFFFFF' : theme.colors.foreground}
                >
                  {cat.shortName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. SLEEK MICRO FILTER & SORT CHIP BAR */}
      <View
        style={[
          styles.microFilterBar,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.microFilterScroll}
        >
          <TouchableOpacity
            style={[
              styles.microChip,
              styles.filterIconChip,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setSortModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={14} color={theme.colors.foreground} />
            <Text weight="700" size={11} color={theme.colors.foreground}>
              Filters
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.microChip,
              {
                backgroundColor: sortBy !== 'default' ? theme.colors.secondarySoft : theme.colors.surfaceRaised,
                borderColor: sortBy !== 'default' ? theme.colors.secondary : theme.colors.border,
              },
            ]}
            onPress={() => setSortModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text weight="700" size={11} color={sortBy !== 'default' ? theme.colors.secondary : theme.colors.foreground}>
              {sortBy === 'price_asc'
                ? 'Price: Low ↑'
                : sortBy === 'price_desc'
                ? 'Price: High ↓'
                : sortBy === 'popular'
                ? 'Popular ★'
                : 'Sort by Price'}
            </Text>
            <Ionicons name="chevron-down" size={11} color={theme.colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.microChip,
              {
                backgroundColor: selectedBrand !== 'all' ? theme.colors.secondarySoft : theme.colors.surfaceRaised,
                borderColor: selectedBrand !== 'all' ? theme.colors.secondary : theme.colors.border,
              },
            ]}
            onPress={() => setBrandModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text weight="700" size={11} color={selectedBrand !== 'all' ? theme.colors.secondary : theme.colors.foreground}>
              {selectedBrand !== 'all' ? selectedBrand : 'Brand'}
            </Text>
            <Ionicons name="chevron-down" size={11} color={theme.colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.microChip,
              {
                backgroundColor: priceFilter !== 'all' ? theme.colors.secondarySoft : theme.colors.surfaceRaised,
                borderColor: priceFilter !== 'all' ? theme.colors.secondary : theme.colors.border,
              },
            ]}
            onPress={() => setPriceModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text weight="700" size={11} color={priceFilter !== 'all' ? theme.colors.secondary : theme.colors.foreground}>
              {priceFilter === 'under500'
                ? '< Rs 500'
                : priceFilter === '500to2000'
                ? 'Rs 500-2K'
                : priceFilter === 'above2000'
                ? '> Rs 2K'
                : 'Price'}
            </Text>
            <Ionicons name="chevron-down" size={11} color={theme.colors.muted} />
          </TouchableOpacity>

          {isAnyFilterActive && (
            <TouchableOpacity
              style={styles.clearFiltersChip}
              onPress={resetAllFilters}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={14} color="#f59e0b" />
              <Text weight="800" size={11} color="#f59e0b">
                Reset
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* 4. MAIN SPLIT: Left Visual Rail + Right Products */}
      <View style={styles.mainLayout}>
        {/* Left Visual Subcategory Rail */}
        <View
          style={[
            styles.leftRail,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderRightColor: theme.colors.border,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.leftRailScroll}
          >
            {selectedCategory.subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub.slug;
              return (
                <TouchableOpacity
                  key={sub.slug}
                  onPress={() => handleSubcategorySelect(sub.slug)}
                  style={styles.railItem}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <View style={[styles.railIndicator, { backgroundColor: theme.colors.secondary }]} />
                  )}
                  <OptimizedImage
                    uri={sub.image || 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200'}
                    width={52}
                    height={52}
                    resizeMode="cover"
                    fallbackIcon={sub.icon}
                    containerStyle={[
                      styles.railAvatar,
                      {
                        borderColor: isSelected ? theme.colors.secondary : theme.colors.border,
                        backgroundColor: isSelected
                          ? theme.colors.secondarySoft
                          : theme.colors.surfaceSunken,
                      },
                      isSelected && styles.railAvatarSelected,
                    ]}
                  />
                  <Text
                    weight={isSelected ? '800' : '600'}
                    size={11}
                    align="center"
                    color={isSelected ? theme.colors.secondary : theme.colors.muted}
                    numberOfLines={2}
                    style={styles.railText}
                  >
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Product Grid with 2 Cards in a Row */}
        <View style={styles.rightContent}>
          <FlatList
            data={currentProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <UniversalProductCard
                product={item}
                variant="grid"
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
                onOpenUnitModal={(p) => setUnitModalProduct(p)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={38} color={theme.colors.subtle} />
                <Text weight="700" size={13} color={theme.colors.muted} style={styles.emptyTitle}>
                  No items found in {activeSubName}
                </Text>
                <Text size={11} align="center" color={theme.colors.subtle}>
                  Try clearing active price or brand filters.
                </Text>
              </View>
            }
          />
        </View>
      </View>

      {/* Per Piece Selection Bottom Sheet Modal */}
      {unitModalProduct && (
        <BuyPerPieceModal
          visible={!!unitModalProduct}
          product={unitModalProduct}
          onClose={() => setUnitModalProduct(null)}
          onAddToCart={(prod, qty, unit) => handleAddToCart(prod, qty, unit)}
        />
      )}

      {/* SORT MODAL */}
      <AppModal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border },
            ]}
          >
            <Heading level={4} style={styles.modalTitle}>
              Sort By
            </Heading>
            {[
              { label: 'Default', value: 'default' },
              { label: 'Price: Low to High', value: 'price_asc' },
              { label: 'Price: High to Low', value: 'price_desc' },
              { label: 'Most Popular', value: 'popular' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.modalOption,
                  sortBy === opt.value && { backgroundColor: theme.colors.secondarySoft },
                ]}
                onPress={() => {
                  setSortBy(opt.value as SortOption);
                  setSortModalVisible(false);
                }}
              >
                <Text
                  weight={sortBy === opt.value ? '800' : '600'}
                  color={sortBy === opt.value ? theme.colors.secondary : theme.colors.foreground}
                >
                  {opt.label}
                </Text>
                {sortBy === opt.value && (
                  <Ionicons name="checkmark" size={18} color={theme.colors.secondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </AppModal>

      {/* BRAND MODAL */}
      <AppModal
        visible={brandModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBrandModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBrandModalVisible(false)}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border },
            ]}
          >
            <Heading level={4} style={styles.modalTitle}>
              Filter by Brand
            </Heading>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  selectedBrand === 'all' && { backgroundColor: theme.colors.secondarySoft },
                ]}
                onPress={() => {
                  setSelectedBrand('all');
                  setBrandModalVisible(false);
                }}
              >
                <Text
                  weight={selectedBrand === 'all' ? '800' : '600'}
                  color={selectedBrand === 'all' ? theme.colors.secondary : theme.colors.foreground}
                >
                  All Brands
                </Text>
              </TouchableOpacity>
              {availableBrands.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[
                    styles.modalOption,
                    selectedBrand === b && { backgroundColor: theme.colors.secondarySoft },
                  ]}
                  onPress={() => {
                    setSelectedBrand(b);
                    setBrandModalVisible(false);
                  }}
                >
                  <Text
                    weight={selectedBrand === b ? '800' : '600'}
                    color={selectedBrand === b ? theme.colors.secondary : theme.colors.foreground}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </AppModal>

      {/* PRICE RANGE MODAL */}
      <AppModal
        visible={priceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPriceModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPriceModalVisible(false)}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border },
            ]}
          >
            <Heading level={4} style={styles.modalTitle}>
              Price Range
            </Heading>
            {[
              { label: 'All Prices', value: 'all' },
              { label: 'Under Rs 500', value: 'under500' },
              { label: 'Rs 500 - Rs 2,000', value: '500to2000' },
              { label: 'Above Rs 2,000', value: 'above2000' },
            ].map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.modalOption,
                  priceFilter === p.value && { backgroundColor: theme.colors.secondarySoft },
                ]}
                onPress={() => {
                  setPriceFilter(p.value as PriceFilter);
                  setPriceModalVisible(false);
                }}
              >
                <Text
                  weight={priceFilter === p.value ? '800' : '600'}
                  color={priceFilter === p.value ? theme.colors.secondary : theme.colors.foreground}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </AppModal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  commandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  circleActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  categorySegmentBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
  },
  categorySegmentScroll: {
    paddingHorizontal: 10,
    gap: 6,
  },
  categorySegmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categorySegmentIcon: {
    marginRight: 5,
  },
  microFilterBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
  },
  microFilterScroll: {
    paddingHorizontal: 10,
    gap: 6,
    alignItems: 'center',
  },
  microChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  filterIconChip: {
    paddingHorizontal: 8,
  },
  clearFiltersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    gap: 3,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftRail: {
    width: 84,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  leftRailScroll: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  railItem: {
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'center',
    minHeight: 88,
    marginBottom: 4,
  },
  railIndicator: {
    position: 'absolute',
    left: -8,
    top: '50%',
    marginTop: -10,
    width: 3,
    height: 20,
    borderRadius: 2,
  },
  railAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    marginBottom: 6,
  },
  railAvatarSelected: {
    borderWidth: 2,
  },
  railText: {
    lineHeight: 13,
    paddingHorizontal: 2,
  },
  rightContent: {
    flex: 1,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productList: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 6,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '85%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  modalTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
});
