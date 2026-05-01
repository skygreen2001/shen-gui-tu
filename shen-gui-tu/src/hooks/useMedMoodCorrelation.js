import { useMemo } from 'react'
import useLocalStorage from './useLocalStorage'

/**
 * 药物-情绪联动分析 hook
 * 跨数据源读取签到（情绪）和副作用数据，生成按周汇总
 */
export default function useMedMoodCorrelation() {
  const [checkIns] = useLocalStorage('sgt-checkins', [])
  const [sideEffects] = useLocalStorage('sgt-side-effects', [])

  const analysis = useMemo(() => {
    // 按周聚合签到数据（取每周平均情绪分）
    const weeklyMood = {}
    checkIns.forEach(ci => {
      if (!ci.date || !ci.dimensions) return
      const weekKey = getWeekKey(ci.date)
      if (!weeklyMood[weekKey]) weeklyMood[weekKey] = []
      // 情绪维度取 0-10 分
      const mood = ci.dimensions.mood ?? ci.dimensions['情绪'] ?? null
      if (mood !== null) weeklyMood[weekKey].push(Number(mood))
    })

    // 副作用数据已经是按周的
    const weeklySideEffects = {}
    sideEffects.forEach(r => {
      if (!r.weekKey) return
      const total = r.items?.reduce((a, b) => a + b.value, 0) ?? 0
      weeklySideEffects[r.weekKey] = total
    })

    // 合并所有周 key，取最近 8 周
    const allWeeks = [...new Set([...Object.keys(weeklyMood), ...Object.keys(weeklySideEffects)])].sort().slice(-8)

    const weeks = allWeeks.map(wk => ({
      weekKey: wk,
      avgMood: weeklyMood[wk] ? Math.round(weeklyMood[wk].reduce((a, b) => a + b, 0) / weeklyMood[wk].length * 10) / 10 : null,
      sideEffectScore: weeklySideEffects[wk] ?? null,
    }))

    // 生成简单洞察
    const insights = generateInsights(weeks)

    return { weeks, insights, hasData: weeks.length >= 2 }
  }, [checkIns, sideEffects])

  return analysis
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr)
  const weekNum = getISOWeekNumber(d)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

function generateInsights(weeks) {
  if (weeks.length < 2) return ['继续记录签到和副作用周报，积累更多数据后将为你生成分析洞察。']

  const insights = []
  const moodWeeks = weeks.filter(w => w.avgMood !== null)
  const seWeeks = weeks.filter(w => w.sideEffectScore !== null)

  // 情绪趋势
  if (moodWeeks.length >= 2) {
    const recent = moodWeeks.slice(-3).map(w => w.avgMood)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    if (avg >= 7) insights.push('📊 近期情绪状态良好，继续保持！')
    else if (avg >= 5) insights.push('📊 情绪处于中等水平，建议关注睡眠和运动。')
    else insights.push('📊 近期情绪偏低，建议及时与医生沟通。')
  }

  // 副作用趋势
  if (seWeeks.length >= 2) {
    const last = seWeeks[seWeeks.length - 1].sideEffectScore
    const prev = seWeeks[seWeeks.length - 2].sideEffectScore
    if (last > prev + 3) insights.push('⚠️ 副作用评分较上周明显上升，建议记录具体症状并告知医生。')
    else if (last < prev - 3) insights.push('✅ 副作用评分较上周下降，身体正在适应。')
  }

  // 情绪-副作用关联
  if (moodWeeks.length >= 2 && seWeeks.length >= 2) {
    const both = weeks.filter(w => w.avgMood !== null && w.sideEffectScore !== null)
    if (both.length >= 2) {
      const highSE = both.filter(w => w.sideEffectScore >= 10)
      const lowSE = both.filter(w => w.sideEffectScore < 10)
      if (highSE.length > 0 && lowSE.length > 0) {
        const avgMoodHigh = highSE.reduce((a, w) => a + w.avgMood, 0) / highSE.length
        const avgMoodLow = lowSE.reduce((a, w) => a + w.avgMood, 0) / lowSE.length
        if (avgMoodHigh < avgMoodLow - 1) {
          insights.push('💡 数据显示副作用较高时情绪偏低，这可能值得关注。')
        }
      }
    }
  }

  if (insights.length === 0) insights.push('📊 数据正在积累中，坚持记录将获得更精准的分析。')
  return insights
}
