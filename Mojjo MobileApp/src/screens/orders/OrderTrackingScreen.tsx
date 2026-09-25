import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Header } from '../../components/layout/Header';
import { Heading, Text, Caption } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LiveDeliveryMap } from '../../components/delivery/LiveDeliveryMap';
import { InAppOrderStatusBanner } from '../../components/delivery/InAppOrderStatusBanner';
import { useOrderLiveTracking } from '../../hooks/useOrderLiveTracking';
import { ORDER_STAGE_MILESTONES } from '../../services/delivery/orderNotificationManager';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

export const OrderTrackingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const orderId = route.params?.orderId || 'MJ-8921';

  const {
    trackingState,
    currentStageIndex,
    activeNotification,
    dismissNotification,
    simulateNextStage,
    toggleSimulation,
  } = useOrderLiveTracking({
    orderId,
  });

  const handleCallRider = () => {
    Linking.openURL('tel:+9779801122334');
  };

  const handleSupportChat = () => {
    Linking.openURL(
      'https://wa.me/9779800000000?text=Hi%20Mojjo%20Support%2C%20I%20need%20help%20with%20order%20' +
        orderId
    );
  };

  const isDelivered = currentStageIndex === 5;
  const isNearDoor = currentStageIndex === 4;

  return (
    <ScreenWrapper
      headerComponent={
        <Header showBack onBack={() => navigation.goBack()} title="Live Order Tracking" />
      }
      scrollable
      contentContainerStyle={styles.container}
    >
      {/* Real-Time In-App Order Status Notification Banner */}
      <InAppOrderStatusBanner
        stage={activeNotification}
        onDismiss={dismissNotification}
        orderNumber={orderId}
      />

      {/* ETA Header Card */}
      <Card
        variant="elevated"
        style={[styles.etaCard, { backgroundColor: theme.colors.primary }]}
        padding="lg"
      >
        <View style={styles.etaHeaderRow}>
          <View style={styles.etaTextCol}>
            <Badge
              label={
                isDelivered
                  ? '🎉 ORDER COMPLETED'
                  : isNearDoor
                  ? '🏠 AT YOUR DOORSTEP'
                  : '⚡ 10-MIN FLASH DELIVERY'
              }
              variant={isDelivered ? 'success' : isNearDoor ? 'warning' : 'accent'}
              size="sm"
              style={styles.flashBadge}
            />
            <Heading level={1} color={theme.colors.onPrimary} style={styles.etaTitle}>
              {isDelivered
                ? 'Delivered 🎉'
                : isNearDoor
                ? 'At Doorstep 🏠'
                : `${trackingState.estimatedMinutes} Mins`}
            </Heading>
            <Caption color={theme.colors.onPrimaryMuted}>
              Order #{orderId} • {isDelivered ? 'Delivered successfully' : `${trackingState.distanceRemainingKm} km away from doorstep`}
            </Caption>
          </View>

          <View style={[styles.etaIconCircle, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons
              name={isDelivered ? 'checkmark-circle' : isNearDoor ? 'home' : 'bicycle'}
              size={36}
              color={theme.colors.accent}
            />
          </View>
        </View>
      </Card>

      {/* Real-Time Interactive Live Delivery Map with Moving Rider */}
      <LiveDeliveryMap
        trackingState={trackingState}
        onToggleSimulation={toggleSimulation}
        orderNumber={orderId}
        driverName="Bikash Maharjan"
      />

      {/* Interactive Order Status Simulator Bar */}
      <Card style={styles.simulatorCard} padding="md">
        <View style={styles.simulatorHeaderRow}>
          <View style={styles.simTitleCol}>
            <View style={styles.simBadgeRow}>
              <Ionicons name="notifications" size={16} color={theme.colors.accent} />
              <Text weight="700" size={13} color={theme.colors.foreground}>
                Live Order-Status Notifications
              </Text>
            </View>
            <Caption color={theme.colors.muted}>
              Test automatic stage alerts as order progresses
            </Caption>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={simulateNextStage}
            style={[styles.simStepButton, { backgroundColor: theme.colors.accent }]}
          >
            <Text weight="800" size={12} color="#0F172A">
              Next Stage ➔
            </Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Mini Stage Indicator Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stagePillsRow}>
          {ORDER_STAGE_MILESTONES.map((m, idx) => {
            const isCurrent = idx === currentStageIndex;
            const isPassed = idx < currentStageIndex;

            return (
              <View
                key={m.key}
                style={[
                  styles.miniStagePill,
                  isCurrent && {
                    backgroundColor: theme.colors.accentSoft,
                    borderColor: theme.colors.accent,
                  },
                  isPassed && {
                    backgroundColor: theme.colors.surfaceRaised,
                    borderColor: theme.colors.success,
                  },
                  !isCurrent && !isPassed && {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={isPassed ? 'checkmark-circle' : (m.icon as any)}
                  size={12}
                  color={
                    isPassed
                      ? theme.colors.success
                      : isCurrent
                      ? theme.colors.accent
                      : theme.colors.muted
                  }
                  style={styles.miniPillIcon}
                />
                <Caption
                  bold={isCurrent}
                  color={
                    isPassed
                      ? theme.colors.success
                      : isCurrent
                      ? theme.colors.foreground
                      : theme.colors.muted
                  }
                >
                  {m.title}
                </Caption>
              </View>
            );
          })}
        </ScrollView>
      </Card>

      {/* Courier Partner Info Card */}
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
            <View style={styles.riderTitleRow}>
              <Text weight="700" size={15}>
                Bikash Maharjan
              </Text>
              <Badge label="GPS Active" variant="success" size="sm" style={styles.gpsBadge} />
            </View>
            <Caption color={theme.colors.muted}>Delivery Partner • ⭐ 4.9 (520+ orders)</Caption>
            <Caption color={theme.colors.secondary} bold>
              Vehicle: Yamaha FZ-S (Ba 92 Pa 4321)
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

      {/* Full 6-Stage Lifecycle Timeline Stepper */}
      <Card style={styles.timelineCard} padding="lg">
        <Heading level={4} style={styles.timelineHeader}>
          Order Status Lifecycle
        </Heading>

        <View style={styles.timelineContainer}>
          {ORDER_STAGE_MILESTONES.map((step, idx) => {
            const isDone = idx < currentStageIndex || (idx === currentStageIndex && currentStageIndex === 5);
            const isActive = idx === currentStageIndex && currentStageIndex !== 5;
            const isLast = idx === ORDER_STAGE_MILESTONES.length - 1;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeftCol}>
                  <View
                    style={[
                      styles.stepDot,
                      isDone && { backgroundColor: theme.colors.success },
                      isActive && {
                        backgroundColor: theme.colors.accent,
                        borderWidth: 3,
                        borderColor: theme.colors.accentSoft,
                      },
                      !isDone && !isActive && { backgroundColor: theme.colors.border },
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name={step.icon as any}
                        size={10}
                        color={isActive ? '#0F172A' : '#94A3B8'}
                      />
                    )}
                  </View>
                  {!isLast ? (
                    <View
                      style={[
                        styles.stepLine,
                        { backgroundColor: isDone ? theme.colors.success : theme.colors.border },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.stepContent}>
                  <View style={styles.stepTitleRow}>
                    <Text
                      weight={isActive ? '700' : isDone ? '600' : '500'}
                      size={14}
                      color={
                        isActive
                          ? theme.colors.foreground
                          : isDone
                          ? theme.colors.foreground
                          : theme.colors.muted
                      }
                    >
                      {step.title}
                    </Text>
                    <Caption color={isActive ? theme.colors.accent : theme.colors.subtle}>
                      {step.timeEstimate}
                    </Caption>
                  </View>
                  <Caption color={isActive ? theme.colors.foreground : theme.colors.muted}>
                    {step.subtitle}
                  </Caption>
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
              House #14, Jhamsikhel Road, Ward 3, Lalitpur (Near St. Mary's School)
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

      {/* Help & Support CTA */}
      <Button
        title="Need Help with this Delivery? 💬"
        variant="ghost"
        size="md"
        fullWidth
        onPress={handleSupportChat}
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
  etaTextCol: {
    flex: 1,
    marginRight: 8,
  },
  flashBadge: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  etaTitle: {
    marginBottom: 4,
  },
  etaIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulatorCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  simulatorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  simTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  simBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  simStepButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stagePillsRow: {
    flexDirection: 'row',
  },
  miniStagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  miniPillIcon: {
    marginRight: 4,
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
  riderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  gpsBadge: {
    marginLeft: 6,
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
    width: 22,
    height: 22,
    borderRadius: 11,
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
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
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
