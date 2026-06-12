import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// ========================
// 色彩系统
// ========================
export const colors = {
  primary: '#4A90D9',
  primaryLight: '#A8CCE8',
  primaryDark: '#2C6FB5',
  accent: '#E8985E',
  accentLight: '#F5C9A0',
  bg: '#F8F6F2',
  bgWarm: '#FDF8F0',
  surface: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textHint: '#B2BEC3',
  border: '#E8E4DE',
  success: '#6BAF7A',
  warning: '#E8C95A',
  danger: '#D46B6B',
};

// ========================
// 间距系统
// ========================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// ========================
// 圆角系统
// ========================
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// ========================
// 阴影系统
// ========================
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
};

// ========================
// 字体系统
// ========================
export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif',
};

// ========================
// 布局常量
// ========================
export const layout = {
  navHeight: 64,
  crisisSize: 56,
  maxWidth: 480,
};

// ========================
// 类型导出
// ========================
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeRadius = typeof radius;
export type ThemeShadows = typeof shadows;
export type ThemeTypography = typeof typography;
export type ThemeLayout = typeof layout;
