import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, Text, Caption } from '../common/Typography';
import { Badge } from '../common/Badge';
import { useTheme } from '../../theme';
import { OrderStageMilestone } from '../../services/delivery/orderNotificationManager';

interface InAppOrderStatusBannerProps {
  stage: OrderStageMilestone | null;
  onDismiss: () => void;
  orderNumber?: string;
}

export const InAppOrderStatusBanner: React.FC<InAppOrderStatusBannerProps> = ({
  stage,
  onDismiss,
  orderNumber = 'MJ-8921',
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stage) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!stage) return null;

  const isCompleted = stage.stageNumber === 6;

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: '#0F172A',
          borderColor: isCompleted ? theme.colors.success : theme.colors.accent,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              borderColor: isCompleted ? theme.colors.success : theme.colors.accent,
            },
          ]}
        >
          <Ionicons
            name={(stage.icon as any) || 'notifications'}
            size={22}
            color={isCompleted ? theme.colors.success : theme.colors.accent}
          />
        </View>

        <View style={styles.textColumn}>
          <View style={styles.headerLine}>
            <Badge
              label={stage.badgeLabel}
              variant={isCompleted ? 'success' : 'accent'}
              size="sm"
            />
            <Caption color="#94A3B8" style={styles.orderNumberText}>
              Order #{orderNumber}
            </Caption>
          </View>

          <Heading level={4} color="#F8FAFC" style={styles.title}>
            {stage.title}
          </Heading>

          <Text size={12} color="#CBD5E1" numberOfLines={2}>
            {stage.notificationMessage}
          </Text>
        </View>

        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
    marginRight: 8,
  },
  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumberText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  title: {
    marginBottom: 2,
  },
  closeBtn: {
    padding: 4,
  },
});
