import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { formatNPR } from '../../utils/currency';

export interface BaseTextProps extends RNTextProps {
  color?: string;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  size?: number;
}

export const Text: React.FC<BaseTextProps> = React.memo(({
  style,
  color,
  weight,
  align,
  size,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  return (
    <RNText
      style={[
        styles.base,
        {
          color: color || theme.colors.foreground,
          textAlign: align || 'left',
          ...(weight ? { fontWeight: weight } : {}),
          ...(size ? { fontSize: size, lineHeight: Math.round(size * 1.35) } : {}),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
});
Text.displayName = 'Text';

export const Heading: React.FC<
  BaseTextProps & { level?: 1 | 2 | 3 | 4 }
> = React.memo(({ level = 1, style, color, children, ...props }) => {
  const { theme } = useTheme();
  const presetKey = (`h${level}` as const);
  const preset = theme.typography.presets[presetKey];

  return (
    <RNText
      style={[
        preset,
        { color: color || theme.colors.foreground },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
});
Heading.displayName = 'Heading';

export const Subheading: React.FC<BaseTextProps> = React.memo(({ style, color, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <RNText
      style={[
        theme.typography.presets.bodyLarge,
        { color: color || theme.colors.muted },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
});
Subheading.displayName = 'Subheading';

export const Caption: React.FC<BaseTextProps & { bold?: boolean }> = React.memo(({
  bold,
  style,
  color,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const preset = bold
    ? theme.typography.presets.captionBold
    : theme.typography.presets.caption;

  return (
    <RNText
      style={[
        preset,
        { color: color || theme.colors.muted },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
});
Caption.displayName = 'Caption';

export const PriceText: React.FC<{
  amount: number;
  originalAmount?: number;
  size?: 'sm' | 'md' | 'lg';
  style?: TextStyle;
}> = React.memo(({ amount, originalAmount, size = 'md', style }) => {
  const { theme } = useTheme();

  const sizeStyle: TextStyle =
    size === 'lg'
      ? theme.typography.presets.priceLarge
      : size === 'sm'
      ? theme.typography.presets.captionBold
      : theme.typography.presets.price;

  return (
    <RNText style={[styles.priceRow, style]}>
      <RNText style={[sizeStyle, { color: theme.colors.primary }]}>
        {formatNPR(amount)}
      </RNText>
      {originalAmount && originalAmount > amount ? (
        <RNText
          style={[
            theme.typography.presets.caption,
            styles.strikethrough,
            { color: theme.colors.subtle },
          ]}
        >
          {` ${formatNPR(originalAmount)}`}
        </RNText>
      ) : null}
    </RNText>
  );
});
PriceText.displayName = 'PriceText';

const styles = StyleSheet.create({
  base: {
    fontSize: 15,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
});
