import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Heading, Caption, Text } from '../common/Typography';
import { HapticsService } from '../../services/haptics';
import { useCartItemCount } from '../../store/cartStore';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showCart?: boolean;
  onCartPress?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  showCart = false,
  onCartPress,
  style,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const totalItemCount = useCartItemCount();

  const handleBack = () => {
    HapticsService.light();
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleWrapper}>
          {title ? (
            <Heading level={3} numberOfLines={1}>
              {title}
            </Heading>
          ) : null}
          {subtitle ? (
            <Caption numberOfLines={1} color={theme.colors.muted}>
              {subtitle}
            </Caption>
          ) : null}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {showCart ? (
          <TouchableOpacity
            onPress={() => {
              HapticsService.light();
              if (onCartPress) {
                onCartPress();
              } else {
                // @ts-expect-error type-safe navigation fallback
                navigation.navigate('Cart');
              }
            }}
            style={styles.cartButton}
          >
            <Ionicons name="bag-handle-outline" size={24} color={theme.colors.foreground} />
            {totalItemCount > 0 ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.secondary },
                ]}
              >
                <Text size={10} weight="700" color="#FFFFFF">
                  {totalItemCount > 99 ? '99+' : totalItemCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : null}

        {rightAction}
      </View>
    </View>
  );
});

Header.displayName = 'Header';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 2,
  },
  titleWrapper: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    padding: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
});
