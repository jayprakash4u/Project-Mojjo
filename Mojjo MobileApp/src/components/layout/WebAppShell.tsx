import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions, ScaledSize } from 'react-native';
import { useTheme } from '../../theme';
import { WebFrameProvider } from './WebFrameContext';

/**
 * This app is designed for a phone-sized viewport. `Dimensions.get('window')`
 * on web resolves to the full browser window, so without this shell every
 * screen stretches edge-to-edge on a desktop browser instead of looking like
 * a phone. This wraps the app in a phone-width frame (centered, letterboxed)
 * whenever it's running on web in a wider-than-phone viewport, and is a
 * no-op on native (iOS/Android) and on narrow/mobile browsers.
 */
const MAX_CONTENT_WIDTH = 430;

export const WebAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const [windowWidth, setWindowWidth] = useState(() => Dimensions.get('window').width);
  const [frameNode, setFrameNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setWindowWidth(window.width);
    });
    return () => subscription.remove();
  }, []);

  if (Platform.OS !== 'web' || windowWidth <= MAX_CONTENT_WIDTH) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.backdrop, { backgroundColor: theme.colors.surfaceSunken }]}>
      <View
        // react-native-web forwards View refs to the underlying DOM node;
        // AppModal portals into it so overlays stay inside the frame.
        ref={setFrameNode as unknown as React.Ref<View>}
        style={[
          styles.frame,
          { backgroundColor: theme.colors.background },
          Platform.OS === 'web'
            ? ({ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 60px rgba(0,0,0,0.20)' } as object)
            : null,
        ]}
      >
        <WebFrameProvider value={frameNode}>{children}</WebFrameProvider>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: MAX_CONTENT_WIDTH,
    maxWidth: '100%',
    overflow: 'hidden',
  },
});
