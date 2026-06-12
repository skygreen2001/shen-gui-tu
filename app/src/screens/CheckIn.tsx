import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';
import useCheckIn, {
  CHECKIN_DIMENSIONS,
  type CheckInRecord,
} from '../hooks/useCheckIn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// ========================
// 类型定义
// ========================

type DashboardStackParamList = {
  Dashboard: undefined;
  CheckIn: undefined;
  WRAPPlan: undefined;
};

type CheckInScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'CheckIn'
>;

interface DimensionConfig {
  key: string;
  label: string;
  icon: string;
  left: string;
  right: string;
}

// ========================
// 常量
// ========================

const DIMENSIONS: DimensionConfig[] = [
  { key: 'sleep', label: '睡眠质量', icon: '\uD83D\uDE34', left: '很差', right: '很好' },
  { key: 'mood', label: '情绪状态', icon: '\uD83D\uDE0A', left: '低落', right: '愉悦' },
  { key: 'body', label: '身体活力', icon: '\uD83C\uDFC3', left: '疲惫', right: '充沛' },
  { key: 'motivation', label: '动力水平', icon: '\uD83C\uDFAF', left: '无', right: '强烈' },
  { key: 'cognition', label: '思维清晰度', icon: '\uD83E\uDDE0', left: '模糊', right: '清晰' },
  { key: 'social', label: '社交意愿', icon: '\uD83D\uDC65', left: '回避', right: '主动' },
];

const ENCOURAGEMENTS = [
  '\u2705 签到成功！记录是康复的第一步 \uD83D\uDCAA',
  '\uD83C\uDF1F 很好！你正在了解自己',
  '\uD83C\uDF31 每一天的记录都是成长的种子',
  '\uD83D\uDCAA 你做得很好，继续保持！',
  '\uD83C\uDF08 感谢你花时间关注自己',
];

const MAX_NOTE_LENGTH = 200;

// ========================
// 子组件: RatingButton
// ========================

interface RatingButtonProps {
  value: number;
  selected: boolean;
  onPress: (val: number) => void;
}

function RatingButton({ value, selected, onPress }: RatingButtonProps) {
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={({ pressed }) => [
        styles.ratingButton,
        selected && styles.ratingButtonSelected,
        pressed && styles.ratingButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.ratingButtonText,
          selected && styles.ratingButtonTextSelected,
        ]}
      >
        {value}
      </Text>
    </Pressable>
  );
}

// ========================
// 子组件: DimensionGroup
// ========================

interface DimensionGroupProps {
  dim: DimensionConfig;
  value: number | undefined;
  onSelect: (key: string, val: number) => void;
  index: number;
}

function DimensionGroup({ dim, value, onSelect, index }: DimensionGroupProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={styles.dimGroup}
    >
      <View style={styles.dimLabel}>
        <Text style={styles.dimIcon}>{dim.icon}</Text>
        <Text style={styles.dimLabelText}>{dim.label}</Text>
      </View>
      <View style={styles.ratingRow}>
        <View style={styles.ratingGroup}>
          {[1, 2, 3, 4, 5].map((val) => (
            <RatingButton
              key={val}
              value={val}
              selected={value === val}
              onPress={(v) => onSelect(dim.key, v)}
            />
          ))}
        </View>
      </View>
      <View style={styles.ratingLabels}>
        <Text style={styles.ratingLabelLeft}>{dim.left}</Text>
        <Text style={styles.ratingLabelRight}>{dim.right}</Text>
      </View>
    </Animated.View>
  );
}

// ========================
// 子组件: DoneCard
// ========================

interface DoneCardProps {
  icon: string;
  title: string;
  desc: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
}

