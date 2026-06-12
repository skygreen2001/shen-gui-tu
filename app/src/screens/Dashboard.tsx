import React, { useMemo, useCallback } from 'react';
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
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';
import useRiskLevel from '../hooks/useRiskLevel';
import useCheckIn from '../hooks/useCheckIn';
import useMedication from '../hooks/useMedication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// ========================
// 类型定义
// ========================

type DashboardStackParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  WRAPPlan: undefined;
};

type DashboardScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'Dashboard'
>;

// ========================
// 常量
// ========================

const DIM_COLORS: Record<string, string> = {
  sleep: '#4A90D9',
  mood: '#E8985E',
  body: '#6BAF7A',
  motivation: '#9B59B6',
  cognition: '#E8C95A',
  social: '#E74C3C',
};

const DIM_KEYS = ['sleep', 'mood', 'body', 'motivation', 'cognition', 'social'];

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

// ========================
// 子组件: RiskGauge
// ========================

interface RiskGaugeProps {
  score: number;
  level: string;
  color: string;
  label: string;
}

function RiskGauge({ score, level, color, label }: RiskGaugeProps) {
  const gaugeProgress = useSharedValue(0);

  // 动画效果：分数从 0 增长到实际值
  const animatedWidth = useAnimatedStyle(() => {
    const w = withSpring(gaugeProgress.value, {
      damping: 12,
      stiffness: 80,
    });
    return {
      width: `${w}%`,
    };
  });

  // 设置进度值
  React.useEffect(() => {
    gaugeProgress.value = score;
  }, [score, gaugeProgress]);

  const isUnknown = level === 'unknown';

  return (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeHeader}>
        <Text style={styles.gaugeTitle}>综合状态评分</Text>
        <View
          style={[
            styles.gaugeBadge,
            { backgroundColor: isUnknown ? colors.border : color + '20' },
          ]}
        >
          <Text
            style={[
              styles.gaugeBadgeText,
              { color: isUnknown ? colors.textHint : color },
            ]}
          >
            {label}
          </Text>
        </View>
      </View>
      <View style={styles.gaugeBarBg}>
        <Animated.View
          style={[
            styles.gaugeBarFill,
            animatedWidth,
            {
              backgroundColor: isUnknown ? colors.border : color,
            },
          ]}
        />
      </View>
      <View style={styles.gaugeFooter}>
        <Text style={styles.gaugeScore}>
          {isUnknown ? '--' : score}
        </Text>
        <Text style={styles.gaugeScoreLabel}>/ 100</Text>
      </View>
    </View>
  );
}

// ========================
// 子组件: TrendChart
// ========================

interface TrendChartProps {
  data: number[][];
}

function TrendChart({ data }: TrendChartProps) {
  return (
    <View style={styles.trendChart}>
      {DAY_LABELS.map((day, dayIndex) => (
        <View key={day} style={styles.trendDay}>
          <View style={styles.trendBars}>
            {DIM_KEYS.map((_, dimIndex) => {
              const value = data[dayIndex]?.[dimIndex] || 0;
              const barHeight = value * 12;
              return (
                <View
                  key={dimIndex}
                  style={[
                    styles.trendBar,
                    {
                      height: Math.max(2, barHeight),
                      backgroundColor: DIM_COLORS[DIM_KEYS[dimIndex]],
                      opacity: value > 0 ? 0.7 : 0.2,
                    },
                  ]}
                />
              );
            })}
          </View>
          <Text style={styles.trendDayLabel}>{day}</Text>
        </View>
      ))}
    </View>
  );
}

// ========================
// 主组件: Dashboard
// ========================

