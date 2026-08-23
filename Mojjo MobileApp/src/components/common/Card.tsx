import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useTheme } from '../../theme';
import { HapticsService } from '../../services/haptics';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'sunken';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  haptic?: boolean;
}

export const Card: React.FC<CardProps> = React.memo(({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 'md',
  haptic = true,
}) => {
  const { theme } = useTheme();

  const paddingValues = {
    none: 0,
    sm: 8,
    md: 14,
    lg: 20,
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadows.none,
        };
      case 'sunken':
        return {
          backgroundColor: theme.colors.surfaceSunken,
          borderWidth: 0,
          ...theme.shadows.none,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: theme.colors.surfaceRaised,
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadows.sm,
        };
    }
  };

  const cardStyles: StyleProp<ViewStyle> = [
    styles.base,
    {
      borderRadius: theme.borderRadius.xl,
      padding: paddingValues[padding],
    },
    getVariantStyles(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          if (haptic) HapticsService.light();
          onPress();
        }}
        style={cardStyles}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
});

Card.displayName = 'Card';

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
