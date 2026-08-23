import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Heading, Text, Caption, PriceText } from '../common/Typography';
import { OptimizedImage } from '../common/OptimizedImage';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTheme } from '../../theme';
import { Product, ProductUnit } from '../../types/product';
import { Ionicons } from '@expo/vector-icons';
import { HapticsService } from '../../services/haptics';

interface BuyPerPieceModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, unit?: ProductUnit) => void;
}

export const BuyPerPieceModal: React.FC<BuyPerPieceModalProps> = ({
  visible,
  product,
  onClose,
  onAddToCart,
}) => {
  const { theme } = useTheme();

  if (!product || !product.units || product.units.length === 0) return null;

  const defaultUnit = product.units[0];
  const pieceUnit = product.units.find((u) => (u.contains ?? 1) === 1 && u.id !== defaultUnit?.id) || product.units[1];

  const [selectedUnit, setSelectedUnit] = useState<ProductUnit>(pieceUnit || defaultUnit);
  const [quantity, setQuantity] = useState<number>(1);

  const handleUnitSelect = (unit: ProductUnit) => {
    HapticsService.selection();
    setSelectedUnit(unit);
    setQuantity(1);
  };

  const handleIncrement = () => {
    HapticsService.light();
    setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      HapticsService.light();
      setQuantity((q) => q - 1);
    }
  };

  const handleConfirm = () => {
    HapticsService.success();
    const customProduct: Product = {
      ...product,
      name: `${product.name} (${selectedUnit.label})`,
      price: selectedUnit.price,
      unit: selectedUnit.label,
    };
    onAddToCart(customProduct, quantity, selectedUnit);
    onClose();
  };

  const currentTotal = selectedUnit.price * quantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.colors.surfaceRaised,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.titleInfo}>
                  <Text weight="800" size={16} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Caption color={theme.colors.muted}>Select Pack or Single Piece</Caption>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={theme.colors.muted} />
                </TouchableOpacity>
              </View>

              {/* Product Info Row */}
              <View style={styles.productRow}>
                <View style={styles.imageContainer}>
                  <OptimizedImage
                    uri={product.thumbnailUrl || (product.images && product.images[0])}
                    width={64}
                    height={64}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.productDetails}>
                  <Text weight="700" size={14} numberOfLines={1}>
                    {product.brand || 'Mojjo Essentials'}
                  </Text>
                  <Caption color={theme.colors.muted} numberOfLines={2}>
                    {product.description}
                  </Caption>
                </View>
              </View>

              {/* Unit Selection Options matching Website */}
              <View style={styles.unitsSection}>
                <Text weight="700" size={12} color={theme.colors.subtle} style={styles.sectionTitle}>
                  CHOOSE QUANTITY TYPE
                </Text>

                {product.units.map((unit) => {
                  const isSelected = selectedUnit.id === unit.id;
                  const isPack = (unit.contains ?? 1) > 1;

                  return (
                    <TouchableOpacity
                      key={unit.id}
                      onPress={() => handleUnitSelect(unit)}
                      activeOpacity={0.8}
                      style={[
                        styles.unitCard,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.secondarySoft
                            : theme.colors.surfaceSunken,
                          borderColor: isSelected
                            ? theme.colors.secondary
                            : theme.colors.border,
                        },
                      ]}
                    >
                      <View style={styles.unitLeft}>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={isSelected ? theme.colors.secondary : theme.colors.muted}
                        />
                        <View style={styles.unitTextCol}>
                          <Text
                            weight="700"
                            size={13}
                            color={isSelected ? theme.colors.secondary : theme.colors.foreground}
                          >
                            {unit.label}
                          </Text>
                          <Caption size={11} color={theme.colors.muted}>
                            {isPack ? 'Full sealed pack' : 'Individual loose stick'}
                          </Caption>
                        </View>
                      </View>

                      <View style={styles.unitRight}>
                        <PriceText amount={unit.price} size="sm" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quantity Stepper & Add Button */}
              <View style={styles.footerRow}>
                <View style={[styles.stepper, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border }]}>
                  <TouchableOpacity
                    onPress={handleDecrement}
                    style={styles.stepBtn}
                    disabled={quantity <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={quantity <= 1 ? theme.colors.subtle : theme.colors.foreground}
                    />
                  </TouchableOpacity>
                  <Text weight="800" size={14} style={styles.stepCount}>
                    {quantity}
                  </Text>
                  <TouchableOpacity onPress={handleIncrement} style={styles.stepBtn}>
                    <Ionicons name="add" size={18} color={theme.colors.secondary} />
                  </TouchableOpacity>
                </View>

                <Button
                  title={`Add • रू ${currentTotal}`}
                  onPress={handleConfirm}
                  variant="secondary"
                  size="md"
                  style={styles.addBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleInfo: {
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
    gap: 2,
  },
  unitsSection: {
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  unitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  unitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unitTextCol: {
    gap: 1,
  },
  unitRight: {
    alignItems: 'flex-end',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    minWidth: 24,
    textAlign: 'center',
  },
  addBtn: {
    flex: 1,
  },
});
