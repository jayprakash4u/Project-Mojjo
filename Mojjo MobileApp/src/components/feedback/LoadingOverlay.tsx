import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../common/Typography';
import { AppModal } from '../common/AppModal';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <AppModal transparent animationType="fade" visible={visible}>
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surfaceRaised, ...theme.shadows.xl },
          ]}
        >
          <ActivityIndicator size="large" color={theme.colors.secondary} />
          {message ? (
            <Text
              weight="600"
              style={[styles.message, { color: theme.colors.foreground }]}
            >
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  message: {
    marginTop: 12,
  },
});
