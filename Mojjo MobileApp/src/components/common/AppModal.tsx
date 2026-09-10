import React from 'react';
import { Modal as RNModal, ModalProps, Platform, View, StyleSheet } from 'react-native';
import { useWebFrameNode } from '../layout/WebFrameContext';

/**
 * Drop-in replacement for React Native's `Modal`. On native it behaves
 * identically. On web, RN's `Modal` always portals into `document.body`
 * (react-native-web hardcodes this — there's no prop to redirect it), which
 * breaks it out of the phone-width frame WebAppShell renders on desktop
 * browsers: the modal ends up full browser width instead of confined to the
 * app frame. When a frame is active, this portals into the frame's own DOM
 * node instead, so bottom sheets and dialogs stay inside it.
 */
export const AppModal: React.FC<ModalProps> = ({ visible, children, ...rest }) => {
  const frameNode = useWebFrameNode();

  if (Platform.OS === 'web' && frameNode) {
    if (!visible) return null;
    // Required lazily so native bundles never pull in react-dom.
    const { createPortal } = require('react-dom');
    return createPortal(
      <View style={StyleSheet.absoluteFill}>{children}</View>,
      frameNode
    );
  }

  return (
    <RNModal visible={visible} {...rest}>
      {children}
    </RNModal>
  );
};
