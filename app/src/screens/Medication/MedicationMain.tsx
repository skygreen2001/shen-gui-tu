import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../../styles/theme';
import useMedication, {
  MedicationRecord,
} from '../../hooks/useMedication';
import { getMissedDoseAdvice } from '../../data/medicationKnowledge';

// ========================
// Types
// ========================

type SubView = null | 'knowledge' | 'sideEffects' | 'moodCorrelation' | 'taper';

interface MedStatus {
  taken: boolean;
  skipped: boolean;
}

// ========================
// Constants
// ========================

const encouragements = [
  '太棒了！坚持就是胜利',
  '今天又照顾好自己了',
  '用药规律是康复的关键',
  '你在为健康做正确的事',
];

const warmMessages = [
  '没关系，记得和医生聊聊',
  '偶尔忘记很正常，明天继续',
  '身体感受很重要，和医生沟通一下',
];

const defaultMeds = [
  { name: '草酸艾司西酞普兰', dosage: '10mg', frequency: '每日一次', startDate: new Date().toISOString().split('T')[0] },
  { name: '喹硫平', dosage: '25mg', frequency: '每晚一次', startDate: new Date().toISOString().split('T')[0] },
];

// ========================
// Component
// ========================

export default function MedicationMain() {
  const {
    medications,
    addMedication,
    logMedication,
    getAdherenceRate,
    getActiveMedications,
    getLogsByDate,
  } = useMedication();

  const [toast, setToast] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('每日一次');
  const [subView, setSubView] = useState<SubView>(null);
  const [animatedPct, setAnimatedPct] = useState(0);
  const [medStatuses, setMedStatuses] = useState<Record<string, MedStatus>>({});

  // Initialize default medications if empty
  useEffect(() => {
    if (medications.length === 0) {
      defaultMeds.forEach((med) => addMedication(med));
    }
  }, []);

  // Calculate adherence
  const adherence = useMemo(() => getAdherenceRate(30), [medications, getAdherenceRate]);

  // Animate adherence circle
  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 2;
      if (current >= adherence) {
        current = adherence;
        clearInterval(timer);
      }
      setAnimatedPct(current);
    }, 20);
    return () => clearInterval(timer);
  }, [adherence]);

  // Calculate streak
  const streak = useMemo(() => {
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const logs = getLogsByDate(dateStr);
      const activeMeds = getActiveMedications();
      if (activeMeds.length === 0) break;
      const allTaken = activeMeds.every(
        (med) => logs.some((l) => l.medicationId === med.id && l.taken),
      );
      if (allTaken) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [medications, getLogsByDate, getActiveMedications]);

  // Onset phase guidance
  const onsetPhase = useMemo(() => {
    const activeMeds = getActiveMedications();
    if (activeMeds.length === 0) return { active: false, medName: '', daysSince: 0 };
    const firstMed = activeMeds[0];
    const start = new Date(firstMed.startDate);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - start.getTime()) / 86400000);
    if (daysSince <= 28) {
      return { active: true, medName: firstMed.name, daysSince };
    }
    return { active: false, medName: '', daysSince: 0 };
  }, [medications, getActiveMedications]);

  const handleTake = useCallback(
    (medId: string) => {
      const med = medications.find((m) => m.id === medId);
      if (!med) return;
      logMedication(medId, med.dosage, { taken: true });
      setMedStatuses((prev) => ({ ...prev, [medId]: { taken: true, skipped: false } }));
      setToast(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setTimeout(() => setToast(''), 3000);
    },
    [medications, logMedication],
  );

  const handleSkip = useCallback(
    (medId: string) => {
      const med = medications.find((m) => m.id === medId);
      if (!med) return;
      logMedication(medId, med.dosage, { taken: false });
      setMedStatuses((prev) => ({ ...prev, [medId]: { taken: false, skipped: true } }));
      const advice = getMissedDoseAdvice(med.name);
      setToast(advice || warmMessages[Math.floor(Math.random() * warmMessages.length)]);
      setTimeout(() => setToast(''), 4000);
    },
    [medications, logMedication],
  );

  const handleAdd = useCallback(() => {
    if (newName.trim() && newDosage.trim()) {
      addMedication({
        name: newName.trim(),
        dosage: newDosage.trim(),
        frequency: newFrequency,
        startDate: new Date().toISOString().split('T')[0],
      });
      setNewName('');
      setNewDosage('');
      setNewFrequency('每日一次');
      setShowAdd(false);
    }
  }, [newName, newDosage, newFrequency, addMedication]);

  const activeMeds = getActiveMedications();
  const adherenceColor =
    adherence >= 80
      ? colors.success
      : adherence >= 50
        ? colors.warning
        : colors.danger;

  // Sub-view navigation
  if (subView === 'knowledge') {
    return (
      <View style={styles.subViewContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSubView(null)}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <MedKnowledgePlaceholder onBack={() => setSubView(null)} />
      </View>
    );
  }

  if (subView === 'sideEffects') {
    return (
      <View style={styles.subViewContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSubView(null)}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <SideEffectPlaceholder onBack={() => setSubView(null)} />
      </View>
    );
  }

  if (subView === 'moodCorrelation') {
    return (
      <View style={styles.subViewContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSubView(null)}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <MoodCorrelationPlaceholder onBack={() => setSubView(null)} />
      </View>
    );
  }

  if (subView === 'taper') {
    return (
      <View style={styles.subViewContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSubView(null)}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <TaperPlaceholder onBack={() => setSubView(null)} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>用药管理</Text>
        <Text style={styles.headerSub}>坚持用药是康复的重要保障</Text>
      </View>

      {/* Adherence Circle */}
      <View style={styles.adherenceSection}>
        <View style={styles.adherenceCircleWrap}>
          <View style={[styles.adherenceCircle, { borderColor: adherenceColor }]}>
            <Text style={[styles.adherencePct, { color: adherenceColor }]}>
              {animatedPct}%
            </Text>
          </View>
        </View>
        <Text style={styles.adherenceLabel}>本月用药依从率</Text>
      </View>

      {/* Streak */}
      {streak > 0 && (
        <View style={styles.streakCard}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakText}>
            连续服药 <Text style={styles.streakNum}>{streak}</Text> 天
          </Text>
        </View>
      )}

      {/* Onset Phase Guidance */}
      {onsetPhase.active && (
        <View style={styles.onsetCard}>
          <Text style={styles.onsetTitle}>🌱 药物起效期引导</Text>
          <Text style={styles.onsetBody}>
            你开始服用{' '}
            <Text style={styles.onsetBold}>{onsetPhase.medName}</Text> 已{' '}
            <Text style={styles.onsetBold}>{onsetPhase.daysSince}</Text> 天。
            大多数抗抑郁药物需要 2-4 周才能开始起效，前几周可能出现一些不适（如恶心、焦虑加重），这是正常现象，不代表药物无效。请坚持服药，身体正在适应中。
          </Text>
        </View>
      )}

      {/* Medication Cards */}
      {activeMeds.map((med) => {
        const status = medStatuses[med.id] || { taken: false, skipped: false };
        return (
          <View key={med.id} style={styles.medCard}>
            <View style={styles.medCardTop}>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>
                  {med.dosage} · {med.frequency}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.infoBtn}
                onPress={() => setSubView('knowledge')}
              >
                <Text style={styles.infoBtnText}>📖</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.medActions}>
              <TouchableOpacity
                style={[
                  styles.takeBtn,
                  status.taken && styles.takeBtnTaken,
                ]}
                activeOpacity={0.7}
                onPress={() => handleTake(med.id)}
              >
                <Text
                  style={[
                    styles.takeBtnText,
                    status.taken && styles.takeBtnTextTaken,
                  ]}
                >
                  {status.taken ? '✅ 已服用' : '💊 服药'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.skipBtn,
                  status.skipped && styles.skipBtnSkipped,
                ]}
                activeOpacity={0.7}
                onPress={() => handleSkip(med.id)}
              >
                <Text
                  style={[
                    styles.skipBtnText,
                    status.skipped && styles.skipBtnTextSkipped,
                  ]}
                >
                  {status.skipped ? '⏭️ 已跳过' : '⏭️ 跳过'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Add Medication */}
      <TouchableOpacity
        style={styles.addBtn}
        activeOpacity={0.7}
        onPress={() => setShowAdd(!showAdd)}
      >
        <Text style={styles.addBtnText}>
          {showAdd ? '取消' : '+ 添加药物'}
        </Text>
      </TouchableOpacity>

      {showAdd && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="药物名称"
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder="剂量（如 10mg）"
            value={newDosage}
            onChangeText={setNewDosage}
          />
          <TextInput
            style={styles.input}
            placeholder="频率（如 每日一次）"
            value={newFrequency}
            onChangeText={setNewFrequency}
          />
          <TouchableOpacity
            style={styles.confirmBtn}
            activeOpacity={0.7}
            onPress={handleAdd}
          >
            <Text style={styles.confirmBtnText}>确认添加</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Auxiliary Entries */}
      <View style={styles.auxSection}>
        <TouchableOpacity
          style={styles.auxEntry}
          activeOpacity={0.7}
          onPress={() => setSubView('sideEffects')}
        >
          <Text style={styles.auxIcon}>📋</Text>
          <View style={styles.auxText}>
            <Text style={styles.auxTitle}>副作用周报</Text>
            <Text style={styles.auxDesc}>每周记录药物副作用，追踪身体变化</Text>
          </View>
          <Text style={styles.auxArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.auxEntry}
          activeOpacity={0.7}
          onPress={() => setSubView('moodCorrelation')}
        >
          <Text style={styles.auxIcon}>📈</Text>
          <View style={styles.auxText}>
            <Text style={styles.auxTitle}>药物-情绪联动</Text>
            <Text style={styles.auxDesc}>查看用药与情绪的关联趋势</Text>
          </View>
          <Text style={styles.auxArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.auxEntry}
          activeOpacity={0.7}
          onPress={() => setSubView('taper')}
        >
          <Text style={styles.auxIcon}>🎯</Text>
          <View style={styles.auxText}>
            <Text style={styles.auxTitle}>减药导航</Text>
            <Text style={styles.auxDesc}>在医生指导下安全渐进减药</Text>
          </View>
          <Text style={styles.auxArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          💡 <Text style={styles.tipBold}>温馨提示：</Text>
          即使感觉好转，也请遵医嘱继续服药。突然停药可能导致不适。如有疑问，请咨询您的主治医生。
        </Text>
      </View>

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
// Placeholder Sub-Views
// ========================

function MedKnowledgePlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.placeholderView}>
      <Text style={styles.placeholderIcon}>📖</Text>
      <Text style={styles.placeholderTitle}>药物知识库</Text>
      <Text style={styles.placeholderDesc}>
        请导航至 MedKnowledge 页面查看完整药物知识
      </Text>
      <TouchableOpacity style={styles.placeholderBtn} onPress={onBack}>
        <Text style={styles.placeholderBtnText}>← 返回用药管理</Text>
      </TouchableOpacity>
    </View>
  );
}

function SideEffectPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.placeholderView}>
      <Text style={styles.placeholderIcon}>📋</Text>
      <Text style={styles.placeholderTitle}>副作用周报</Text>
      <Text style={styles.placeholderDesc}>
        请导航至 SideEffectTracker 页面查看完整副作用追踪
      </Text>
      <TouchableOpacity style={styles.placeholderBtn} onPress={onBack}>
        <Text style={styles.placeholderBtnText}>← 返回用药管理</Text>
      </TouchableOpacity>
    </View>
  );
}

function MoodCorrelationPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.placeholderView}>
      <Text style={styles.placeholderIcon}>📈</Text>
      <Text style={styles.placeholderTitle}>药物-情绪联动</Text>
      <Text style={styles.placeholderDesc}>
        请导航至 MoodCorrelation 页面查看完整联动分析
      </Text>
      <TouchableOpacity style={styles.placeholderBtn} onPress={onBack}>
        <Text style={styles.placeholderBtnText}>← 返回用药管理</Text>
      </TouchableOpacity>
    </View>
  );
}

function TaperPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.placeholderView}>
      <Text style={styles.placeholderIcon}>🎯</Text>
      <Text style={styles.placeholderTitle}>减药导航</Text>
      <Text style={styles.placeholderDesc}>
        请导航至 TaperNavigator 页面查看完整减药计划
      </Text>
      <TouchableOpacity style={styles.placeholderBtn} onPress={onBack}>
        <Text style={styles.placeholderBtnText}>← 返回用药管理</Text>
      </TouchableOpacity>
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
  subViewContainer: {
    flex: 1,
    backgroundColor: colors.bg,
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

  // Adherence
  adherenceSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  adherenceCircleWrap: {
    marginBottom: spacing.sm,
  },
  adherenceCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  adherencePct: {
    fontFamily: typography.fontFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  adherenceLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Streak
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  streakText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  streakNum: {
    fontWeight: '700',
    color: colors.accent,
    fontSize: 18,
  },

  // Onset Phase
  onsetCard: {
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    ...shadows.sm,
  },
  onsetTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  onsetBody: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  onsetBold: {
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Medication Cards
  medCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  medCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  medDosage: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoBtn: {
    padding: spacing.sm,
  },
  infoBtnText: {
    fontSize: 20,
  },
  medActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  takeBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  takeBtnTaken: {
    backgroundColor: colors.success,
  },
  takeBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  takeBtnTextTaken: {
    color: '#FFFFFF',
  },
  skipBtn: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipBtnSkipped: {
    backgroundColor: colors.bgWarm,
    borderColor: colors.accentLight,
  },
  skipBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  skipBtnTextSkipped: {
    color: colors.accent,
  },

  // Add Medication
  addBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  addBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  addForm: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Auxiliary Entries
  auxSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  auxEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  auxIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  auxText: {
    flex: 1,
  },
  auxTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  auxDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },
  auxArrow: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.textHint,
  },

  // Tip
  tipCard: {
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  tipText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '600',
    color: colors.textPrimary,
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

  // Back Button
  backBtn: {
    padding: spacing.md,
  },
  backBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.primary,
  },

  // Placeholder
  placeholderView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  placeholderTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  placeholderDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  placeholderBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  placeholderBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