function DoneCard({ icon, title, desc, buttonLabel, onButtonPress }: DoneCardProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.doneCard}
    >
      <Text style={styles.doneIcon}>{icon}</Text>
      <Text style={styles.doneTitle}>{title}</Text>
      <Text style={styles.doneDesc}>{desc}</Text>
      {buttonLabel && onButtonPress && (
        <Pressable
          onPress={onButtonPress}
          style={({ pressed }) => [
            styles.reEditButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.reEditButtonText}>{buttonLabel}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

// ========================
// 主组件: CheckIn
// ========================

export default function CheckIn({ navigation }: CheckInScreenProps) {
  const { checkIns, addCheckIn, updateCheckIn, getTodayCheckIn } = useCheckIn();
  const todayCheckIn = getTodayCheckIn();
  const hasCheckedToday = !!todayCheckIn;

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [encouragement, setEncouragement] = useState('');

  // 进入编辑模式时回填已有数据
  useEffect(() => {
    if (editing && todayCheckIn) {
      setRatings(todayCheckIn.dimensions || {});
      setNote(todayCheckIn.note || '');
    }
  }, [editing, todayCheckIn]);

  const allRated = DIMENSIONS.every((d) => ratings[d.key]);

  const selectRating = useCallback((key: string, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!allRated) return;

    if (editing && todayCheckIn) {
      updateCheckIn(todayCheckIn.date, ratings, note);
    } else {
      addCheckIn(ratings, note);
    }

    setSubmitted(true);
    setEditing(false);
    setEncouragement(
      ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
    );
  }, [allRated, ratings, note, editing, todayCheckIn, addCheckIn, updateCheckIn]);

  const handleEdit = useCallback(() => {
    setEditing(true);
    setSubmitted(false);
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 已签到且未进入编辑模式：显示已签到卡片
  if (hasCheckedToday && !editing && !submitted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>每日签到 {'\uD83D\uDCCB'}</Text>
            <Text style={styles.headerSubtitle}>今日签到记录</Text>
          </View>

          <View style={styles.content}>
            <DoneCard
              icon={'\u2705'}
              title="今日已签到"
              desc="你今天已经完成了签到，可以修改或明天继续加油！"
              buttonLabel="修改今日签到"
              onButtonPress={handleEdit}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 提交成功后
  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>每日签到 {'\uD83D\uDCCB'}</Text>
          </View>

          <View style={styles.content}>
            <DoneCard
              icon={'\uD83C\uDF89'}
              title={editing ? '修改成功！' : '签到完成！'}
              desc={encouragement}
            />

            <Pressable
              onPress={handleGoBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.backButtonText}>返回</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 签到表单
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* 头部 */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
            <Text style={styles.headerTitle}>每日签到 {'\uD83D\uDCCB'}</Text>
            <Text style={styles.headerSubtitle}>
              {editing ? '修改今日签到内容' : '花1分钟了解自己的状态'}
            </Text>
          </Animated.View>

          {/* 维度评分 */}
          <View style={styles.content}>
            {DIMENSIONS.map((dim, idx) => (
              <DimensionGroup
                key={dim.key}
                dim={dim}
                value={ratings[dim.key]}
                onSelect={selectRating}
                index={idx}
              />
            ))}

            {/* 备注 */}
            <Animated.View
              entering={FadeInDown.delay(DIMENSIONS.length * 60).duration(400)}
              style={styles.noteWrap}
            >
              <TextInput
                style={styles.noteInput}
                placeholder="今天有什么想记录的吗？（选填）"
                placeholderTextColor={colors.textHint}
                maxLength={MAX_NOTE_LENGTH}
                value={note}
                onChangeText={setNote}
                multiline={true}
                textAlignVertical="top"
                numberOfLines={4}
              />
              <View style={styles.noteCounter}>
                <Text style={styles.noteCounterText}>
                  {note.length} / {MAX_NOTE_LENGTH}
                </Text>
              </View>
            </Animated.View>

            {/* 提交按钮 */}
            <Animated.View
              entering={FadeInDown.delay(DIMENSIONS.length * 60 + 100).duration(400)}
              style={styles.submitWrap}
            >
              <Pressable
                onPress={handleSubmit}
                disabled={!allRated}
                style={({ pressed }) => [
                  styles.submitButton,
                  !allRated && styles.submitButtonDisabled,
                  pressed && allRated && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    !allRated && styles.submitButtonTextDisabled,
                  ]}
                >
                  {editing ? '保存修改' : '提交签到'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
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

  // 内容区
  content: {
    paddingHorizontal: spacing.md,
  },

  // 维度评分组
  dimGroup: {
    marginBottom: spacing.lg,
  },
  dimLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dimIcon: {
    fontSize: 16,
  },
  dimLabelText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ratingRow: {
    paddingVertical: spacing.sm,
  },
  ratingGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  ratingButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.92 }],
  },
  ratingButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textHint,
  },
  ratingButtonTextSelected: {
    color: colors.surface,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  ratingLabelLeft: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.textHint,
  },
  ratingLabelRight: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: colors.textHint,
  },

  // 备注
  noteWrap: {
    marginTop: spacing.lg,
  },
  noteInput: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  noteCounter: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
    marginRight: spacing.xs,
  },
  noteCounterText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.textHint,
  },

  // 提交按钮
  submitWrap: {
    marginTop: spacing.lg,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    ...shadows.sm,
  },
  submitButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.surface,
  },
  submitButtonTextDisabled: {
    color: colors.surface,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  // 完成卡片
  doneCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
    marginTop: spacing.xl,
  },
  doneIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  doneTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  doneDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  reEditButton: {
    marginTop: spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  reEditButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },

  // 返回按钮
  backButton: {
    marginTop: spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  backButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
