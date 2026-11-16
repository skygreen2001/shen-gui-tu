/**
 * 风险评分（对齐 H5 utils/riskCalculator.js）
 * 小程序中不支持 CSS var()，这里直接给出十六进制色值。
 */
const WEIGHTS = { sleep: 0.25, mood: 0.20, body: 0.15, motivation: 0.15, cognition: 0.12, social: 0.13 }

const COLORS = {
  green: '#6BAF7A',
  yellow: '#E8C95A',
  orange: '#E8985E',
  red: '#D46B6B',
  unknown: '#E8E4DE'
}

export function calculateRiskScore(checkIns) {
  if (!checkIns || checkIns.length === 0) {
    return { score: 0, level: 'unknown', color: COLORS.unknown, label: '暂无数据' }
  }
  const recent = checkIns.slice(-7)
  let totalWeighted = 0
  let totalWeight = 0
  recent.forEach(ci => {
    const dims = ci.dimensions || {}
    Object.keys(WEIGHTS).forEach(key => {
      if (dims[key] != null) {
        totalWeighted += dims[key] * WEIGHTS[key]
        totalWeight += WEIGHTS[key]
      }
    })
  })
  if (totalWeight === 0) {
    return { score: 0, level: 'unknown', color: COLORS.unknown, label: '暂无数据' }
  }
  const score = Math.round((totalWeighted / totalWeight / 5) * 100)
  let level, label
  if (score >= 65) { level = 'green'; label = '状态良好' }
  else if (score >= 45) { level = 'yellow'; label = '需要关注' }
  else if (score >= 25) { level = 'orange'; label = '建议就医' }
  else { level = 'red'; label = '请尽快就医' }
  return { score, level, color: COLORS[level], label }
}

export function getRiskLevel(score) {
  if (score >= 65) return 'green'
  if (score >= 45) return 'yellow'
  if (score >= 25) return 'orange'
  return 'red'
}

export const RISK_COLORS = COLORS