export default function Dashboard({ navigation }: DashboardScreenProps) {
  const { checkIns, getRecentCheckIns, getTodayCheckIn, getStreak } =
    useCheckIn();
  const { getAdherenceRate } = useMedication();
  const recent = getRecentCheckIns(7);
  const adherence = getAdherenceRate(30);
  const streak = getStreak();
  const hasCheckedToday = !!getTodayCheckIn();

  const { score, level, color, label } = useRiskLevel(checkIns);

  // 趋势数据：7天 x 6维度
  const trendData = useMemo(() => {
    const data: number[][] = Array.from({ length: 7 }, () =>
      Array(6).fill(0),
    );
    recent.forEach((ci, idx) => {
      if (idx < 7) {
        DIM_KEYS.forEach((key, di) => {
          data[idx][di] = ci.dimensions?.[key] || 0;
        });
      }
    });
    return data;
  }, [recent]);

  const handleCheckIn = useCallback(() => {
    navigation.navigate('CheckIn');
  }, [navigation]);

  const handleWrap = useCallback(() => {
    navigation.navigate('WRAPPlan');
  }, [navigation]);

  const handleHotline = useCallback(() => {
    Linking.openURL('tel:962525');
  }, []);

  const showWarning = level === 'red' || level === 'orange';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* 头部问候 */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>你好 {'\uD83D\uDC4B'}</Text>
          <Text style={styles.headerSubtitle}>今天感觉怎么样？</Text>
        </Animated.View>

        {/* 风险仪表盘 */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.section}
        >
          <RiskGauge score={score} level={level} color={color} label={label} />
        </Animated.View>

        {/* 今日签到按钮 */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.section}
        >
          <Pressable
            onPress={handleCheckIn}
            style={({ pressed }) => [
              styles.checkInButton,
              hasCheckedToday ? styles.checkInButtonChecked : styles.checkInButtonActive,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text
              style={[
                styles.checkInButtonText,
                hasCheckedToday
                  ? styles.checkInButtonTextChecked
                  : styles.checkInButtonTextActive,
              ]}
            >
              {hasCheckedToday
                ? '\u2705 今日已签到（点击查看）'
                : '\uD83D\uDCCB 开始今日签到'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* 统计卡片 */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.statsRow}
        >
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {streak}
            </Text>
            <Text style={styles.statLabel}>打卡天数</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {adherence}%
            </Text>
            <Text style={styles.statLabel}>用药依从率</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {recent.length}
            </Text>
            <Text style={styles.statLabel}>本周记录</Text>
          </View>
        </Animated.View>

        {/* 7天趋势图 */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>近7天趋势</Text>
          <View style={styles.trendContainer}>
            <TrendChart data={trendData} />
          </View>
          {/* 维度图例 */}
          <View style={styles.legendRow}>
            {DIM_KEYS.map((key) => (
              <View key={key} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: DIM_COLORS[key] },
                  ]}
                />
                <Text style={styles.legendText}>
                  {
                    {
                      sleep: '睡眠',
                      mood: '情绪',
                      body: '身体',
                      motivation: '动力',
                      cognition: '认知',
                      social: '社交',
                    }[key]
                  }
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* 风险警告横幅 */}
        {showWarning && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.riskBanner}
          >
            <Text style={styles.riskBannerIcon}>{'\u26A0\uFE0F'}</Text>
            <Text style={styles.riskBannerText}>
              您的状态评分偏低，建议联系医生或拨打{' '}
              <Text
                style={styles.riskBannerHotline}
                onPress={handleHotline}
              >
                962525
              </Text>
            </Text>
          </Animated.View>
        )}

        {/* WRAP 计划入口 */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.section}
        >
          <Pressable
            onPress={handleWrap}
            style={({ pressed }) => [
              styles.wrapEntry,
              pressed && styles.wrapEntryPressed,
            ]}
          >
            <Text style={styles.wrapEntryIcon}>{'\uD83D\uDCDD'}</Text>
            <View style={styles.wrapEntryText}>
              <Text style={styles.wrapEntryTitle}>
                WRAP 个人危机预防计划
              </Text>
              <Text style={styles.wrapEntryDesc}>
                制定你的个人康复行动计划，包含每日维护、预警信号、应对策略等
              </Text>
            </View>
            <Text style={styles.wrapEntryArrow}>{'\u2192'}</Text>
          </Pressable>
        </Animated.View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacer} />
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

  // 头部
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // 通用间距
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },

  // RiskGauge
  gaugeContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  gaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  gaugeTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  gaugeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  gaugeBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '500',
  },
  gaugeBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  gaugeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  gaugeFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
  },
  gaugeScore: {
    fontFamily: typography.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gaugeScoreLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
    marginLeft: 2,
  },

  // 签到按钮
  checkInButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  checkInButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  checkInButtonChecked: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  checkInButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
  },
  checkInButtonTextActive: {
    color: colors.surface,
  },
  checkInButtonTextChecked: {
    color: colors.success,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  // 统计卡片
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // 趋势图
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  trendContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  trendDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 70,
  },
  trendBar: {
    width: 6,
    borderRadius: 3,
  },
  trendDayLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.textHint,
  },

  // 图例
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.textHint,
  },

  // 风险警告横幅
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD4D4',
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  riskBannerIcon: {
    fontSize: 16,
  },
  riskBannerText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.danger,
    fontWeight: '500',
    flex: 1,
  },
  riskBannerHotline: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.danger,
    fontWeight: '700',
  },

  // WRAP 入口
  wrapEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  wrapEntryPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  wrapEntryIcon: {
    fontSize: 28,
  },
  wrapEntryText: {
    flex: 1,
  },
  wrapEntryTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  wrapEntryDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  wrapEntryArrow: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.textHint,
  },

  // 底部间距
  bottomSpacer: {
    height: spacing.xl,
  },
});
