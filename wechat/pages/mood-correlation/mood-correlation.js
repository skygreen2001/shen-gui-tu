import { getStore } from '../../utils/store'
import { getWeekKey } from '../../utils/date'

/**
 * 药物-情绪联动分析（对齐 H5 useMedMoodCorrelation）
 */
function generateInsights(weeks) {
  if (weeks.length < 2) return ['继续记录签到和副作用周报，积累更多数据后将为你生成分析洞察。']

  const insights = []
  const moodWeeks = weeks.filter(w => w.avgMood !== null)
  const seWeeks = weeks.filter(w => w.sideEffectScore !== null)

  if (moodWeeks.length >= 2) {
    const recent = moodWeeks.slice(-3).map(w => w.avgMood)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    if (avg >= 7) insights.push('📊 近期情绪状态良好，继续保持！')
    else if (avg >= 5) insights.push('📊 情绪处于中等水平，建议关注睡眠和运动。')
    else insights.push('📊 近期情绪偏低，建议及时与医生沟通。')
  }

  if (seWeeks.length >= 2) {
    const last = seWeeks[seWeeks.length - 1].sideEffectScore
    const prev = seWeeks[seWeeks.length - 2].sideEffectScore
    if (last > prev + 3) insights.push('⚠️ 副作用评分较上周明显上升，建议记录具体症状并告知医生。')
    else if (last < prev - 3) insights.push('✅ 副作用评分较上周下降，身体正在适应。')
  }

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

Page({
  data: {
    weeks: [],
    insights: [],
    hasData: false
  },

  onShow() {
    this.analyze()
  },

  goBack() {
    wx.navigateBack()
  },

  analyze() {
    const checkIns = getStore('sgt-checkins', [])
    const sideEffects = getStore('sgt-side-effects', [])

    // 按周聚合签到数据（取每周平均情绪分）
    const weeklyMood = {}
    checkIns.forEach(ci => {
      if (!ci.date || !ci.dimensions) return
      const weekKey = getWeekKey(ci.date)
      if (!weeklyMood[weekKey]) weeklyMood[weekKey] = []
      const mood = ci.dimensions.mood != null ? ci.dimensions.mood : null
      if (mood !== null) weeklyMood[weekKey].push(Number(mood))
    })

    const weeklySideEffects = {}
    sideEffects.forEach(r => {
      if (!r.weekKey) return
      const total = r.items ? r.items.reduce((a, b) => a + b.value, 0) : 0
      weeklySideEffects[r.weekKey] = total
    })

    // 合并所有周 key，取最近 8 周
    const allWeeks = Array.from(new Set([].concat(Object.keys(weeklyMood), Object.keys(weeklySideEffects))))
      .sort().slice(-8)

    const weeks = allWeeks.map(wk => ({
      weekKey: wk,
      shortKey: wk.replace(/^\d{4}-/, ''),
      avgMood: weeklyMood[wk] ? Math.round(weeklyMood[wk].reduce((a, b) => a + b, 0) / weeklyMood[wk].length * 10) / 10 : null,
      moodHeight: weeklyMood[wk] ? Math.round(weeklyMood[wk].reduce((a, b) => a + b, 0) / weeklyMood[wk].length * 10) : 0,
      sideEffectScore: weeklySideEffects[wk] != null ? weeklySideEffects[wk] : null,
      seHeight: weeklySideEffects[wk] != null ? Math.round(weeklySideEffects[wk] / 28 * 100) : 0
    }))

    this.setData({
      weeks,
      insights: generateInsights(weeks),
      hasData: weeks.length >= 2
    })
  }
})
