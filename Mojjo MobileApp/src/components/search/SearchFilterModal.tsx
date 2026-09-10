import React, { useState, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Heading, Text, Caption } from '../common/Typography';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AppModal } from '../common/AppModal';

export interface SearchFilterState {
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'newest';
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  flashDealsOnly: boolean;
}

export interface SearchFilterModalProps {
  visible: boolean;
  filters: SearchFilterState;
  onApply: (newFilters: SearchFilterState) => void;
  onReset: () => void;
  onClose: () => void;
}

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under रू 150', min: undefined, max: 150 },
  { label: 'रू 150 – 300', min: 150, max: 300 },
  { label: 'रू 300 – 500', min: 300, max: 500 },
  { label: 'रू 500+', min: 500, max: undefined },
];

export const SearchFilterModal: React.FC<SearchFilterModalProps> = memo(({
  visible,
  filters,
  onApply,
  onReset,
  onClose,
}) => {
  const { theme } = useTheme();

  const [sortBy, setSortBy] = useState<SearchFilterState['sortBy']>(filters.sortBy);
  const [minPrice, setMinPrice] = useState<number | undefined>(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(filters.maxPrice);
  const [inStockOnly, setInStockOnly] = useState(filters.inStockOnly);
  const [flashDealsOnly, setFlashDealsOnly] = useState(filters.flashDealsOnly);

  useEffect(() => {
    setSortBy(filters.sortBy);
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setInStockOnly(filters.inStockOnly);
    setFlashDealsOnly(filters.flashDealsOnly);
  }, [filters, visible]);

  const handlePricePresetSelect = (preset: (typeof PRICE_PRESETS)[0]) => {
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
  };

  const handleApply = () => {
    onApply({
      sortBy,
      minPrice,
      maxPrice,
      inStockOnly,
      flashDealsOnly,
    });
    onClose();
  };

  const handleReset = () => {
    setSortBy('popular');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStockOnly(false);
    setFlashDealsOnly(false);
    onReset();
    onClose();
  };

  const sortOptions: { id: SearchFilterState['sortBy']; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'popular', label: 'Most Popular', icon: 'flame-outline' },
    { id: 'price_asc', label: 'Price: Low to High', icon: 'arrow-up-outline' },
    { id: 'price_desc', label: 'Price: High to Low', icon: 'arrow-down-outline' },
    { id: 'newest', label: 'Newest Arrivals', icon: 'sparkles-outline' },
  ];

  return (
    <AppModal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={[styles.modalSheet, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Heading level={3}>Filters & Sorting</Heading>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Sort By Section */}
            <Heading level={4} style={styles.sectionTitle}>
              Sort By
            </Heading>
            <View style={styles.optionsGrid}>
              {sortOptions.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setSortBy(opt.id)}
                    style={[
                      styles.sortPill,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceRaised,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={16}
                      color={isSelected ? theme.colors.onPrimary : theme.colors.foreground}
                    />
                    <Text
                      weight="600"
                      size={13}
                      color={isSelected ? theme.colors.onPrimary : theme.colors.foreground}
                      style={styles.pillText}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Price Range Section */}
            <Heading level={4} style={styles.sectionTitle}>
              Price Range
            </Heading>
            <View style={styles.optionsGrid}>
              {PRICE_PRESETS.map((preset, idx) => {
                const isSelected = minPrice === preset.min && maxPrice === preset.max;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handlePricePresetSelect(preset)}
                    style={[
                      styles.pricePill,
                      {
                        backgroundColor: isSelected ? theme.colors.secondary : theme.colors.surfaceRaised,
                        borderColor: isSelected ? theme.colors.secondary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      weight="600"
                      size={13}
                      color={isSelected ? theme.colors.onSecondary : theme.colors.foreground}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Availability & Deals Toggles */}
            <Heading level={4} style={styles.sectionTitle}>
              Preferences
            </Heading>
            <Card style={styles.togglesCard} padding="sm">
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text weight="600" size={14}>
                    ⚡ Flash Deals Only
                  </Text>
                  <Caption color={theme.colors.muted}>Show only limited-time discounted items</Caption>
                </View>
                <Switch
                  value={flashDealsOnly}
                  onValueChange={setFlashDealsOnly}
                  trackColor={{ false: theme.colors.border, true: theme.colors.secondary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text weight="600" size={14}>
                    📦 In Stock Only
                  </Text>
                  <Caption color={theme.colors.muted}>Hide items that are out of stock</Caption>
                </View>
                <Switch
                  value={inStockOnly}
                  onValueChange={setInStockOnly}
                  trackColor={{ false: theme.colors.border, true: theme.colors.secondary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <Button
              title="Reset All"
              variant="outline"
              size="md"
              onPress={handleReset}
              style={styles.resetButton}
            />
            <Button
              title="Apply Filters"
              variant="secondary"
              size="md"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>
        </SafeAreaView>
      </View>
    </AppModal>
  );
});

SearchFilterModal.displayName = 'SearchFilterModal';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    marginLeft: 6,
  },
  pricePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  togglesCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
