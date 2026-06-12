import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors, spacing, radius, shadows, typography } from './theme';

const globalStyles = StyleSheet.create({
  // ========================
  // 容器
  // ========================
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  } as ViewStyle,

  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  } as ViewStyle,

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  // ========================
  // 卡片
  // ========================
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  } as ViewStyle,

  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.md,
  } as ViewStyle,

  cardFlat: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,

  // ========================
  // 文字
  // ========================
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 28,
  } as TextStyle,

  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 24,
  } as TextStyle,

  body: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  } as TextStyle,

  caption: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '400',
    color: colors.textHint,
    lineHeight: 16,
  } as TextStyle,

  // ========================
  // 按钮
  // ========================
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  buttonPrimaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  } as TextStyle,

  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  } as ViewStyle,

  buttonSecondaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  } as TextStyle,

  buttonDanger: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  buttonDangerText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  } as TextStyle,

  // ========================
  // 输入框
  // ========================
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
  } as TextStyle,

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  } as ViewStyle,

  // ========================
  // 分隔线
  // ========================
  divider: {
    height: 1,
    backgroundColor: colors.border,
  } as ViewStyle,

  dividerThick: {
    height: 8,
    backgroundColor: colors.bg,
  } as ViewStyle,

  // ========================
  // 标签/徽章
  // ========================
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
  } as ViewStyle,

  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '500',
    color: colors.primaryDark,
  } as TextStyle,

  // ========================
  // 安全区域底部填充
  // ========================
  bottomSpacer: {
    height: spacing['2xl'],
  } as ViewStyle,

  // ========================
  // 危机按钮（悬浮）
  // ========================
  crisisButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  } as ViewStyle,

  // ========================
  // 空状态
  // ========================
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  } as ViewStyle,

  emptyStateText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textHint,
    marginTop: spacing.md,
  } as TextStyle,
});

export default globalStyles;
