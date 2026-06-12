/**
 * 风险评估计算器
 * 基于用户打卡数据的多维度加权评分系统
 * 用于心理健康状态追踪和预警
 */

// ========================
// 维度权重配置
// ========================
const WEIGHTS: Record<string, number> = {
  sleep: 0.25,
  mood: 0.20,
  body: 0.15,
  motivation: 0.15,
  cognition: 0.12,
  social: 0.13,
};

// ========================
// 类型定义
// ========================

/** 单次打卡记录中的维度评分 */
export interface CheckInDimensions {
  sleep?: number;
  mood?: number;
  body?: number;
  motivation?: number;
  cognition?: number;
  social?: number;
  [key: string]: number | undefined;
}

/** 单次打卡记录 */
export interface CheckInRecord {
  id: string;
  date: string;
  dimensions: CheckInDimensions;
  note?: string;
  createdAt?: string;
}

/** 风险评估结果 */
export interface RiskResult {
  score: number;
  level: string;
  color: string;
  label: string;
}

// ========================
// 风险等级阈值
// ========================

const RISK_THRESHOLDS = [
  { min: 65, level: 'green', color: '#6BAF7A', label: '状态良好' },
  { min: 45, level: 'yellow', color: '#E8C95A', label: '需要关注' },
  { min: 25, level: 'orange', color: '#E8985E', label: '建议就医' },
  { min: 0, level: 'red', color: '#D46B6B', label: '请尽快就医' },
] as const;

/**
 * 根据分数获取风险等级信息
 * @param score - 风险分数（0-100）
 * @returns 风险等级信息
 */
export function getRiskLevelInfo(score: number): {
  level: string;
  color: string;
  label: string;
} {
  for (const threshold of RISK_THRESHOLDS) {
    if (score >= threshold.min) {
      return {
        level: threshold.level,
        color: threshold.color,
        label: threshold.label,
      };
    }
  }
  return { level: 'red', color: '#D46B6B', label: '请尽快就医' };
}

/**
 * 根据分数获取风险等级名称
 * @param score - 风险分数（0-100）
 * @returns 风险等级名称
 */
export function getRiskLevel(score: number): string {
  return getRiskLevelInfo(score).level;
}

/**
 * 计算综合风险评分
 * 基于最近 7 次打卡记录，对各维度进行加权平均
 *
 * @param checkIns - 打卡记录数组
 * @param days - 回溯天数，默认为 7
 * @returns 风险评估结果
 */
export function calculateRiskScore(
  checkIns: CheckInRecord[],
  days: number = 7,
): RiskResult {
  if (!checkIns || checkIns.length === 0) {
    return {
      score: 0,
      level: 'unknown',
      color: '#E8E4DE',
      label: '暂无数据',
    };
  }

  // 取最近 N 条记录
  const recent = checkIns.slice(-days);

  let totalWeighted = 0;
  let totalWeight = 0;

  recent.forEach((ci) => {
    const dims = ci.dimensions || {};
    Object.keys(WEIGHTS).forEach((key) => {
      const value = dims[key];
      if (value != null && !isNaN(value)) {
        totalWeighted += value * WEIGHTS[key];
        totalWeight += WEIGHTS[key];
      }
    });
  });

  // 如果没有有效的维度数据
  if (totalWeight === 0) {
    return {
      score: 0,
      level: 'unknown',
      color: '#E8E4DE',
      label: '暂无数据',
    };
  }

  // 计算加权平均分并转换为百分制（每个维度 1-5 分）
  const score = Math.round((totalWeighted / totalWeight / 5) * 100);

  // 限制分数范围
  const clampedScore = Math.max(0, Math.min(100, score));

  const { level, color, label } = getRiskLevelInfo(clampedScore);

  return {
    score: clampedScore,
    level,
    color,
    label,
  };
}

/**
 * 计算单次打卡的综合分
 * @param dimensions - 打卡维度评分
 * @returns 综合分（0-100）
 */
export function calculateSingleScore(dimensions: CheckInDimensions): number {
  let totalWeighted = 0;
  let totalWeight = 0;

  Object.keys(WEIGHTS).forEach((key) => {
    const value = dimensions[key];
    if (value != null && !isNaN(value)) {
      totalWeighted += value * WEIGHTS[key];
      totalWeight += WEIGHTS[key];
    }
  });

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round((totalWeighted / totalWeight / 5) * 100);
}

/**
 * 获取各维度的平均分
 * @param checkIns - 打卡记录数组
 * @param days - 回溯天数，默认为 7
 * @returns 各维度的平均分（0-5）
 */
export function getDimensionAverages(
  checkIns: CheckInRecord[],
  days: number = 7,
): Record<string, number> {
  const recent = checkIns.slice(-days);
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  const dimensionKeys = Object.keys(WEIGHTS);

  dimensionKeys.forEach((key) => {
    sums[key] = 0;
    counts[key] = 0;
  });

  recent.forEach((ci) => {
    const dims = ci.dimensions || {};
    dimensionKeys.forEach((key) => {
      const value = dims[key];
      if (value != null && !isNaN(value)) {
        sums[key] += value;
        counts[key] += 1;
      }
    });
  });

  const averages: Record<string, number> = {};
  dimensionKeys.forEach((key) => {
    averages[key] =
      counts[key] > 0 ? Math.round((sums[key] / counts[key]) * 10) / 10 : 0;
  });

  return averages;
}

/**
 * 维度中文名称映射
 */
export const DIMENSION_LABELS: Record<string, string> = {
  sleep: '睡眠',
  mood: '情绪',
  body: '身体',
  motivation: '动力',
  cognition: '认知',
  social: '社交',
};

/**
 * 维度图标标识映射（用于 UI 展示）
 */
export const DIMENSION_ICONS: Record<string, string> = {
  sleep: 'moon',
  mood: 'heart',
  body: 'activity',
  motivation: 'zap',
  cognition: 'brain',
  social: 'users',
};
