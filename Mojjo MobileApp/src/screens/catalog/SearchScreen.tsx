import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption, PriceText } from '../../components/common/Typography';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import {
  SearchFilterModal,
  SearchFilterState,
} from '../../components/search/SearchFilterModal';
import { useTheme } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../components/feedback/ToastContext';
import { Product } from '../../types/product';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { StorageService } from '../../services/storage';
import { useDebounce } from '../../hooks/useDebounce';
import {
  findClosestTypoCorrection,
  getLiveSuggestions,
} from '../../utils/fuzzySearch';
import { formatNPR } from '../../utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { HapticsService } from '../../services/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const TRENDING_SEARCHES = [
  'Real Juice',
  'DDC Butter',
  'Wai Wai Noodles',
  'Coca Cola',
  'Lays Chips',
  'Milk',
  'Eggs',
];

const SEARCH_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: '2', name: 'Dairy & Eggs' },
  { id: '3', name: 'Cold Drinks' },
  { id: '4', name: 'Munchies & Snacks' },
  { id: '1', name: 'Fruits & Veggies' },
  { id: '5', name: 'Instant Food' },
  { id: '6', name: 'Household' },
];

import { UNIFIED_MOCK_PRODUCTS } from '../../data/mockProducts';
import { UniversalProductCard } from '../../components/product/UniversalProductCard';
import { BuyPerPieceModal } from '../../components/product/BuyPerPieceModal';

