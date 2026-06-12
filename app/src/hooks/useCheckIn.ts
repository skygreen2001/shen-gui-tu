import { useCallback } from 'react';
import useAsyncStorage from './useAsyncStorage';
import { formatDate } from '../utils/dateUtils';

// ========================
// 类型定义
// ========================

export interface CheckInRecord {
  date: string;
  dimensions: Record<string, number>;
  note: string;
  timestamp: number;
}

// ========================
// 打卡维度配置
// ========================

const CHECKIN_DIMENSIONS = [
  { key: 'sleep', label: '睡眠', icon: 'moon' },
  { key: 'mood', label: '情绪', icon: 'heart' },
  { key: 'body', label: '身体', icon: 'activity' },
  { key: 'motivation', label: '动力', icon: 'zap' },
  { key: 'cognition', label: '认知', icon: 'brain' },
  { key: 'social', label: '社交', icon: 'users' },
] as const;

export { CHECKIN_DIMENSIONS };

// ========================
// Hook
// ========================

export default function useCheckIn() {
  const [checkIns, setCheckIns] = useAsyncStorage<CheckInRecord[]>(
    'sgt-checkins',
    [],
  );

  /** 添加一条打卡记录 */
  const addCheckIn = useCallback(
    (dimensions: Record<string, number>, note: string = '') => {
      const today = formatDate();
      const newRecord: CheckInRecord = {
        date: today,
        dimensions,
        note,
        timestamp: Date.now(),
      };
      setCheckIns((prev) => {
        // 如果今天已有记录，替换它
        const filtered = prev.filter((r) => r.date !== today);
        return [...filtered, newRecord].sort(
          (a, b) => a.timestamp - b.timestamp,
        );
      });
      return newRecord;
    },
    [setCheckIns],
  );

  /** 获取今天的打卡记录 */
  const getTodayCheckIn = useCallback((): CheckInRecord | undefined => {
    const today = formatDate();
    return checkIns.find((r) => r.date === today);
  }, [checkIns]);

  /** 获取指定日期的打卡记录 */
  const getCheckInByDate = useCallback(
    (date: string): CheckInRecord | undefined => {
      return checkIns.find((r) => r.date === date);
    },
    [checkIns],
  );

  /** 获取最近 N 天的打卡记录 */
  const getRecentCheckIns = useCallback(
    (days: number = 7): CheckInRecord[] => {
      return checkIns.slice(-days);
    },
    [checkIns],
  );

  /** 删除指定日期的打卡记录 */
  const deleteCheckIn = useCallback(
    (date: string) => {
      setCheckIns((prev) => prev.filter((r) => r.date !== date));
    },
    [setCheckIns],
  );

  /** 更新指定日期的打卡记录 */
  const updateCheckIn = useCallback(
    (date: string, dimensions: Record<string, number>, note?: string) => {
      setCheckIns((prev) =>
        prev.map((r) =>
          r.date === date
            ? { ...r, dimensions, note: note !== undefined ? note : r.note }
            : r,
        ),
      );
    },
    [setCheckIns],
  );

  /** 获取连续打卡天数 */
  const getStreak = useCallback((): number => {
    if (checkIns.length === 0) return 0;

    const sortedDates = [...checkIns]
      .map((r) => r.date)
      .sort()
      .reverse();

    const today = formatDate();
    // 如果今天没有打卡，从昨天开始计算
    if (sortedDates[0] !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);
      if (sortedDates[0] !== yesterdayStr) {
        return 0;
      }
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffTime = prev.getTime() - curr.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [checkIns]);

  /** 获取各维度的历史平均值 */
  const getDimensionAverages = useCallback(
    (days: number = 7): Record<string, number> => {
      const recent = checkIns.slice(-days);
      const sums: Record<string, number> = {};
      const counts: Record<string, number> = {};

      CHECKIN_DIMENSIONS.forEach(({ key }) => {
        sums[key] = 0;
        counts[key] = 0;
      });

      recent.forEach((record) => {
        CHECKIN_DIMENSIONS.forEach(({ key }) => {
          const value = record.dimensions[key];
          if (value != null && !isNaN(value)) {
            sums[key] += value;
            counts[key] += 1;
          }
        });
      });

      const averages: Record<string, number> = {};
      CHECKIN_DIMENSIONS.forEach(({ key }) => {
        averages[key] =
          counts[key] > 0
            ? Math.round((sums[key] / counts[key]) * 10) / 10
            : 0;
      });

      return averages;
    },
    [checkIns],
  );

  return {
    checkIns,
    addCheckIn,
    getTodayCheckIn,
    getCheckInByDate,
    getRecentCheckIns,
    deleteCheckIn,
    updateCheckIn,
    getStreak,
    getDimensionAverages,
  };
}
