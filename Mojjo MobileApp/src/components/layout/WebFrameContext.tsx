import React, { createContext, useContext } from 'react';

/**
 * Holds the DOM node of the phone-width frame that WebAppShell renders on
 * wide web viewports (null on native, and on web when no frame is active).
 * AppModal portals into this node instead of `document.body` so overlays
 * stay confined to the phone frame instead of covering the full browser
 * window. See WebAppShell.tsx for why the frame exists at all.
 */
const WebFrameContext = createContext<HTMLElement | null>(null);

export const WebFrameProvider = WebFrameContext.Provider;

export const useWebFrameNode = (): HTMLElement | null => useContext(WebFrameContext);