const ALL_MOCK_PRODUCTS: Product[] = UNIFIED_MOCK_PRODUCTS;

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<SearchFilterState>({
    sortBy: 'popular',
    inStockOnly: false,
    flashDealsOnly: false,
  });

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [unitModalProduct, setUnitModalProduct] = useState<Product | null>(null);

  // Load persistent recent searches on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const stored = await StorageService.getItem<string[]>(STORAGE_KEYS.RECENT_SEARCHES);
        if (stored && Array.isArray(stored)) {
          setRecentSearches(stored);
        }
      } catch {}
    };
    loadRecent();
  }, []);

  const saveRecentSearch = useCallback(async (term: string) => {
    const clean = term.trim();
    if (!clean) return;

    setRecentSearches((prev) => {
      const updated = [clean, ...prev.filter((i) => i.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      StorageService.setItem(STORAGE_KEYS.RECENT_SEARCHES, updated).catch(() => {});
      return updated;
    });
  }, []);

  const deleteRecentSearch = useCallback((term: string) => {
    HapticsService.light();
    setRecentSearches((prev) => {
      const updated = prev.filter((i) => i !== term);
      StorageService.setItem(STORAGE_KEYS.RECENT_SEARCHES, updated).catch(() => {});
      return updated;
    });
  }, []);

  const clearAllRecent = useCallback(() => {
    HapticsService.warning();
    setRecentSearches([]);
    StorageService.removeItem(STORAGE_KEYS.RECENT_SEARCHES).catch(() => {});
  }, []);

  // Live Auto-complete Suggestions (displayed when user types >= 2 characters)
  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return getLiveSuggestions(query, [
      ...ALL_MOCK_PRODUCTS.map((p) => p.name),
      ...TRENDING_SEARCHES,
    ]);
  }, [query]);

  // Filter and Sort Catalog Results
  const filteredProducts = useMemo(() => {
    let result = ALL_MOCK_PRODUCTS;

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // 2. Query Search Filter
    const cleanQ = debouncedQuery.trim().toLowerCase();
    if (cleanQ) {
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(cleanQ);
        const tagMatch = p.tags.some((t) => t.toLowerCase().includes(cleanQ));
        return nameMatch || tagMatch;
      });
    }

    // 3. Price Filter
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.price >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
    }

    // 4. In Stock Filter
    if (filters.inStockOnly) {
      result = result.filter((p) => p.stockQuantity > 0 && p.isAvailable);
    }

    // 5. Flash Deals Filter
    if (filters.flashDealsOnly) {
      result = result.filter((p) => p.isFlashDeal);
    }

    // 6. Sorting
    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'popular':
        default:
          return (b.stockQuantity || 0) - (a.stockQuantity || 0);
      }
    });

    return result;
  }, [debouncedQuery, selectedCategory, filters]);

  // Typo tolerance evaluation: if query yields 0 results, find closest keyword
  const typoCorrection = useMemo(() => {
    if (debouncedQuery.trim().length >= 3 && filteredProducts.length === 0) {
      return findClosestTypoCorrection(debouncedQuery);
    }
    return null;
  }, [debouncedQuery, filteredProducts.length]);

  // Paginated Results View
  const paginatedResults = useMemo(() => {
    const pageSize = 6;
    return filteredProducts.slice(0, page * pageSize);
  }, [filteredProducts, page]);

  const hasMore = paginatedResults.length < filteredProducts.length;

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setPage((prev) => prev + 1);
        setIsLoadingMore(false);
      }, 300);
    }
  };

  const handleSearchSubmit = (searchTerm: string) => {
    setQuery(searchTerm);
    saveRecentSearch(searchTerm);
    setPage(1);
  };

  const handleProductPress = useCallback(
    (product: Product) => {
      saveRecentSearch(product.name);
      navigation.navigate('ProductDetail', { product });
    },
    [navigation, saveRecentSearch]
  );

  const handleAddToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      addItem(product, quantity);
      showSuccess('Added to Basket', `${product.name} added`);
    },
    [addItem, showSuccess]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sortBy !== 'popular') count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.inStockOnly) count++;
    if (filters.flashDealsOnly) count++;
    return count;
  }, [filters]);

  const renderProductItem: ListRenderItem<Product> = useCallback(
    ({ item }) => (
      <UniversalProductCard
        product={item}
        onPress={handleProductPress}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
        onOpenUnitModal={(prod) => setUnitModalProduct(prod)}
      />
    ),
    [handleProductPress, handleAddToCart]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <ScreenWrapper
      headerComponent={
        <Header
          title="Search Catalog"
          showBack
          onBack={() => navigation.goBack()}
          rightAction={
            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
              style={styles.filterHeaderBtn}
            >
              <Ionicons name="options-outline" size={22} color={theme.colors.foreground} />
              {activeFilterCount > 0 && (
                <View
                  style={[styles.filterBadge, { backgroundColor: theme.colors.secondary }]}
                >
                  <Text weight="800" size={10} color="#FFFFFF">
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          }
        />
      }
      style={styles.container}
    >
      <OfflineBanner />

      {/* Search Input Bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.inputWrapper}>
          <Input
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setPage(1);
            }}
            placeholder="Search juices, butter, noodles, cold drinks..."
            leftIcon={
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.colors.secondary}
                style={styles.searchIcon}
              />
            }
            clearable
            onClear={() => {
              setQuery('');
              setPage(1);
            }}
            onSubmitEditing={() => handleSearchSubmit(query)}
            returnKeyType="search"
            autoFocus={false}
          />
        </View>
      </View>

      {/* Live Auto-Complete Suggestions Floating Box */}
      {suggestions.length > 0 && query.trim().length >= 2 && (
        <Card style={styles.suggestionsCard} padding="sm">
          {suggestions.map((sug, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.suggestionItem, idx > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.border }]}
              onPress={() => handleSearchSubmit(sug)}
            >
              <Ionicons name="search" size={15} color={theme.colors.muted} />
              <Text size={13} weight="600" style={styles.suggestionText}>
                {sug}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={theme.colors.subtle} />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Horizontal Category Scope Pills */}
      <View style={styles.categoryPillsContainer}>
        <FlatList
          data={SEARCH_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryPillsList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => {
                  HapticsService.selection();
                  setSelectedCategory(item.id);
                  setPage(1);
                }}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceRaised,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  weight="700"
                  size={12}
                  color={isSelected ? theme.colors.onPrimary : theme.colors.foreground}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Typo Tolerance & Fuzzy Search Notice */}
      {typoCorrection && (
        <Card
          variant="sunken"
          style={[styles.typoCard, { backgroundColor: theme.colors.secondarySoft }]}
          padding="sm"
        >
          <View style={styles.typoRow}>
            <Ionicons name="sparkles" size={18} color={theme.colors.secondary} />
            <View style={styles.typoTextContainer}>
              <Text size={13} color={theme.colors.foreground}>
                Did you mean{' '}
                <Text weight="800" color={theme.colors.secondary}>
                  "{typoCorrection}"
                </Text>
                ?
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleSearchSubmit(typoCorrection)}
              style={styles.typoButton}
            >
              <Caption color={theme.colors.secondary} bold>
                Search this
              </Caption>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* When no query is entered, show Recent & Trending Searches */}
      {!query.trim() && (
        <View style={styles.discoverySection}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.sectionHeaderRow}>
                <Heading level={4}>Recent Searches</Heading>
                <TouchableOpacity onPress={clearAllRecent}>
                  <Caption color={theme.colors.error} bold>
                    Clear All
                  </Caption>
                </TouchableOpacity>
              </View>
              <View style={styles.recentChipsRow}>
                {recentSearches.map((term, index) => (
                  <View
                    key={index}
                    style={[styles.recentChip, { backgroundColor: theme.colors.surfaceSunken }]}
                  >
                    <TouchableOpacity onPress={() => handleSearchSubmit(term)}>
                      <Text size={13} weight="600">
                        {term}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteRecentSearch(term)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      style={styles.deleteChipBtn}
                    >
                      <Ionicons name="close" size={14} color={theme.colors.muted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Trending Searches */}
          <View style={styles.trendingSection}>
            <Heading level={4} style={styles.trendingTitle}>
              🔥 Trending Searches
            </Heading>
            <View style={styles.trendingChipsRow}>
              {TRENDING_SEARCHES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.trendingChip,
                    {
                      backgroundColor: theme.colors.surfaceRaised,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => handleSearchSubmit(item)}
                >
                  <Ionicons name="trending-up" size={14} color={theme.colors.secondary} />
                  <Text size={12} weight="600" style={styles.trendingChipText}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Search Results Virtualized List */}
      {query.trim() !== '' && (
        <FlatList
          data={paginatedResults}
          keyExtractor={keyExtractor}
          renderItem={renderProductItem}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            filteredProducts.length > 0 ? (
              <View style={styles.resultsHeader}>
                <Caption color={theme.colors.muted}>
                  Showing {paginatedResults.length} of {filteredProducts.length} items
                </Caption>
              </View>
            ) : null
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={theme.colors.secondary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !typoCorrection ? (
              <EmptyState
                icon="search-outline"
                title="No Products Found"
                description={`We couldn't find any results for "${query}". Try searching with different keywords or resetting filters.`}
                actionTitle="Reset All Filters"
                onAction={() => {
                  setQuery('');
                  setSelectedCategory('all');
                  setFilters({
                    sortBy: 'popular',
                    inStockOnly: false,
                    flashDealsOnly: false,
                  });
                }}
              />
            ) : null
          }
        />
      )}

      {/* Advanced Filter & Sorting Modal */}
      <SearchFilterModal
        visible={filterModalVisible}
        filters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onReset={() => {
          setFilters({
            sortBy: 'popular',
            inStockOnly: false,
            flashDealsOnly: false,
          });
          setPage(1);
        }}
        onClose={() => setFilterModalVisible(false)}
      />

      {unitModalProduct && (
        <BuyPerPieceModal
          visible={!!unitModalProduct}
          product={unitModalProduct}
          onClose={() => setUnitModalProduct(null)}
          onAddToCart={(prod, qty, unit) => handleAddToCart(prod, qty)}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  filterHeaderBtn: {
    position: 'relative',
    padding: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  searchIcon: {
    marginLeft: 8,
  },
  suggestionsCard: {
    position: 'absolute',
    top: 64,
    left: 12,
    right: 12,
    zIndex: 99,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 8,
  },
  categoryPillsContainer: {
    marginBottom: 10,
  },
  categoryPillsList: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  typoCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  typoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typoTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  typoButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discoverySection: {
    marginTop: 8,
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recentChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 16,
  },
  deleteChipBtn: {
    marginLeft: 6,
    padding: 2,
  },
  trendingSection: {
    marginBottom: 20,
  },
  trendingTitle: {
    marginBottom: 10,
  },
  trendingChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  trendingChipText: {
    marginLeft: 6,
  },
  resultsList: {
    paddingBottom: 32,
  },
  resultsHeader: {
    marginBottom: 8,
  },
  productCard: {
    marginBottom: 10,
    borderRadius: 14,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  unitText: {
    marginVertical: 2,
  },
  addButton: {
    paddingHorizontal: 12,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
