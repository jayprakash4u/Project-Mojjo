import { useTheme } from './ThemeProvider';

export { useTheme };

export const useColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

export const useTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

export const useSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};
