import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { OfflineBanner } from '../../components/feedback/OfflineBanner';
import { useTheme } from '../../theme';
import { useAddressStore } from '../../store/addressStore';
import { Address, AddressLabel } from '../../types/address';
import {
  DeliveryZoneService,
  KATHMANDU_VALLEY_DELIVERY_ZONES,
} from '../../services/delivery/deliveryZoneService';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../components/feedback/ToastContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CustomerLocationService, DetectedLocationResult } from '../../services/delivery/customerLocationService';
import { HapticsService } from '../../services/haptics';

export const AddEditAddressScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { showSuccess, showError } = useToast();

  const addressToEdit: Address | undefined = route.params?.addressToEdit;
  const isEditing = !!addressToEdit;

  const addAddress = useAddressStore((s) => s.addAddress);
  const updateAddress = useAddressStore((s) => s.updateAddress);

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [label, setLabel] = useState<AddressLabel>(addressToEdit?.label || 'Home');
  const [recipientName, setRecipientName] = useState(addressToEdit?.recipientName || 'Jay Prakash');
  const [phoneNumber, setPhoneNumber] = useState(addressToEdit?.phoneNumber || '9841234567');
  const [streetAddress, setStreetAddress] = useState(addressToEdit?.streetAddress || '');
  const [area, setArea] = useState(addressToEdit?.area || 'Jhamsikhel');
  const [city, setCity] = useState(addressToEdit?.city || 'Lalitpur');
  const [latitude, setLatitude] = useState<number | undefined>(addressToEdit?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(addressToEdit?.longitude);
  const [landmark, setLandmark] = useState(addressToEdit?.landmark || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    addressToEdit?.deliveryInstructions || ''
  );
  const [isDefault, setIsDefault] = useState(addressToEdit?.isDefault ?? true);
  const [isSaving, setIsSaving] = useState(false);

  // Real-time delivery zone serviceability evaluation
  const serviceability = useMemo(() => {
    return DeliveryZoneService.checkServiceability(area, city);
  }, [area, city]);

  const handleSelectZone = (zoneName: string, zoneCity: string) => {
    setArea(zoneName);
    setCity(zoneCity);
  };

  const handleSave = async () => {
    if (!recipientName.trim()) {
      showError('Name Required', 'Please enter recipient name.');
      return;
    }
    if (!phoneNumber.trim()) {
      showError('Phone Required', 'Please enter a valid phone number.');
      return;
    }
    if (!streetAddress.trim()) {
      showError('Street Address Required', 'Please enter building/street address.');
      return;
    }
    if (!area.trim()) {
      showError('Area Required', 'Please enter area/locality name.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && addressToEdit) {
        await updateAddress(addressToEdit.id, {
          label,
          recipientName: recipientName.trim(),
          phoneNumber: phoneNumber.trim(),
          streetAddress: streetAddress.trim(),
          area: area.trim(),
          city: city.trim(),
          landmark: landmark.trim() || undefined,
          deliveryInstructions: deliveryInstructions.trim() || undefined,
          isDefault,
        });
        showSuccess('Address Updated', 'Delivery address details updated.');
      } else {
        await addAddress({
          label,
          recipientName: recipientName.trim(),
          phoneNumber: phoneNumber.trim(),
          streetAddress: streetAddress.trim(),
          area: area.trim(),
          city: city.trim(),
          landmark: landmark.trim() || undefined,
          deliveryInstructions: deliveryInstructions.trim() || undefined,
          isDefault,
        });
        showSuccess('Address Saved', 'New delivery address added successfully.');
      }
      navigation.goBack();
    } catch {
      showError('Save Failed', 'Could not save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDetectGps = async () => {
    setIsDetectingLocation(true);
    HapticsService.light();
    try {
      const result = await CustomerLocationService.requestAndGetLocation();
      setStreetAddress(result.streetAddress);
      setArea(result.area);
      setCity(result.city);
      if (result.landmark) setLandmark(result.landmark);
      setLatitude(result.latitude);
      setLongitude(result.longitude);
      HapticsService.success();
      showSuccess('Location Detected 📍', `Autofilled: ${result.area}, ${result.city}`);
    } catch {
      showError('GPS Detection Failed', 'Please enter your address or select a zone below.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const labelOptions: { id: AddressLabel; name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'Home', name: 'Home', icon: 'home-outline' },
    { id: 'Work', name: 'Work', icon: 'business-outline' },
    { id: 'Other', name: 'Other', icon: 'location-outline' },
  ];

  return (
    <ScreenWrapper
      headerComponent={
        <Header
          title={isEditing ? 'Edit Address' : 'Add New Address'}
          showBack
          onBack={() => navigation.goBack()}
        />
      }
      scrollable
      contentContainerStyle={styles.container}
    >
      <OfflineBanner />

      {/* GPS Location Auto-Detection Button Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleDetectGps}
        disabled={isDetectingLocation}
        style={[
          styles.gpsCard,
          {
            backgroundColor: theme.colors.surfaceRaised,
            borderColor: theme.colors.accent,
          },
        ]}
      >
        <View style={styles.gpsCardRow}>
          <View style={[styles.gpsIconCircle, { backgroundColor: theme.colors.accentSoft }]}>
            <Ionicons name="navigate" size={22} color={theme.colors.accent} />
          </View>

          <View style={styles.gpsTextCol}>
            <View style={styles.gpsBadgeRow}>
              <Text weight="700" size={14} color={theme.colors.foreground}>
                {isDetectingLocation ? 'Detecting Current Location...' : 'Auto-Detect Current GPS Location'}
              </Text>
              <Badge label="FAST" variant="accent" size="sm" />
            </View>
            <Caption color={theme.colors.muted}>
              {isDetectingLocation ? 'Reading GPS coordinates & matching zone...' : 'Tap to find your address using device GPS'}
            </Caption>
          </View>

          <Ionicons name="chevron-forward" size={20} color={theme.colors.accent} />
        </View>
      </TouchableOpacity>

      {/* Address Category Pills */}
      <Heading level={4} style={styles.sectionTitle}>
        Save Address As
      </Heading>
      <View style={styles.labelRow}>
        {labelOptions.map((opt) => {
          const isSelected = label === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setLabel(opt.id)}
              style={[
                styles.labelPill,
                {
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceRaised,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name={opt.icon}
                size={18}
                color={isSelected ? theme.colors.onPrimary : theme.colors.foreground}
              />
              <Text
                weight="700"
                size={13}
                color={isSelected ? theme.colors.onPrimary : theme.colors.foreground}
                style={styles.labelPillText}
              >
                {opt.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Contact Details */}
      <Heading level={4} style={styles.sectionTitle}>
        Contact Information
      </Heading>
      <Card style={styles.formCard} padding="md">
        <Input
          label="Recipient Full Name"
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="e.g. Jay Prakash Yadav"
        />
        <Input
          label="Mobile Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          prefix="+977"
          placeholder="98XXXXXXXX"
        />
      </Card>

      {/* Location & Delivery Zone */}
      <Heading level={4} style={styles.sectionTitle}>
        Address & Dark Store Zone
      </Heading>
      <Card style={styles.formCard} padding="md">
        <Input
          label="Street Address / House No. / Flat"
          value={streetAddress}
          onChangeText={setStreetAddress}
          placeholder="e.g. House #14, Jhamsikhel Road"
        />

        <Input
          label="Area / Locality"
          value={area}
          onChangeText={setArea}
          placeholder="e.g. Jhamsikhel, Sanepa, Baneshwor"
        />

        {/* Quick Dark Store Zone Chips */}
        <Caption color={theme.colors.muted} style={styles.quickZoneLabel}>
          Popular Kathmandu Valley Dark-Store Zones:
        </Caption>
        <View style={styles.zoneChipsRow}>
          {KATHMANDU_VALLEY_DELIVERY_ZONES.slice(0, 8).map((zone) => {
            const isMatch = area.toLowerCase() === zone.name.toLowerCase();
            return (
              <TouchableOpacity
                key={zone.id}
                onPress={() => handleSelectZone(zone.name, zone.city)}
                style={[
                  styles.zoneChip,
                  {
                    backgroundColor: isMatch ? theme.colors.secondarySoft : theme.colors.surfaceSunken,
                    borderColor: isMatch ? theme.colors.secondary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  weight="600"
                  size={12}
                  color={isMatch ? theme.colors.secondary : theme.colors.foreground}
                >
                  {zone.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="e.g. Lalitpur / Kathmandu"
        />

        <Input
          label="Nearby Landmark (Optional)"
          value={landmark}
          onChangeText={setLandmark}
          placeholder="e.g. Opposite St. Xavier’s College"
        />

        <Input
          label="Delivery Instructions (Optional)"
          value={deliveryInstructions}
          onChangeText={setDeliveryInstructions}
          placeholder="e.g. Leave with security / Ring bell twice"
        />
      </Card>

      {/* Real-time Delivery Zone Serviceability Feedback Card */}
      <Card
        variant="elevated"
        style={[
          styles.serviceCard,
          {
            backgroundColor: serviceability.isServiceable
              ? theme.colors.successSoft
              : theme.colors.warningSoft,
          },
        ]}
        padding="sm"
      >
        <View style={styles.serviceRow}>
          <Ionicons
            name={serviceability.isServiceable ? 'flash' : 'alert-circle'}
            size={22}
            color={serviceability.isServiceable ? theme.colors.success : theme.colors.warning}
          />
          <View style={styles.serviceDetails}>
            <Text
              weight="700"
              size={13}
              color={serviceability.isServiceable ? theme.colors.success : theme.colors.warning}
            >
              {serviceability.message}
            </Text>
            <Caption
              color={serviceability.isServiceable ? theme.colors.success : theme.colors.warning}
            >
              {serviceability.isServiceable
                ? `Dark-store active for ${serviceability.areaName}, ${serviceability.cityName}`
                : '10-minute delivery is available across central Kathmandu & Lalitpur'}
            </Caption>
          </View>
        </View>
      </Card>

      {/* Default Address Toggle */}
      <Card style={styles.defaultCard} padding="md">
        <View style={styles.defaultRow}>
          <View style={styles.defaultInfo}>
            <Text weight="700" size={14}>
              Set as Default Address
            </Text>
            <Caption color={theme.colors.muted}>
              Automatically select this address for future 10-minute orders
            </Caption>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      {/* Save Button */}
      <Button
        title={isSaving ? 'Saving Address...' : isEditing ? 'Update Address' : 'Save Address'}
        variant="secondary"
        size="lg"
        fullWidth
        loading={isSaving}
        onPress={handleSave}
        style={styles.saveButton}
      />

    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 36,
  },
  gpsCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    marginTop: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  gpsCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gpsTextCol: {
    flex: 1,
    marginRight: 8,
  },
  gpsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  labelPillText: {
    marginLeft: 6,
  },
  formCard: {
    marginBottom: 14,
    borderRadius: 16,
  },
  quickZoneLabel: {
    marginBottom: 8,
    marginTop: -4,
  },
  zoneChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  zoneChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  serviceCard: {
    marginBottom: 14,
    borderRadius: 14,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetails: {
    marginLeft: 10,
    flex: 1,
  },
  defaultCard: {
    marginBottom: 20,
    borderRadius: 16,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultInfo: {
    flex: 1,
    marginRight: 12,
  },
  saveButton: {
    marginBottom: 24,
  },
});
