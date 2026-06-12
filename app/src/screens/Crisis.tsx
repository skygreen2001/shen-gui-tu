import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  Animated,
} from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';

// ========================
// Types
// ========================

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

interface HotlineItem {
  label: string;
  number: string;
  tel: string;
  icon: string;
}

interface ChannelItem {
  label: string;
  tel: string;
  icon: string;
}

// ========================
// Constants
// ========================

const primaryHotlines: HotlineItem[] = [
  {
    label: '上海市心理援助热线',
    number: '962525',
    tel: 'tel:962525',
    icon: '📞',
  },
  {
    label: '全国心理援助热线',
    number: '400-161-9995',
    tel: 'tel:4001619995',
    icon: '📞',
  },
];

const moreChannels: ChannelItem[] = [
  { label: '急救电话 120', tel: 'tel:120', icon: '🏥' },
  { label: '希望24热线', tel: 'tel:4001619995', icon: '💬' },
  { label: '市民服务热线 12345', tel: 'tel:12345', icon: '📱' },
  { label: '学校心理中心', tel: 'tel:962525', icon: '🏫' },
];

const safetyTips = [
  '远离危险物品和环境',
  '联系信任的人，告诉他们你的感受',
  '去一个让你感到安全的地方',
  '记住：这种感觉会过去的',
];

// ========================
// Component
// ========================

