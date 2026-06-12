import { useMemo } from 'react';
import { calculateRiskScore, getRiskLevelInfo } from '../utils/riskCalculator';
import type { CheckInRecord } from './useCheckIn';

// ========================
// 类型定义
// ========================

export interface RiskLevelInfo {
  score: number;
  level: string;
  color: string;
  label: string;
}

// ========================
// Hook
// ========================

/**
 * 风险等级评估 Hook
 * 基于用户打卡数据计算综合风险评分
 *
 * @param checkIns - 打卡记录数组
 * @param days - 回溯天数，默认 7 天
 * @returns 风险等级信息
 */
export default function useRiskLevel(
  checkIns: CheckInRecord[],
  days: number = 7,
): RiskLevelInfo {
  const riskResult = useMemo(() => {
    // 将 CheckInRecord 转换为 riskCalculator 期望的格式
    const convertedRecords = checkIns.map((record) => ({
      id: record.date,
      date: record.date,
      dimensions: record.dimensions,
      note: record.note || undefined,
      createdAt: new Date(record.timestamp).toISOString(),
    }));

    return calculateRiskScore(convertedRecords, days);
  }, [checkIns, days]);

  const levelInfo = useMemo(() => {
    return getRiskLevelInfo(riskResult.score);
  }, [riskResult.score]);

  return {
    score: riskResult.score,
    level: riskResult.level,
    color: riskResult.color,
    label: riskResult.label,
  };
}
