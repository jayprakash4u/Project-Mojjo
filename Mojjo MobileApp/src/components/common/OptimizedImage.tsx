import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  StyleProp,
  ImageResizeMode,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export interface OptimizedImageProps {
  uri?: string | null;
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
  resizeMode?: ImageResizeMode;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  placeholderColor?: string;
  accessibilityLabel?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  uri,
  width = '100%',
  height = '100%',
  aspectRatio,
  resizeMode = 'cover',
  style,
  containerStyle,
  fallbackIcon = 'cube-outline',
  placeholderColor,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  const cleanUri = uri && typeof uri === 'string' && uri.trim().length > 0 ? uri.trim() : null;

  const effectivePlaceholder = placeholderColor || theme.colors.surfaceSunken;

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height: height as any,
          aspectRatio,
          backgroundColor: effectivePlaceholder,
        },
        containerStyle,
      ]}
    >
      {cleanUri && !hasError ? (
        <Image
          source={{ uri: cleanUri }}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onError={() => setHasError(true)}
          accessibilityLabel={accessibilityLabel}
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Ionicons
            name={fallbackIcon}
            size={typeof height === 'number' ? Math.min(height * 0.45, 32) : 28}
            color={theme.colors.muted}
          />
        </View>
      )}
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
