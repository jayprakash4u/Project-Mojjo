import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = React.memo(({
  label,
  variant = 'secondary',
  style,
  textStyle,
  size = 'md',
}) => {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          text: theme.colors.onPrimary,
          border: 'transparent',
        };
      case 'accent':
        return {
          bg: theme.colors.accentSoft,
          text: theme.colors.accent,
          border: 'transparent',
        };
      case 'success':
        return {
          bg: theme.colors.successSoft,
          text: theme.colors.success,
          border: 'transparent',
        };
      case 'warning':
        return {
          bg: theme.colors.warningSoft,
          text: theme.colors.warning,
          border: 'transparent',
        };
      case 'error':
        return {
          bg: theme.colors.errorSoft,
          text: theme.colors.error,
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: theme.colors.muted,
          border: theme.colors.border,
        };
      case 'secondary':
      default:
        return {
          bg: theme.colors.secondarySoft,
          text: theme.colors.secondary,
          border: 'transparent',
        };
    }
  };

  const { bg, text, border } = getColors();

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: theme.borderRadius.full,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
        style,
      ]}
    >
      <Text
        style={[
          theme.typography.presets.badge,
          {
            color: text,
            fontSize: isSmall ? 10 : 11,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
