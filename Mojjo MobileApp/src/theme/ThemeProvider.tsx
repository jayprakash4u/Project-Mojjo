import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './themes';
import { ThemeContextValue, ThemeMode } from './types';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  // Always start in light mode regardless of the device/browser's system
  // preference. Pass initialMode="system" explicitly to opt back into
  // following the OS appearance.
  initialMode = 'light',
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const theme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      isDark,
      setMode,
    }),
    [theme, mode, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback gracefully to lightTheme if outside provider
    return {
      theme: lightTheme,
      mode: 'light',
      isDark: false,
      setMode: () => {},
    };
  }
  return context;
};
