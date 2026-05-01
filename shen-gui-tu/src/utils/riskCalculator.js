const WEIGHTS = { sleep: 0.25, mood: 0.20, body: 0.15, motivation: 0.15, cognition: 0.12, social: 0.13 }

export function calculateRiskScore(checkIns) {
  if (!checkIns || checkIns.length === 0) return { score: 0, level: 'unknown', color: 'var(--border)', label: '暂无数据' }
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
  if (totalWeight === 0) return { score: 0, level: 'unknown', color: 'var(--border)', label: '暂无数据' }
  const score = Math.round((totalWeighted / totalWeight / 5) * 100)
  let level, color, label
  if (score >= 65) { level = 'green'; color = 'var(--success)'; label = '状态良好' }
  else if (score >= 45) { level = 'yellow'; color = 'var(--warning)'; label = '需要关注' }
  else if (score >= 25) { level = 'orange'; color = 'var(--accent)'; label = '建议就医' }
  else { level = 'red'; color = 'var(--danger)'; label = '请尽快就医' }
  return { score, level, color, label }
}

export function getRiskLevel(score) {
  if (score >= 65) return 'green'
  if (score >= 45) return 'yellow'
  if (score >= 25) return 'orange'
  return 'red'
}
