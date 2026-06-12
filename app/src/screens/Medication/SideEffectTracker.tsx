import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../../styles/theme';
import useAsyncStorage from '../../hooks/useAsyncStorage';

// ========================
// Types
// ========================

interface SideEffectItem {
  key: string;
  label: string;
  value: number;
}

interface WeeklyReport {
  id: number;
  weekKey: string;
  date: string;
  items: SideEffectItem[];
  note: string;
  timestamp: number;
}

interface CopingStrategyGroup {
  label: string;
  value: number;
  strategies: string[];
}

type ViewMode = 'form' | 'history' | 'strategies' | 'report';

// ========================
// Constants
// ========================

const defaultItems: { key: string; label: string }[] = [
  { key: 'weight', label: '体重变化' },
  { key: 'drowsiness', label: '嗜睡' },
  { key: 'sexual', label: '性功能' },
  { key: 'gi', label: '胃肠反应' },
  { key: 'insomnia', label: '失眠' },
  { key: 'appetite', label: '食欲变化' },
  { key: 'anxiety', label: '焦虑/躁动' },
];

const levels = ['无', '轻微', '轻度', '中度', '重度'];

const copingStrategies: Record<string, string[]> = {
  weight: [
    '🏃 每周至少3次30分钟有氧运动（散步、游泳）',
    '🥗 选择高纤维、低热量食物，避免含糖饮料',
    '📊 每周固定时间称重并记录，关注趋势而非单次数值',
  ],
  drowsiness: [
    '⏰ 尝试将服药时间调整到睡前（请先咨询医生）',
    '☕ 上午适量咖啡因可能帮助（避免下午后摄入）',
    '🚶 白天短时间散步（10-15分钟）有助于提神',
  ],
  sexual: [
    '💬 不要羞于和医生沟通，这是常见的药物反应',
    '📅 医生可能会调整剂量或换药，多数情况可以改善',
    '🤝 与伴侣坦诚沟通，减少心理压力',
  ],
  gi: [
    '🍽️ 随餐服药或饭后服用可减轻胃肠不适',
    '🫖 避免辛辣、油腻食物，少食多餐',
    '💧 保持充足水分摄入',
  ],
  insomnia: [
    '🌙 建立固定的睡前仪式：洗温水澡、轻度拉伸、避免屏幕',
    '⏰ 白天固定时间起床，即使没睡好也不要赖床',
    '🧘 尝试"三分钟呼吸空间"练习（可在干预训练中找到）',
  ],
  appetite: [
    '📋 每日记录饮食，帮助了解食欲变化模式',
    '🍽️ 定时进餐，即使不饿也吃少量健康食物',
    '🥜 准备一些营养密集的零食（坚果、酸奶）',
  ],
  anxiety: [
    '🧠 提醒自己：这可能是药物初期的暂时反应，通常1-2周后减轻',
    '🌬️ 焦虑时尝试"三分钟呼吸空间"练习',
    '📞 如果焦虑严重或持续加重，请及时联系医生',
  ],
};

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ========================
// Component
// ========================

interface SideEffectTrackerProps {
  onBack?: () => void;
}

