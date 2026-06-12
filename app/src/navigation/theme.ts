import { DefaultTheme } from '@react-navigation/native';
import { colors } from '../styles/theme';

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: {
    regular: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif',
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif',
      fontWeight: '900' as const,
    },
  },
};
