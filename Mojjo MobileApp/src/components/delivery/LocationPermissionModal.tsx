import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Text, Caption } from '../common/Typography';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useTheme } from '../../theme';
import { CustomerLocationService, DetectedLocationResult } from '../../services/delivery/customerLocationService';
import { KATHMANDU_VALLEY_DELIVERY_ZONES } from '../../services/delivery/deliveryZoneService';
import { HapticsService } from '../../services/haptics';

interface LocationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationDetected: (result: DetectedLocationResult) => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  visible,
  onClose,
  onLocationDetected,
}) => {
  const { theme } = useTheme();
  const [isDetecting, setIsDetecting] = useState(false);

  const handleAllowLocation = async () => {
    setIsDetecting(true);
    HapticsService.light();

    try {
      const result = await CustomerLocationService.requestAndGetLocation();
      HapticsService.success();
      setIsDetecting(false);
      onLocationDetected(result);
      onClose();
    } catch (err) {
      setIsDetecting(false);
      onClose();
    }
  };

  const handleSelectQuickZone = (zone: (typeof KATHMANDU_VALLEY_DELIVERY_ZONES)[0]) => {
    HapticsService.selection();
    const result: DetectedLocationResult = {
      latitude: 27.6782,
      longitude: 85.3123,
      streetAddress: `${zone.name} Main Road`,
      area: zone.name,
      city: zone.city,
      formattedAddress: `${zone.name}, ${zone.city}`,
      isServiceable: !zone.isRestricted,
      etaMinutes: zone.standardEtaMinutes,
      permissionGranted: true,
    };
    onLocationDetected(result);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Top Pin Header with Pulse */}
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.accentSoft }]}>
            <Ionicons name="location" size={32} color={theme.colors.accent} />
          </View>

          <Badge
            label="⚡ 10-MIN GPS AUTO-DETECTION"
            variant="accent"
            size="sm"
            style={styles.badge}
          />

          <Heading level={2} style={styles.title} align="center">
            Find Your Location
          </Heading>

          <Text size={13} color={theme.colors.muted} align="center" style={styles.description}>
            Allow Mojjo to access your GPS location so we can automatically show nearby dark stores, accurate 10-min delivery ETAs, and autofill your address.
          </Text>

          {/* Primary Action Button */}
          <Button
            title={isDetecting ? 'Detecting Location 📍...' : 'Use Current GPS Location 📍'}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleAllowLocation}
            disabled={isDetecting}
            style={styles.allowButton}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
            <Caption color={theme.colors.subtle} style={styles.dividerText}>
              OR SELECT QUICK VALLEY ZONE
            </Caption>
            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Quick Zones Grid */}
          <View style={styles.zonesGrid}>
            {KATHMANDU_VALLEY_DELIVERY_ZONES.slice(0, 6).map((z) => (
              <TouchableOpacity
                key={z.id}
                onPress={() => handleSelectQuickZone(z)}
                style={[
                  styles.zoneChip,
                  {
                    backgroundColor: theme.colors.surfaceRaised,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="location-outline" size={12} color={theme.colors.accent} />
                <Caption bold style={styles.zoneChipText}>
                  {z.name}
                </Caption>
              </TouchableOpacity>
            ))}
          </View>

          {/* Close Button */}
          <Button
            title="Enter Address Manually"
            variant="ghost"
            size="sm"
            fullWidth
            onPress={onClose}
            style={styles.manualButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badge: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 20,
    lineHeight: 18,
  },
  allowButton: {
    marginBottom: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 8,
    fontSize: 9,
    fontWeight: '700',
  },
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    width: '100%',
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  zoneChipText: {
    marginLeft: 4,
    fontSize: 11,
  },
  manualButton: {
    marginTop: 4,
  },
});
