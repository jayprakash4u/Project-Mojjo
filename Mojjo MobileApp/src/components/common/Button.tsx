import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { HapticsService } from '../../services/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  haptic?: boolean;
}

export const Button: React.FC<ButtonProps> = React.memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  haptic = true,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) {
      HapticsService.light();
    }
    onPress();
  };

  // Base sizing
  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: theme.borderRadius.md,
      },
      text: {
        fontSize: 13,
        fontWeight: '600',
      },
    },
    md: {
      container: {
        paddingVertical: 13,
        paddingHorizontal: 20,
        borderRadius: theme.borderRadius.lg,
      },
      text: {
        fontSize: 15,
        fontWeight: '600',
      },
    },
    lg: {
      container: {
        paddingVertical: 16,
        paddingHorizontal: 26,
        borderRadius: theme.borderRadius.xl,
      },
      text: {
        fontSize: 17,
        fontWeight: '700',
      },
    },
  };

  // Variant styling
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; spinnerColor: string } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.colors.secondary,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.onSecondary,
          },
          spinnerColor: theme.colors.onSecondary,
        };
      case 'accent':
        return {
          container: {
            backgroundColor: theme.colors.accent,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.onAccent,
          },
          spinnerColor: theme.colors.onAccent,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.colors.borderStrong,
          },
          text: {
            color: theme.colors.foreground,
          },
          spinnerColor: theme.colors.foreground,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: theme.colors.secondary,
          },
          spinnerColor: theme.colors.secondary,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: theme.colors.error,
            borderWidth: 0,
          },
          text: {
            color: '#FFFFFF',
          },
          spinnerColor: '#FFFFFF',
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: theme.colors.primary,
            borderWidth: 0,
          },
          text: {
            color: theme.colors.onPrimary,
          },
          spinnerColor: theme.colors.onPrimary,
        };
    }
  };

  const currentSize = sizeStyles[size];
  const currentVariant = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        currentSize.container,
        currentVariant.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentVariant.spinnerColor} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
          <Text
            style={[
              currentSize.text,
              currentVariant.text,
              disabled && { color: theme.colors.subtle },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
