import { useCallback } from 'react';
import useAsyncStorage from './useAsyncStorage';
import { getWeekKey, formatDate } from '../utils/dateUtils';

// ========================
// 类型定义
// ========================

export interface MoodEntry {
  date: string;
  mood: number; // 1-5
  note?: string;
}

export interface MedicationEvent {
  date: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  taken: boolean;
}

export interface WeekCorrelation {
  weekKey: string;
  avgMood: number;
  adherenceRate: number;
  sideEffectCount: number;
  avgSideEffectSeverity: number;
  moodEntries: MoodEntry[];
  medicationEvents: MedicationEvent[];
}

export interface CorrelationInsight {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
  weekKey?: string;
  confidence: number; // 0-1
}

// ========================
// 辅助函数
// ========================

/** 获取 ISO 周数 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** 生成分析洞察 */
function generateInsights(
  correlations: WeekCorrelation[],
): CorrelationInsight[] {
  const insights: CorrelationInsight[] = [];

  if (correlations.length < 2) {
    insights.push({
      type: 'neutral',
      message: '数据不足，需要至少两周的记录才能生成分析。',
      confidence: 0,
    });
    return insights;
  }

  // 分析依从率与情绪的关系
  const highAdherenceWeeks = correlations.filter(
    (w) => w.adherenceRate >= 80 && w.moodEntries.length > 0,
  );
  const lowAdherenceWeeks = correlations.filter(
    (w) => w.adherenceRate < 50 && w.moodEntries.length > 0,
  );

  if (highAdherenceWeeks.length > 0) {
    const avgMood =
      highAdherenceWeeks.reduce((sum, w) => sum + w.avgMood, 0) /
      highAdherenceWeeks.length;
    if (avgMood >= 3.5) {
      insights.push({
        type: 'positive',
        message: `在用药依从率较高的周次中，您的平均情绪评分为 ${avgMood.toFixed(1)}，保持规律用药有助于情绪稳定。`,
        confidence: Math.min(highAdherenceWeeks.length / correlations.length, 1),
      });
    }
  }

  if (lowAdherenceWeeks.length > 0) {
    const avgMood =
      lowAdherenceWeeks.reduce((sum, w) => sum + w.avgMood, 0) /
      lowAdherenceWeeks.length;
    if (avgMood < 3) {
      insights.push({
        type: 'negative',
        message: `在用药依从率较低的周次中，您的平均情绪评分为 ${avgMood.toFixed(1)}，建议尽量按时服药。`,
        confidence: Math.min(lowAdherenceWeeks.length / correlations.length, 1),
      });
    }
  }

  // 分析副作用与情绪的关系
  const highSideEffectWeeks = correlations.filter(
    (w) => w.avgSideEffectSeverity >= 3 && w.moodEntries.length > 0,
  );

  if (highSideEffectWeeks.length > 0) {
    const avgMood =
      highSideEffectWeeks.reduce((sum, w) => sum + w.avgMood, 0) /
      highSideEffectWeeks.length;
    if (avgMood < 3) {
      insights.push({
        type: 'negative',
        message: `副作用较明显的周次中，平均情绪评分为 ${avgMood.toFixed(1)}，如副作用持续影响您的生活，建议咨询医生。`,
        confidence: Math.min(
          highSideEffectWeeks.length / correlations.length,
          1,
        ),
      });
    }
  }

  // 趋势分析
  const recentWeeks = correlations.slice(-4);
  if (recentWeeks.length >= 2) {
    const firstHalf = recentWeeks.slice(0, Math.floor(recentWeeks.length / 2));
    const secondHalf = recentWeeks.slice(Math.floor(recentWeeks.length / 2));
    const firstAvg =
      firstHalf.reduce((sum, w) => sum + w.avgMood, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, w) => sum + w.avgMood, 0) / secondHalf.length;
    const diff = secondAvg - firstAvg;

    if (diff > 0.5) {
      insights.push({
        type: 'positive',
        message: `近期情绪呈上升趋势（+${diff.toFixed(1)}），继续保持！`,
        confidence: 0.7,
      });
    } else if (diff < -0.5) {
      insights.push({
        type: 'negative',
        message: `近期情绪有所下降（${diff.toFixed(1)}），请注意自我关怀，必要时寻求帮助。`,
        confidence: 0.7,
      });
    }
  }

  // 如果没有生成任何洞察
  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      message: '目前数据趋势平稳，请继续保持记录习惯。',
      confidence: 0.5,
    });
  }

  return insights;
}

// ========================
// Hook
// ========================

