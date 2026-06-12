import { useCallback } from 'react';
import useAsyncStorage from './useAsyncStorage';
import { formatDate } from '../utils/dateUtils';

// ========================
// 类型定义
// ========================

export interface MedicationRecord {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  currentDosage?: string;
  notes?: string;
  isActive: boolean;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  time: string;
  dosage: string;
  taken: boolean;
  sideEffects?: string;
  mood?: number;
  note?: string;
  timestamp: number;
}

export interface SideEffectRecord {
  id: string;
  medicationId: string;
  date: string;
  symptom: string;
  severity: number; // 1-5
  note?: string;
  timestamp: number;
}

// ========================
// Hook
// ========================

export default function useMedication() {
  const [medications, setMedications] = useAsyncStorage<MedicationRecord[]>(
    'sgt-medications',
    [],
  );
  const [medLogs, setMedLogs] = useAsyncStorage<MedicationLog[]>(
    'sgt-med-logs',
    [],
  );
  const [sideEffects, setSideEffects] = useAsyncStorage<SideEffectRecord[]>(
    'sgt-side-effects',
    [],
  );

  // ========================
  // 药物管理
  // ========================

  /** 添加药物 */
  const addMedication = useCallback(
    (med: Omit<MedicationRecord, 'id' | 'isActive'>) => {
      const newMed: MedicationRecord = {
        ...med,
        id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        isActive: true,
      };
      setMedications((prev) => [...prev, newMed]);
      return newMed;
    },
    [setMedications],
  );

  /** 更新药物 */
  const updateMedication = useCallback(
    (id: string, updates: Partial<MedicationRecord>) => {
      setMedications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      );
    },
    [setMedications],
  );

  /** 停用药物 */
  const deactivateMedication = useCallback(
    (id: string) => {
      setMedications((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, isActive: false, endDate: formatDate() }
            : m,
        ),
      );
    },
    [setMedications],
  );

  /** 删除药物 */
  const deleteMedication = useCallback(
    (id: string) => {
      setMedications((prev) => prev.filter((m) => m.id !== id));
    },
    [setMedications],
  );

  /** 获取活跃药物 */
  const getActiveMedications = useCallback((): MedicationRecord[] => {
    return medications.filter((m) => m.isActive);
  }, [medications]);

  /** 获取指定药物 */
  const getMedicationById = useCallback(
    (id: string): MedicationRecord | undefined => {
      return medications.find((m) => m.id === id);
    },
    [medications],
  );

  // ========================
  // 用药日志
  // ========================

  /** 记录用药 */
  const logMedication = useCallback(
    (
      medicationId: string,
      dosage: string,
      options?: {
        taken?: boolean;
        sideEffects?: string;
        mood?: number;
        note?: string;
      },
    ) => {
      const now = new Date();
      const log: MedicationLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        medicationId,
        date: formatDate(),
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        dosage,
        taken: options?.taken ?? true,
        sideEffects: options?.sideEffects,
        mood: options?.mood,
        note: options?.note,
        timestamp: Date.now(),
      };
      setMedLogs((prev) => [...prev, log]);
      return log;
    },
    [setMedLogs],
  );

  /** 获取指定日期的用药日志 */
  const getLogsByDate = useCallback(
    (date: string): MedicationLog[] => {
      return medLogs.filter((l) => l.date === date);
    },
    [medLogs],
  );

  /** 获取指定药物的日志 */
  const getLogsByMedication = useCallback(
    (medicationId: string, days?: number): MedicationLog[] => {
      let logs = medLogs.filter((l) => l.medicationId === medicationId);
      if (days) {
        logs = logs.slice(-days);
      }
      return logs;
    },
    [medLogs],
  );

  /** 获取最近 N 天的用药日志 */
  const getRecentLogs = useCallback(
    (days: number = 7): MedicationLog[] => {
      return medLogs.slice(-days * 3); // 估算：每天最多 3 次用药
    },
    [medLogs],
  );

  /** 计算用药依从率 */
  const getAdherenceRate = useCallback(
    (days: number = 7): number => {
      const activeMeds = medications.filter((m) => m.isActive);
      if (activeMeds.length === 0) return 0;

      const recentLogs = medLogs.filter((l) => {
        const logDate = new Date(l.date);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return logDate >= cutoff && l.taken;
      });

      // 简化计算：实际记录数 / 预期记录数
      const expectedCount = activeMeds.length * days;
      const actualCount = recentLogs.length;
      return expectedCount > 0
        ? Math.round((actualCount / expectedCount) * 100)
        : 0;
    },
    [medications, medLogs],
  );

  // ========================
  // 副作用追踪
  // ========================

  /** 记录副作用 */
  const logSideEffect = useCallback(
    (
      medicationId: string,
      symptom: string,
      severity: number,
      note?: string,
    ) => {
      const record: SideEffectRecord = {
        id: `se-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        medicationId,
        date: formatDate(),
        symptom,
        severity: Math.max(1, Math.min(5, severity)),
        note,
        timestamp: Date.now(),
      };
      setSideEffects((prev) => [...prev, record]);
      return record;
    },
    [setSideEffects],
  );

  /** 获取指定药物的副作用记录 */
  const getSideEffectsByMedication = useCallback(
    (medicationId: string, days?: number): SideEffectRecord[] => {
      let records = sideEffects.filter((r) => r.medicationId === medicationId);
      if (days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        records = records.filter((r) => new Date(r.date) >= cutoff);
      }
      return records;
    },
    [sideEffects],
  );

  /** 获取最近的副作用记录 */
  const getRecentSideEffects = useCallback(
    (days: number = 7): SideEffectRecord[] => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return sideEffects.filter((r) => new Date(r.date) >= cutoff);
    },
    [sideEffects],
  );

  /** 获取副作用统计 */
  const getSideEffectStats = useCallback(
    (days: number = 30): { symptom: string; count: number; avgSeverity: number }[] => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const recent = sideEffects.filter((r) => new Date(r.date) >= cutoff);

      const statsMap: Record<string, { count: number; totalSeverity: number }> = {};
      recent.forEach((r) => {
        if (!statsMap[r.symptom]) {
          statsMap[r.symptom] = { count: 0, totalSeverity: 0 };
        }
        statsMap[r.symptom].count += 1;
        statsMap[r.symptom].totalSeverity += r.severity;
      });

      return Object.entries(statsMap)
        .map(([symptom, stats]) => ({
          symptom,
          count: stats.count,
          avgSeverity:
            Math.round((stats.totalSeverity / stats.count) * 10) / 10,
        }))
        .sort((a, b) => b.count - a.count);
    },
    [sideEffects],
  );

  return {
    // 药物管理
    medications,
    addMedication,
    updateMedication,
    deactivateMedication,
    deleteMedication,
    getActiveMedications,
    getMedicationById,
    // 用药日志
    medLogs,
    logMedication,
    getLogsByDate,
    getLogsByMedication,
    getRecentLogs,
    getAdherenceRate,
    // 副作用
    sideEffects,
    logSideEffect,
    getSideEffectsByMedication,
    getRecentSideEffects,
    getSideEffectStats,
  };
}
