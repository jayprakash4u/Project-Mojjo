import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption, PriceText } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatNPR } from '../../utils/currency';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

const TRACKING_STEPS = [
  { key: 'placed', title: 'Order Confirmed', time: '11:05 AM', done: true },
  { key: 'preparing', title: 'Items Packed Fresh (Dark Store)', time: '11:07 AM', done: true },
  { key: 'delivery', title: 'Rider is on the way 🛵', time: '11:09 AM', active: true, done: false },
  { key: 'arrived', title: 'Delivered at Doorstep', time: 'Est. 11:15 AM', done: false },
];

export const OrderTrackingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const orderId = route.params?.orderId || 'MJ-8921';

  const handleCallRider = () => {
    Linking.openURL('tel:+9779812345678');
  };

  return (
    <ScreenWrapper
      headerComponent={<Header showBack onBack={() => navigation.goBack()} title="Live Order Tracking" />}
      scrollable
      contentContainerStyle={styles.container}
    >
      {/* ETA Header Card */}
      <Card
        variant="elevated"
        style={[styles.etaCard, { backgroundColor: theme.colors.primary }]}
        padding="lg"
      >
        <View style={styles.etaHeaderRow}>
          <View>
            <Badge label="⚡ 10-MIN FLASH DELIVERY" variant="accent" size="sm" style={styles.flashBadge} />
            <Heading level={1} color={theme.colors.onPrimary} style={styles.etaTitle}>
              8-10 Mins
            </Heading>
            <Caption color={theme.colors.onPrimaryMuted}>
              Order #{orderId} • Delivering to Jhamsikhel
            </Caption>
          </View>

          <View style={[styles.etaIconCircle, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="bicycle" size={36} color={theme.colors.accent} />
          </View>
        </View>
      </Card>

      {/* Courier Info Card */}
      <Card style={styles.courierCard} padding="md">
        <View style={styles.courierRow}>
          <View
            style={[
              styles.courierAvatar,
              { backgroundColor: theme.colors.secondarySoft },
            ]}
          >
            <Ionicons name="person" size={28} color={theme.colors.secondary} />
          </View>

          <View style={styles.courierDetails}>
            <Text weight="700" size={15}>
              Bikash Maharjan
            </Text>
            <Caption color={theme.colors.muted}>Delivery Partner • ⭐ 4.9 (520+ orders)</Caption>
            <Caption color={theme.colors.secondary} bold>
              Vehicle: Ba 92 Pa 4321
            </Caption>
          </View>

          <TouchableOpacity
            onPress={handleCallRider}
            style={[
              styles.callButton,
              { backgroundColor: theme.colors.secondarySoft, borderColor: theme.colors.secondary },
            ]}
          >
            <Ionicons name="call" size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Progress Timeline Stepper */}
      <Card style={styles.timelineCard} padding="lg">
        <Heading level={4} style={styles.timelineHeader}>
          Order Status
        </Heading>

        <View style={styles.timelineContainer}>
          {TRACKING_STEPS.map((step, idx) => {
            const isLast = idx === TRACKING_STEPS.length - 1;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeftCol}>
                  <View
                    style={[
                      styles.stepDot,
                      step.done && { backgroundColor: theme.colors.success },
                      step.active && {
                        backgroundColor: theme.colors.accent,
                        borderWidth: 3,
                        borderColor: theme.colors.accentSoft,
                      },
                      !step.done && !step.active && { backgroundColor: theme.colors.border },
                    ]}
                  >
                    {step.done ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : null}
                  </View>
                  {!isLast ? (
                    <View
                      style={[
                        styles.stepLine,
                        { backgroundColor: step.done ? theme.colors.success : theme.colors.border },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.stepContent}>
                  <Text
                    weight={step.active ? '700' : '600'}
                    size={14}
                    color={step.active ? theme.colors.foreground : theme.colors.muted}
                  >
                    {step.title}
                  </Text>
                  <Caption color={theme.colors.subtle}>{step.time}</Caption>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Delivery Address & Items Summary */}
      <Card style={styles.summaryCard} padding="md">
        <View style={styles.summaryRow}>
          <Ionicons name="location-outline" size={20} color={theme.colors.secondary} />
          <View style={styles.summaryText}>
            <Text weight="700" size={13}>
              Delivery Address
            </Text>
            <Caption color={theme.colors.muted}>
              Jhamsikhel Rd, Ward 3, Lalitpur (Near St. Mary's School)
            </Caption>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.summaryRow}>
          <Ionicons name="receipt-outline" size={20} color={theme.colors.info} />
          <View style={styles.summaryText}>
            <Text weight="700" size={13}>
              Items (3 items) • Paid via eSewa
            </Text>
            <Caption color={theme.colors.muted}>
              Real Fruit Juice (1L), Wai Wai 12-Pack, DDC Butter
            </Caption>
          </View>
        </View>
      </Card>

      {/* Need Help CTA */}
      <Button
        title="Need Help with this Order? 💬"
        variant="ghost"
        size="md"
        fullWidth
        onPress={() => {}}
        style={styles.helpButton}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  etaCard: {
    marginBottom: 16,
    borderRadius: 18,
  },
  etaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flashBadge: {
    marginBottom: 8,
  },
  etaTitle: {
    marginBottom: 4,
  },
  etaIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  courierDetails: {
    flex: 1,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  timelineCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  timelineHeader: {
    marginBottom: 16,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepLeftCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  summaryText: {
    marginLeft: 10,
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  helpButton: {
    marginBottom: 16,
  },
});