export default function useMedMoodCorrelation() {
  const [moodEntries, setMoodEntries] = useAsyncStorage<MoodEntry[]>(
    'sgt-mood-entries',
    [],
  );
  const [medEvents, setMedEvents] = useAsyncStorage<MedicationEvent[]>(
    'sgt-med-events',
    [],
  );
  const [correlations, setCorrelations] = useAsyncStorage<WeekCorrelation[]>(
    'sgt-correlations',
    [],
  );

  /** 记录情绪 */
  const addMoodEntry = useCallback(
    (mood: number, note?: string) => {
      const entry: MoodEntry = {
        date: formatDate(),
        mood: Math.max(1, Math.min(5, mood)),
        note,
      };
      setMoodEntries((prev) => {
        // 同一天只保留最新记录
        const filtered = prev.filter((e) => e.date !== entry.date);
        return [...filtered, entry].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
      });
      return entry;
    },
    [setMoodEntries],
  );

  /** 记录用药事件 */
  const addMedicationEvent = useCallback(
    (medicationId: string, medicationName: string, dosage: string, taken: boolean = true) => {
      const event: MedicationEvent = {
        date: formatDate(),
        medicationId,
        medicationName,
        dosage,
        taken,
      };
      setMedEvents((prev) => [...prev, event]);
      return event;
    },
    [setMedEvents],
  );

  /** 计算周关联数据 */
  const calculateCorrelations = useCallback(
    (weeks: number = 8): WeekCorrelation[] => {
      const result: WeekCorrelation[] = [];
      const today = new Date();

      for (let i = weeks - 1; i >= 0; i--) {
        const weekDate = new Date(today);
        weekDate.setDate(weekDate.getDate() - i * 7);
        const weekKey = getWeekKey(formatDate(weekDate));

        // 获取该周的情绪数据
        const weekMoodEntries = moodEntries.filter((e) => {
          const entryWeekKey = getWeekKey(e.date);
          return entryWeekKey === weekKey;
        });

        // 获取该周的用药事件
        const weekMedEvents = medEvents.filter((e) => {
          const eventWeekKey = getWeekKey(e.date);
          return eventWeekKey === weekKey;
        });

        const avgMood =
          weekMoodEntries.length > 0
            ? weekMoodEntries.reduce((sum, e) => sum + e.mood, 0) /
              weekMoodEntries.length
            : 0;

        const takenEvents = weekMedEvents.filter((e) => e.taken);
        const adherenceRate =
          weekMedEvents.length > 0
            ? Math.round((takenEvents.length / weekMedEvents.length) * 100)
            : 0;

        // 副作用计数（从用药事件中提取）
        const sideEffectCount = weekMedEvents.filter(
          (e) => !e.taken,
        ).length;

        result.push({
          weekKey,
          avgMood: Math.round(avgMood * 10) / 10,
          adherenceRate,
          sideEffectCount,
          avgSideEffectSeverity: sideEffectCount > 0 ? 2 : 0,
          moodEntries: weekMoodEntries,
          medicationEvents: weekMedEvents,
        });
      }

      setCorrelations(result);
      return result;
    },
    [moodEntries, medEvents, setCorrelations],
  );

  /** 获取分析洞察 */
  const getInsights = useCallback((): CorrelationInsight[] => {
    if (correlations.length === 0) {
      return [
        {
          type: 'neutral',
          message: '暂无足够数据生成分析，请继续记录您的情绪和用药情况。',
          confidence: 0,
        },
      ];
    }
    return generateInsights(correlations);
  }, [correlations]);

  /** 获取指定周的数据 */
  const getWeekData = useCallback(
    (weekKey: string): WeekCorrelation | undefined => {
      return correlations.find((c) => c.weekKey === weekKey);
    },
    [correlations],
  );

  /** 获取情绪趋势 */
  const getMoodTrend = useCallback((): {
    trend: 'improving' | 'declining' | 'stable';
    change: number;
  } => {
    const recent = correlations.filter((c) => c.avgMood > 0).slice(-4);
    if (recent.length < 2) {
      return { trend: 'stable', change: 0 };
    }

    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    const firstAvg =
      firstHalf.reduce((sum, w) => sum + w.avgMood, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, w) => sum + w.avgMood, 0) / secondHalf.length;
    const change = Math.round((secondAvg - firstAvg) * 10) / 10;

    if (change > 0.3) return { trend: 'improving', change };
    if (change < -0.3) return { trend: 'declining', change };
    return { trend: 'stable', change };
  }, [correlations]);

  /** 清除所有数据 */
  const clearAllData = useCallback(() => {
    setMoodEntries([]);
    setMedEvents([]);
    setCorrelations([]);
  }, [setMoodEntries, setMedEvents, setCorrelations]);

  return {
    moodEntries,
    medEvents,
    correlations,
    addMoodEntry,
    addMedicationEvent,
    calculateCorrelations,
    getInsights,
    getWeekData,
    getMoodTrend,
    clearAllData,
  };
}
