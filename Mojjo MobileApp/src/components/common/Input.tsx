import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme';
import { Text, Caption } from './Typography';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  clearable?: boolean;
  onClear?: () => void;
  /** Overrides the default gray/focus-teal border with a fixed color (e.g. an always-on brand-colored outline). Existing callers are unaffected unless they pass this. */
  borderColor?: string;
}

export const Input: React.FC<InputProps> = React.memo(({
  label,
  error,
  prefix,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  clearable = false,
  onClear,
  value,
  onChangeText,
  secureTextEntry,
  borderColor,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const hasValue = Boolean(value && value.length > 0);

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (borderColor) return borderColor;
    if (isFocused) return theme.colors.secondary;
    return theme.colors.border;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text
          weight="600"
          size={13}
          style={[styles.label, { color: error ? theme.colors.error : theme.colors.foreground }]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: getBorderColor(),
            borderRadius: theme.borderRadius.lg,
          },
        ]}
      >
        {leftIcon ? <View style={styles.iconWrapper}>{leftIcon}</View> : null}

        {prefix ? (
          <View style={[styles.prefixWrapper, { borderRightColor: theme.colors.border }]}>
            <Text weight="600" size={14} color={theme.colors.muted}>
              {prefix}
            </Text>
          </View>
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.subtle}
          secureTextEntry={isSecure}
          style={[
            styles.input,
            {
              color: theme.colors.foreground,
              fontFamily: theme.typography.presets.body.fontFamily,
            },
            inputStyle,
          ]}
          {...props}
        />

        {clearable && hasValue ? (
          <TouchableOpacity
            onPress={() => {
              if (onClear) onClear();
              else if (onChangeText) onChangeText('');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionIcon}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.subtle} />
          </TouchableOpacity>
        ) : null}

        {secureTextEntry !== undefined ? (
          <TouchableOpacity
            onPress={() => setIsSecure((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionIcon}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={theme.colors.muted}
            />
          </TouchableOpacity>
        ) : null}

        {rightIcon && secureTextEntry === undefined ? (
          <View style={styles.iconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Caption color={theme.colors.error} style={styles.errorText}>
          {error}
        </Caption>
      ) : null}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 0,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          boxShadow: 'none',
        } as any)
      : {}),
  },
  iconWrapper: {
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixWrapper: {
    paddingRight: 10,
    marginRight: 6,
    borderRightWidth: 1,
    justifyContent: 'center',
  },
  actionIcon: {
    padding: 4,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 2,
  },
});
