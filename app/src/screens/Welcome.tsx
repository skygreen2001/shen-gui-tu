import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// ========================
// 类型定义
// ========================

type RootStackParamList = {
  Welcome: undefined;
  MainTabs: undefined;
  Crisis: undefined;
};

type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

// ========================
// 数据
// ========================

interface FeatureCard {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: FeatureCard[] = [
  { icon: '\uD83D\uDCCA', title: '每日追踪', desc: '6维度签到' },
  { icon: '\uD83D\uDC8A', title: '用药提醒', desc: '智能管理' },
  { icon: '\uD83D\uDEE1\uFE0F', title: '危机守护', desc: '一键求助' },
];

interface StatItem {
  value: string;
  label: string;
}

const STATS: StatItem[] = [
  { value: '50%', label: '复发率' },
  { value: '2年', label: '高发期' },
  { value: '85%', label: '可预防' },
];

// ========================
// 组件
// ========================

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function Welcome({ navigation }: WelcomeScreenProps) {
  const handleStart = useCallback(() => {
    navigation.replace('MainTabs');
  }, [navigation]);

  const handleHotline = useCallback(() => {
    Linking.openURL('tel:962525');
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero 区域 */}
        <View style={styles.hero}>
          <Animated.Text entering={FadeIn.duration(600)} style={styles.emoji}>
            {'\uD83C\uDF31'}
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(100).duration(600)}
            style={styles.brand}
          >
            申归途
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(200).duration(600)}
            style={styles.subtitle}
          >
            你的复发预防伙伴
          </Animated.Text>
        </View>

        {/* 功能卡片 */}
        <View style={styles.featuresRow}>
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInDown.delay(300 + index * 80).duration(500)}
              style={styles.featureCard}
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </Animated.View>
          ))}
        </View>

        {/* 分隔线 */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>数据支撑</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* 统计数据 */}
        <View style={styles.statsRow}>
          {STATS.map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeIn.delay(500 + index * 80).duration(500)}
              style={styles.statItem}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* CTA 按钮 */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(500)}
          style={styles.ctaContainer}
        >
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <Text style={styles.ctaButtonText}>开始使用</Text>
          </Pressable>
        </Animated.View>

        {/* 免责声明 */}
        <Animated.View
          entering={FadeIn.delay(900).duration(500)}
          style={styles.disclaimer}
        >
          <Text style={styles.disclaimerText}>
            本工具仅作为辅助支持，不替代专业医疗建议
          </Text>
          <Text style={styles.disclaimerText}>
            如需帮助请拨打{' '}
            <Text style={styles.hotlineLink} onPress={handleHotline}>
              心理热线 962525
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ========================
// 样式
// ========================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: spacing['2xl'],
  },

  // Hero 区域
  hero: {
    backgroundColor: colors.bgWarm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  brand: {
    fontFamily: typography.fontFamily,
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 8,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '400',
  },

  // 功能卡片
  featuresRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  featureDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // 分隔线
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
    paddingHorizontal: spacing.md,
  },

  // 统计数据
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // CTA 按钮
  ctaContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    ...shadows.md,
  },
  ctaButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  ctaButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },

  // 免责声明
  disclaimer: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  disclaimerText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.textHint,
    lineHeight: 18,
    textAlign: 'center',
  },
  hotlineLink: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
});
