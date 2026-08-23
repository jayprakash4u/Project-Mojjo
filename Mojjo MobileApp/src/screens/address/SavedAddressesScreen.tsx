import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { useTheme } from '../../theme';
import { useAddressStore } from '../../store/addressStore';
import { Address, AddressLabel } from '../../types/address';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../components/feedback/ToastContext';
import { useNavigation } from '@react-navigation/native';

const getLabelIcon = (label: AddressLabel): keyof typeof Ionicons.glyphMap => {
  switch (label) {
    case 'Home':
      return 'home-outline';
    case 'Work':
      return 'business-outline';
    case 'Other':
    default:
      return 'location-outline';
  }
};

export const SavedAddressesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { showSuccess, showError } = useToast();

  const addresses = useAddressStore((s) => s.addresses);
  const selectedAddressId = useAddressStore((s) => s.selectedAddressId);
  const selectAddress = useAddressStore((s) => s.selectAddress);
  const setDefaultAddress = useAddressStore((s) => s.setDefaultAddress);
  const deleteAddress = useAddressStore((s) => s.deleteAddress);

  const handleSelect = useCallback(
    async (address: Address) => {
      await selectAddress(address.id);
      showSuccess('Delivery Location Set', `Delivering to ${address.area}, ${address.city}`);
      navigation.goBack();
    },
    [selectAddress, showSuccess, navigation]
  );

  const handleSetDefault = useCallback(
    async (addressId: string) => {
      await setDefaultAddress(addressId);
      showSuccess('Default Address Updated', 'This will be used for all future orders.');
    },
    [setDefaultAddress, showSuccess]
  );

  const handleDelete = useCallback(
    (address: Address) => {
      Alert.alert(
        'Delete Address',
        `Are you sure you want to remove "${address.label} - ${address.streetAddress}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteAddress(address.id);
              showSuccess('Address Removed', 'Address deleted successfully.');
            },
          },
        ]
      );
    },
    [deleteAddress, showSuccess]
  );

  const handleEdit = useCallback(
    (address: Address) => {
      navigation.navigate('AddEditAddress', { addressToEdit: address });
    },
    [navigation]
  );

  const handleAddNew = useCallback(() => {
    navigation.navigate('AddEditAddress');
  }, [navigation]);

  const renderAddressItem: ListRenderItem<Address> = useCallback(
    ({ item }) => {
      const isSelected = selectedAddressId === item.id;
      const icon = getLabelIcon(item.label);

      return (
        <Card
          variant={isSelected ? 'elevated' : 'outlined'}
          style={[
            styles.addressCard,
            isSelected && { borderColor: theme.colors.primary, borderWidth: 2 },
          ]}
          padding="md"
        >
          {/* Header Row */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.labelRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isSelected ? theme.colors.secondarySoft : theme.colors.surfaceSunken },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={isSelected ? theme.colors.secondary : theme.colors.foreground}
                />
              </View>
              <Text weight="700" size={15} color={theme.colors.foreground}>
                {item.customLabel || item.label}
              </Text>
              {item.isDefault && (
                <Badge label="Default" variant="accent" size="sm" style={styles.defaultBadge} />
              )}
            </View>

            {/* Selection Checkmark */}
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={isSelected ? theme.colors.primary : theme.colors.subtle}
              />
            </TouchableOpacity>
          </View>

          {/* Address Details */}
          <Text weight="600" size={14} style={styles.recipientText}>
            {item.recipientName} • +977 {item.phoneNumber}
          </Text>
          <Text size={13} color={theme.colors.muted} style={styles.streetText}>
            {item.streetAddress}, {item.area}, {item.city}
          </Text>
          {item.landmark ? (
            <Caption color={theme.colors.subtle} style={styles.landmarkText}>
              📍 Landmark: {item.landmark}
            </Caption>
          ) : null}

          {/* Delivery Zone Serviceability Tag */}
          <View style={styles.serviceabilityRow}>
            {item.isServiceable ? (
              <Badge
                label={`⚡ ${item.etaMinutes}-Min Delivery Available`}
                variant="success"
                size="sm"
              />
            ) : (
              <Badge
                label="⚠️ Outside 10-Min Dark Store Zone"
                variant="warning"
                size="sm"
              />
            )}
          </View>

          {/* Action Row */}
          <View style={[styles.actionRow, { borderTopColor: theme.colors.border }]}>
            {!item.isDefault && (
              <TouchableOpacity
                onPress={() => handleSetDefault(item.id)}
                style={styles.actionBtn}
              >
                <Caption color={theme.colors.secondary} bold>
                  Set as Default
                </Caption>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
              <Ionicons name="create-outline" size={15} color={theme.colors.foreground} />
              <Caption color={theme.colors.foreground} bold style={styles.btnText}>
                Edit
              </Caption>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={15} color={theme.colors.error} />
              <Caption color={theme.colors.error} bold style={styles.btnText}>
                Delete
              </Caption>
            </TouchableOpacity>
          </View>
        </Card>
      );
    },
    [selectedAddressId, theme, handleSelect, handleSetDefault, handleEdit, handleDelete]
  );

  return (
    <ScreenWrapper
      headerComponent={
        <Header
          title="Saved Addresses"
          showBack
          onBack={() => navigation.goBack()}
          rightAction={
            <TouchableOpacity onPress={handleAddNew}>
              <Caption color={theme.colors.secondary} bold>
                + Add New
              </Caption>
            </TouchableOpacity>
          }
        />
      }
      style={styles.container}
    >
      <OfflineBanner />

      {addresses.length === 0 ? (
        <EmptyState
          icon="location-outline"
          title="No Saved Addresses"
          description="Add your home, office, or apartment address to get ultra-fast 10-minute delivery."
          actionTitle="+ Add Address"
          onAction={handleAddNew}
        />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderAddressItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Button
              title="+ Add New Address"
              variant="outline"
              size="lg"
              fullWidth
              onPress={handleAddNew}
              style={styles.addAddressButton}
            />
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  listContent: {
    paddingVertical: 12,
  },
  addressCard: {
    marginBottom: 14,
    borderRadius: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultBadge: {
    marginLeft: 4,
  },
  recipientText: {
    marginTop: 4,
  },
  streetText: {
    marginTop: 4,
    lineHeight: 18,
  },
  landmarkText: {
    marginTop: 4,
  },
  serviceabilityRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  btnText: {
    marginLeft: 4,
  },
  addAddressButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
