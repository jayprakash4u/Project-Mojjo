import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Platform,
  KeyboardAvoidingView,
  RefreshControlProps,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../theme';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: readonly Edge[];
  backgroundColor?: string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = React.memo(({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'] as const,
  backgroundColor,
  refreshControl,
  keyboardShouldPersistTaps = 'handled',
  headerComponent,
  footerComponent,
}) => {
  const { theme, isDark } = useTheme();
  const bg = backgroundColor || theme.colors.background;

  const content = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.container, style]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {headerComponent}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {content}
      </KeyboardAvoidingView>
      {footerComponent}
    </SafeAreaView>
  );
});

ScreenWrapper.displayName = 'ScreenWrapper';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