export default function Crisis() {
  const [breathing, setBreathing] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [count, setCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animated circle scale
  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.3)).current;

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const animateCircle = useCallback(
    (targetScale: number, targetOpacity: number, duration: number) => {
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: targetScale,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: targetOpacity,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [circleScale, circleOpacity],
  );

  const startBreathCycle = useCallback(() => {
    // Inhale 4s
    setPhase('inhale');
    setCount(4);
    animateCircle(1.4, 0.8, 4000);

    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(() => {
      // Hold 7s
      setPhase('hold');
      setCount(7);
      animateCircle(1.4, 0.9, 1000);

      intervalRef.current = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        // Exhale 8s
        setPhase('exhale');
        setCount(8);
        animateCircle(1, 0.3, 8000);

        intervalRef.current = setInterval(() => {
          setCount((prev) => {
            if (prev <= 1) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        timerRef.current = setTimeout(() => {
          // Restart cycle
          startBreathCycle();
        }, 8000);
      }, 7000);
    }, 4000);
  }, [animateCircle]);

  const stopBreathing = useCallback(() => {
    setBreathing(false);
    setPhase('idle');
    setCount(0);
    clearAllTimers();
    animateCircle(1, 0.3, 500);
  }, [clearAllTimers, animateCircle]);

  const toggleBreathing = useCallback(() => {
    if (breathing) {
      stopBreathing();
      return;
    }
    setBreathing(true);
    startBreathCycle();
  }, [breathing, stopBreathing, startBreathCycle]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const handleCall = useCallback((tel: string) => {
    Linking.openURL(tel).catch(() => {
      // Fallback: do nothing on simulators
    });
  }, []);

  const phaseText: Record<BreathingPhase, string> = {
    idle: '开始',
    inhale: `吸气 ${count}`,
    hold: `屏息 ${count}`,
    exhale: `呼气 ${count}`,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>你不是一个人</Text>
        <Text style={styles.heroSub}>无论何时，都有人愿意倾听和帮助你</Text>
      </View>

      {/* Primary Hotline Buttons */}
      <View style={styles.hotlineSection}>
        {primaryHotlines.map((item, idx) => (
          <TouchableOpacity
            key={item.number}
            style={[
              styles.hotlineBtn,
              idx === 0 ? styles.hotlinePrimary : styles.hotlineSecondary,
            ]}
            activeOpacity={0.7}
            onPress={() => handleCall(item.tel)}
          >
            <Text style={styles.hotlineIcon}>{item.icon}</Text>
            <View style={styles.hotlineInfo}>
              <Text
                style={[
                  styles.hotlineLabel,
                  idx === 0
                    ? styles.hotlineLabelPrimary
                    : styles.hotlineLabelSecondary,
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.hotlineNumber,
                  idx === 0
                    ? styles.hotlineNumberPrimary
                    : styles.hotlineNumberSecondary,
                ]}
              >
                {item.number}
              </Text>
            </View>
            <Text
              style={[
                styles.hotlineAction,
                idx === 0
                  ? styles.hotlineActionPrimary
                  : styles.hotlineActionSecondary,
              ]}
            >
              拨打 →
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* More Help Channels */}
      <View style={styles.channelsSection}>
        <Text style={styles.sectionTitle}>更多求助渠道</Text>
        <View style={styles.channelsList}>
          {moreChannels.map((ch) => (
            <TouchableOpacity
              key={ch.label}
              style={styles.channelItem}
              activeOpacity={0.7}
              onPress={() => handleCall(ch.tel)}
            >
              <Text style={styles.channelIcon}>{ch.icon}</Text>
              <Text style={styles.channelLabel}>{ch.label}</Text>
              <Text style={styles.channelArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4-7-8 Breathing Exercise */}
      <View style={styles.breathSection}>
        <Text style={styles.sectionTitle}>4-7-8 呼吸放松法</Text>
        <View style={styles.breathCard}>
          <Text style={styles.breathIcon}>🌬️</Text>

          {/* Animated Circle */}
          <View style={styles.circleWrap}>
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [{ scale: circleScale }],
                  opacity: circleOpacity,
                  borderColor:
                    phase === 'inhale'
                      ? colors.primary
                      : phase === 'hold'
                        ? colors.warning
                        : phase === 'exhale'
                          ? colors.success
                          : colors.primaryLight,
                },
              ]}
            />
            <View style={styles.circleTextWrap}>
              <Text style={styles.breathText}>{phaseText[phase]}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.breathBtn,
              breathing ? styles.breathBtnStop : styles.breathBtnStart,
            ]}
            activeOpacity={0.7}
            onPress={toggleBreathing}
          >
            <Text
              style={[
                styles.breathBtnText,
                breathing
                  ? styles.breathBtnTextStop
                  : styles.breathBtnTextStart,
              ]}
            >
              {breathing ? '停止练习' : '开始练习'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety Tips */}
      <View style={styles.safetySection}>
        <Text style={styles.sectionTitle}>安全小贴士</Text>
        <View style={styles.safetyCard}>
          {safetyTips.map((tip, idx) => (
            <View key={idx} style={styles.safetyItem}>
              <Text style={styles.safetyIcon}>🛡️</Text>
              <Text style={styles.safetyText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ========================
// Styles
// ========================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing['2xl'],
  },

  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Hotline Buttons
  hotlineSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  hotlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  hotlinePrimary: {
    backgroundColor: colors.danger,
  },
  hotlineSecondary: {
    backgroundColor: colors.primary,
  },
  hotlineIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  hotlineInfo: {
    flex: 1,
  },
  hotlineLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  hotlineLabelPrimary: {
    color: '#FFFFFF',
  },
  hotlineLabelSecondary: {
    color: '#FFFFFF',
  },
  hotlineNumber: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  hotlineNumberPrimary: {
    color: '#FFFFFF',
  },
  hotlineNumberSecondary: {
    color: '#FFFFFF',
  },
  hotlineAction: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  hotlineActionPrimary: {
    color: '#FFFFFF',
  },
  hotlineActionSecondary: {
    color: '#FFFFFF',
  },

  // Channels
  channelsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  channelsList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  channelIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  channelLabel: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
  },
  channelArrow: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textHint,
  },

  // Breathing Exercise
  breathSection: {
    marginBottom: spacing.lg,
  },
  breathCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  breathIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  circleWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  circle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 4,
    backgroundColor: 'transparent',
  },
  circleTextWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathText: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breathBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 160,
    alignItems: 'center',
  },
  breathBtnStart: {
    backgroundColor: colors.primary,
  },
  breathBtnStop: {
    backgroundColor: colors.danger,
  },
  breathBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  breathBtnTextStart: {
    color: '#FFFFFF',
  },
  breathBtnTextStop: {
    color: '#FFFFFF',
  },

  // Safety Tips
  safetySection: {
    marginBottom: spacing.lg,
  },
  safetyCard: {
    backgroundColor: colors.bgWarm,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  safetyIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  safetyText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
