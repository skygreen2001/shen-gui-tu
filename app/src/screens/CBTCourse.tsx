import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';
import {
  cbtCourses,
  tierInfo,
  CbtCourse,
  CbtStep,
  GuidedContent,
} from '../data/cbtContent';
import useAsyncStorage from '../hooks/useAsyncStorage';
import useTTS from '../hooks/useTTS';

// ========================
// Types
// ========================

interface GroupedTier {
  tier: number;
  title: string;
  desc: string;
  color: string;
  courses: CbtCourse[];
}

// ========================
// Component
// ========================

export default function CBTCourse() {
  const [progress, setProgress] = useAsyncStorage<Record<number, boolean>>(
    'sgt-cbt-progress',
    {},
  );
  const [activeCourseIdx, setActiveCourseIdx] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [toast, setToast] = useState('');
  const [collapsedTiers, setCollapsedTiers] = useState<Record<number, boolean>>(
    {},
  );
  const { speak, status: ttsStatus, cancel } = useTTS();

  // Group courses by tier
  const groupedCourses: GroupedTier[] = useMemo(() => {
    return tierInfo.map((tier) => ({
      ...tier,
      courses: cbtCourses.filter((c) => c.tier === tier.tier),
    }));
  }, []);

  const openCourse = useCallback(
    (courseId: number) => {
      const idx = cbtCourses.findIndex((c) => c.id === courseId);
      if (idx === -1) return;
      const course = cbtCourses[idx];
      const isLocked = course.prerequisites?.some(
        (preId) => !progress[preId],
      );
      if (isLocked) {
        setToast('🔒 请先完成前面的课程');
        setTimeout(() => setToast(''), 2000);
        return;
      }
      setActiveCourseIdx(idx);
      setActiveStep(0);
    },
    [progress],
  );

  const closeCourse = useCallback(() => {
    setActiveCourseIdx(null);
    setActiveStep(0);
    cancel();
  }, [cancel]);

  const nextStep = useCallback(() => {
    if (activeCourseIdx === null) return;
    const course = cbtCourses[activeCourseIdx];
    if (activeStep < course.steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      setProgress((prev) => ({ ...prev, [course.id]: true }));
      setToast('🎉 恭喜完成课程！');
      setTimeout(() => setToast(''), 3000);
      closeCourse();
    }
  }, [activeCourseIdx, activeStep, closeCourse, setProgress]);

  const prevStep = useCallback(() => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, []);

  const toggleTier = useCallback((tier: number) => {
    setCollapsedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  }, []);

  const handleSpeak = useCallback(
    (text: string) => {
      if (ttsStatus === 'speaking') {
        cancel();
      } else {
        speak(text);
      }
    },
    [speak, cancel, ttsStatus],
  );

  // Course Detail View
  if (activeCourseIdx !== null) {
    const course = cbtCourses[activeCourseIdx];
    const step = course.steps[activeStep];
    const isLastStep = activeStep === course.steps.length - 1;

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={closeCourse}>
            <Text style={styles.backBtnText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{course.title}</Text>
        </View>

        <ScrollView
          style={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step Dots */}
          <View style={styles.stepDots}>
            {course.steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeStep && styles.dotActive,
                  i < activeStep && styles.dotDone,
                ]}
              />
            ))}
          </View>

          {/* Step Content */}
          <View style={styles.stepCard}>
            <View style={styles.stepTypeWrap}>
              <Text style={styles.stepType}>{step.type}</Text>
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>

            {step.guided ? (
              <GuidedPlayer
                guided={step.guided}
                onSpeak={handleSpeak}
                ttsStatus={ttsStatus}
              />
            ) : (
              <Text style={styles.stepBody}>{step.body}</Text>
            )}
          </View>

          {/* Navigation */}
          <View style={styles.stepNav}>
            <TouchableOpacity
              style={[
                styles.navBtn,
                activeStep === 0 && styles.navBtnDisabled,
              ]}
              disabled={activeStep === 0}
              onPress={prevStep}
            >
              <Text style={styles.navBtnText}>← 上一步</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={nextStep}
            >
              <Text style={styles.navBtnText}>
                {isLastStep ? '✅ 完成课程' : '下一步 →'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Toast */}
        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  // Course List View
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>心理干预课程</Text>
        <Text style={styles.headerSub}>
          CBT · MBCT · WRAP · ACT 循证课程体系
        </Text>
      </View>

      {/* Tier Groups */}
      {groupedCourses.map((group) => {
        const collapsed = collapsedTiers[group.tier];
        const completedCount = group.courses.filter(
          (c) => progress[c.id],
        ).length;

        return (
          <View key={group.tier} style={styles.tierGroup}>
            {/* Tier Header */}
            <TouchableOpacity
              style={styles.tierHeader}
              activeOpacity={0.7}
              onPress={() => toggleTier(group.tier)}
            >
              <View
                style={[
                  styles.tierIndicator,
                  { backgroundColor: group.color },
                ]}
              />
              <View style={styles.tierInfo}>
                <Text style={styles.tierTitle}>{group.title}</Text>
                <Text style={styles.tierDesc}>{group.desc}</Text>
              </View>
              <Text style={styles.tierCount}>
                {completedCount}/{group.courses.length}
              </Text>
              <Text
                style={[
                  styles.tierArrow,
                  collapsed && styles.tierArrowCollapsed,
                ]}
              >
                ▾
              </Text>
            </TouchableOpacity>

            {/* Course Cards */}
            {!collapsed &&
              group.courses.map((course) => {
                const completed = progress[course.id];
                const isLocked = course.prerequisites?.some(
                  (preId) => !progress[preId],
                );

                return (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseCard,
                      isLocked && styles.courseCardLocked,
                    ]}
                    activeOpacity={isLocked ? 1 : 0.7}
                    onPress={() => openCourse(course.id)}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>
                        {isLocked ? '🔒' : course.icon}
                      </Text>
                      <View style={styles.cardInfo}>
                        <Text
                          style={[
                            styles.cardTitle,
                            isLocked && styles.cardTitleLocked,
                          ]}
                        >
                          {course.title}
                        </Text>
                        <View
                          style={[
                            styles.cardTag,
                            {
                              backgroundColor: group.color + '20',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.cardTagText,
                              { color: group.color },
                            ]}
                          >
                            {course.tag}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.cardDesc,
                        isLocked && styles.cardDescLocked,
                      ]}
                    >
                      {isLocked ? '完成前置课程后解锁' : course.desc}
                    </Text>
                    {completed && (
                      <Text style={styles.completedBadge}>✅ 已完成</Text>
                    )}
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${completed ? 100 : 0}%`,
                            backgroundColor: group.color,
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        );
      })}

      {/* Toast */}
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ========================
// Guided Player Component
// ========================

interface GuidedPlayerProps {
  guided: GuidedContent;
  onSpeak: (text: string) => void;
  ttsStatus: 'idle' | 'speaking' | 'paused';
}

function GuidedPlayer({ guided, onSpeak, ttsStatus }: GuidedPlayerProps) {
  const [activeSegment, setActiveSegment] = useState(0);

  return (
    <View style={styles.guidedPlayer}>
      <Text style={styles.guidedTitle}>🎧 引导练习</Text>
      <Text style={styles.guidedSubtitle}>
        {guided.segments[activeSegment]?.part || guided.type}
      </Text>
      <Text style={styles.guidedText}>
        {guided.segments[activeSegment]?.text}
      </Text>

      {/* Segment Navigation */}
      <View style={styles.segmentDots}>
        {guided.segments.map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.segmentDot,
              i === activeSegment && styles.segmentDotActive,
            ]}
            onPress={() => setActiveSegment(i)}
          />
        ))}
      </View>

      <View style={styles.guidedNav}>
        <TouchableOpacity
          style={styles.guidedNavBtn}
          disabled={activeSegment === 0}
          onPress={() => setActiveSegment((s) => s - 1)}
        >
          <Text
            style={[
              styles.guidedNavText,
              activeSegment === 0 && styles.guidedNavTextDisabled,
            ]}
          >
            上一步
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.guidedPlayBtn}
          onPress={() =>
            onSpeak(guided.segments[activeSegment]?.text || '')
          }
        >
          <Text style={styles.guidedPlayText}>
            {ttsStatus === 'speaking' ? '⏸ 暂停' : '▶ 播放'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.guidedNavBtn}
          disabled={activeSegment === guided.segments.length - 1}
          onPress={() => setActiveSegment((s) => s + 1)}
        >
          <Text
            style={[
              styles.guidedNavText,
              activeSegment === guided.segments.length - 1 &&
                styles.guidedNavTextDisabled,
            ]}
          >
            下一步
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ========================
// Styles
// ========================

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

  // Header
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Detail View
  detailHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  backBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.primary,
  },
  detailTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  // Step Dots
  stepDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  dotDone: {
    backgroundColor: colors.success,
  },

  // Step Card
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  stepTypeWrap: {
    marginBottom: spacing.sm,
  },
  stepType: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stepBody: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Step Navigation
  stepNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Tier Groups
  tierGroup: {
    marginBottom: spacing.md,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  tierIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tierDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },
  tierCount: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  tierArrow: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.textHint,
  },
  tierArrowCollapsed: {
    transform: [{ rotate: '-90deg' }],
  },

  // Course Cards
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  courseCardLocked: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardTitleLocked: {
    color: colors.textHint,
  },
  cardTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  cardTagText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  cardDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardDescLocked: {
    color: colors.textHint,
  },
  completedBadge: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.bg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Guided Player
  guidedPlayer: {
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentLight,
  },
  guidedTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  guidedSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  guidedText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  segmentDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  segmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  segmentDotActive: {
    backgroundColor: colors.accent,
    width: 18,
  },
  guidedNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guidedNavBtn: {
    padding: spacing.sm,
  },
  guidedNavText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.primary,
  },
  guidedNavTextDisabled: {
    color: colors.textHint,
  },
  guidedPlayBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  guidedPlayText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 40,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.lg,
  },
  toastText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