export default function SideEffectTracker({ onBack }: SideEffectTrackerProps) {
  const [reports, setReports] = useAsyncStorage<WeeklyReport[]>(
    'sgt-side-effects',
    [],
  );
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [view, setView] = useState<ViewMode>('form');
  const [toast, setToast] = useState('');
  const [strategies, setStrategies] = useState<CopingStrategyGroup[]>([]);
  const [reportText, setReportText] = useState('');

  const selectRating = useCallback((key: string, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    const items: SideEffectItem[] = defaultItems.map((item) => ({
      key: item.key,
      label: item.label,
      value: ratings[item.key] || 0,
    }));
    const now = new Date();
    const weekNum = getWeekNumber(now);
    const newReport: WeeklyReport = {
      id: Date.now(),
      weekKey: `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      items,
      note,
      timestamp: Date.now(),
    };
    setReports((prev) => [...prev, newReport]);
    setRatings({});
    setNote('');

    // Generate coping strategies for items rated >= 2
    const highItems = items.filter((item) => item.value >= 2);
    if (highItems.length > 0) {
      const tips: CopingStrategyGroup[] = [];
      highItems.forEach((item) => {
        const itemStrategies = copingStrategies[item.key];
        if (itemStrategies) {
          tips.push({
            label: item.label,
            value: item.value,
            strategies: itemStrategies,
          });
        }
      });
      setStrategies(tips);
      setView('strategies');
    } else {
      setToast('✅ 副作用周报已记录，各项指标良好！');
      setTimeout(() => setToast(''), 3000);
    }
  }, [ratings, note, setReports]);

  const handleGenerateReport = useCallback(() => {
    if (reports.length === 0) return;
    const recent = reports.slice(-4);
    const lines: string[] = [
      '📋 副作用追踪报告',
      `生成日期：${new Date().toLocaleDateString('zh-CN')}`,
      `记录周期：${recent.length} 周`,
      '──────────────',
      '',
    ];
    recent.forEach((r) => {
      const score = r.items.reduce((a, b) => a + b.value, 0);
      const highItems = r.items
        .filter((i) => i.value >= 2)
        .map((i) => `${i.label}(${levels[i.value]})`);
      lines.push(`📅 ${r.date}（${r.weekKey}）总分：${score}/28`);
      if (highItems.length > 0) {
        lines.push(`   较明显：${highItems.join('、')}`);
      }
      if (r.note) {
        lines.push(`   备注：${r.note}`);
      }
      lines.push('');
    });
    if (recent.length >= 2) {
      const first = recent[0].items.reduce((a, b) => a + b.value, 0);
      const last = recent[recent.length - 1].items.reduce(
        (a, b) => a + b.value,
        0,
      );
      const trend =
        last < first
          ? '↓ 改善趋势'
          : last > first
            ? '↑ 需要关注'
            : '→ 保持稳定';
      lines.push(`📊 趋势分析：${trend}（${first} → ${last}）`);
    }
    lines.push('');
    lines.push('此报告由"申归途"APP自动生成，仅供参考。');
    setReportText(lines.join('\n'));
    setView('report');
  }, [reports]);

  const handleCopyReport = useCallback(async () => {
    try {
      await Clipboard.setString(reportText);
      setToast('✅ 报告已复制到剪贴板，复诊时可粘贴给医生');
    } catch {
      setToast('复制失败，请手动选择文本复制');
    }
    setTimeout(() => setToast(''), 3000);
  }, [reportText]);

  const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (view === 'strategies' || view === 'report') {
              setView('form');
            } else if (onBack) {
              onBack();
            }
          }}
        >
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>副作用追踪</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, view === 'form' && styles.tabActive]}
          onPress={() => setView('form')}
        >
          <Text
            style={[styles.tabText, view === 'form' && styles.tabTextActive]}
          >
            📝 本周记录
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'history' && styles.tabActive]}
          onPress={() => setView('history')}
        >
          <Text
            style={[styles.tabText, view === 'history' && styles.tabTextActive]}
          >
            📊 历史记录
          </Text>
        </TouchableOpacity>
        {reports.length > 0 && (
          <TouchableOpacity
            style={[styles.tab, view === 'report' && styles.tabActive]}
            onPress={handleGenerateReport}
          >
            <Text
              style={[
                styles.tabText,
                view === 'report' && styles.tabTextActive,
              ]}
            >
              📋 报告
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Strategies View */}
      {view === 'strategies' && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.strategyHeader}>
            💡 针对你本周的副作用，以下是一些循证应对建议：
          </Text>
          {strategies.map((item, idx) => (
            <View key={idx} style={styles.strategyGroup}>
              <View style={styles.strategyTitleRow}>
                <Text style={styles.strategyTitle}>{item.label}</Text>
                <Text style={styles.strategyLevel}>
                  {levels[item.value]}
                </Text>
              </View>
              {item.strategies.map((tip, i) => (
                <Text key={i} style={styles.strategyTip}>
                  {tip}
                </Text>
              ))}
            </View>
          ))}
          <View style={styles.strategyNote}>
            <Text style={styles.strategyNoteText}>
              💡 以上建议仅供参考。如果副作用严重影响日常生活，请及时联系医生。
            </Text>
          </View>
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.7}
            onPress={() => setView('form')}
          >
            <Text style={styles.submitBtnText}>我知道了</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Report View */}
      {view === 'report' && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.reportHeader}>
            📋 副作用追踪报告（供复诊参考）
          </Text>
          <View style={styles.reportContent}>
            <Text style={styles.reportText}>{reportText}</Text>
          </View>
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.7}
            onPress={handleCopyReport}
          >
            <Text style={styles.submitBtnText}>📋 复制报告到剪贴板</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Form View */}
      {view === 'form' && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.hint}>根据你的真实感受评分，没有对错之分</Text>

          {defaultItems.map((item) => (
            <View key={item.key} style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>{item.label}</Text>
              <View style={styles.ratingRow}>
                {levels.map((level, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.ratingBtn,
                      ratings[item.key] === i && styles.ratingBtnSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => selectRating(item.key, i)}
                  >
                    <Text
                      style={[
                        styles.ratingBtnText,
                        ratings[item.key] === i &&
                          styles.ratingBtnTextSelected,
                      ]}
                    >
                      {i}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.ratingLabels}>
                <Text style={styles.ratingLabelsText}>{levels[0]}</Text>
                <Text style={styles.ratingLabelsText}>{levels[4]}</Text>
              </View>
            </View>
          ))}

          <TextInput
            style={styles.noteInput}
            placeholder="本周有什么想记录的吗？（选填）"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              总分：<Text style={styles.summaryBold}>{totalScore}</Text> / 28
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.7}
            onPress={handleSubmit}
          >
            <Text style={styles.submitBtnText}>提交周报</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* History View */}
      {view === 'history' && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {reports.length === 0 ? (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>
                暂无记录，完成第一次周报后这里会显示历史趋势
              </Text>
            </View>
          ) : (
            <>
              {reports
                .slice()
                .reverse()
                .slice(0, 8)
                .map((report) => (
                  <View key={report.id} style={styles.historyCard}>
                    <Text style={styles.historyDate}>
                      {report.date}（{report.weekKey}）
                    </Text>
                    <Text style={styles.historyScore}>
                      总分：
                      {report.items.reduce((a, b) => a + b.value, 0)} / 28
                    </Text>
                    {report.note ? (
                      <Text style={styles.historyNote}>{report.note}</Text>
                    ) : null}
                  </View>
                ))}
              <TouchableOpacity
                style={[styles.submitBtn, { marginTop: spacing.md, backgroundColor: colors.primary }]}
                activeOpacity={0.7}
                onPress={handleGenerateReport}
              >
                <Text style={styles.submitBtnText}>📋 生成复诊报告</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {/* Toast */}
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Form
  hint: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textHint,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  ratingItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  ratingLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ratingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ratingBtnTextSelected: {
    color: '#FFFFFF',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabelsText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.textHint,
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  summary: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    color: colors.textSecondary,
  },
  summaryBold: {
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 20,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  submitBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Strategies
  strategyHeader: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
  },
  strategyGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  strategyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  strategyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  strategyLevel: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.accent,
    fontWeight: '500',
  },
  strategyTip: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  strategyNote: {
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  strategyNoteText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Report
  reportHeader: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  reportContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  reportText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // History
  emptyView: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textHint,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  historyDate: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  historyScore: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  historyNote: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
    fontStyle: 'italic',
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
