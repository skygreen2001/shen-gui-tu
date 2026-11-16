import { getStore, setStore } from '../../utils/store'
import { getISOWeekNumber } from '../../utils/date'

const DEFAULT_ITEMS = [
  { key: 'weight', label: '体重变化' },
  { key: 'drowsiness', label: '嗜睡' },
  { key: 'sexual', label: '性功能' },
  { key: 'gi', label: '胃肠反应' },
  { key: 'insomnia', label: '失眠' },
  { key: 'appetite', label: '食欲变化' },
  { key: 'anxiety', label: '焦虑/躁动' }
]

const LEVELS = ['无', '轻微', '轻度', '中度', '重度']

// 循证应对策略（对齐 H5 SideEffectTracker）
const COPING_STRATEGIES = {
  weight: [
    '🏃 每周至少3次30分钟有氧运动（散步、游泳）',
    '🥗 选择高纤维、低热量食物，避免含糖饮料',
    '📊 每周固定时间称重并记录，关注趋势而非单次数值'
  ],
  drowsiness: [
    '⏰ 尝试将服药时间调整到睡前（请先咨询医生）',
    '☕ 上午适量咖啡因可能帮助（避免下午后摄入）',
    '🚶 白天短时间散步（10-15分钟）有助于提神'
  ],
  sexual: [
    '💬 不要羞于和医生沟通，这是常见的药物反应',
    '📅 医生可能会调整剂量或换药，多数情况可以改善',
    '🤝 与伴侣坦诚沟通，减少心理压力'
  ],
  gi: [
    '🍽️ 随餐服药或饭后服用可减轻胃肠不适',
    '🫖 避免辛辣、油腻食物，少食多餐',
    '💧 保持充足水分摄入'
  ],
  insomnia: [
    '🌙 建立固定的睡前仪式：洗温水澡、轻度拉伸、避免屏幕',
    '⏰ 白天固定时间起床，即使没睡好也不要赖床',
    '🧘 尝试「三分钟呼吸空间」练习（可在干预训练中找到）'
  ],
  appetite: [
    '📋 每日记录饮食，帮助了解食欲变化模式',
    '🍽️ 定时进餐，即使不饿也吃少量健康食物',
    '🥜 准备一些营养密集的零食（坚果、酸奶）'
  ],
  anxiety: [
    '🧠 提醒自己：这可能是药物初期的暂时反应，通常1-2周后减轻',
    '🌬️ 焦虑时尝试「三分钟呼吸空间」练习',
    '📞 如果焦虑严重或持续加重，请及时联系医生'
  ]
}

Page({
  data: {
    items: DEFAULT_ITEMS,
    levels: LEVELS,
    ratings: {},
    note: '',
    view: 'form', // form | history | strategies | report
    strategies: [],
    reportText: '',
    reports: [],
    displayReports: [],
    totalScore: 0,
    hasReports: false
  },

  onShow() {
    this.refreshReports()
  },

  refreshReports() {
    const reports = getStore('sgt-side-effects', [])
    // 展示最近8条，倒序（对齐 H5 slice(-8).reverse()）
    const displayReports = reports.slice(-8).reverse().map(r => Object.assign({}, r, {
      total: r.items.reduce((a, b) => a + b.value, 0)
    }))
    this.setData({ reports, displayReports, hasReports: reports.length > 0 })
  },

  goBack() {
    if (this.data.view === 'strategies' || this.data.view === 'report') {
      this.setData({ view: 'form' })
    } else {
      wx.navigateBack()
    }
  },

  switchView(e) {
    const view = e.currentTarget.dataset.view
    if (view === 'report') {
      this.generateReport()
      return
    }
    this.setData({ view })
  },

  selectRating(e) {
    const { key, val } = e.currentTarget.dataset
    const ratings = Object.assign({}, this.data.ratings)
    ratings[key] = Number(val)
    let totalScore = 0
    Object.keys(ratings).forEach(k => { totalScore += ratings[k] })
    this.setData({ ratings, totalScore })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  handleSubmit() {
    const { ratings, note } = this.data
    const items = DEFAULT_ITEMS.map(item => ({
      key: item.key,
      label: item.label,
      value: ratings[item.key] || 0
    }))
    const now = new Date()
    const weekNum = getISOWeekNumber(now)
    const pad = n => String(n).padStart(2, '0')
    const newReport = {
      id: Date.now(),
      weekKey: `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`,
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      items,
      note,
      timestamp: Date.now()
    }
    const reports = getStore('sgt-side-effects', [])
    reports.push(newReport)
    setStore('sgt-side-effects', reports)
    this.setData({ ratings: {}, note: '', totalScore: 0 })
    this.refreshReports()

    // 为评分 >= 2 的条目生成应对策略
    const highItems = items.filter(item => item.value >= 2)
    if (highItems.length > 0) {
      const tips = []
      highItems.forEach(item => {
        const s = COPING_STRATEGIES[item.key]
        if (s) tips.push({ label: item.label, value: item.value, levelLabel: LEVELS[item.value], strategies: s })
      })
      this.setData({ strategies: tips, view: 'strategies' })
    } else {
      wx.showToast({ title: '✅ 副作用周报已记录，各项指标良好！', icon: 'none', duration: 2500 })
    }
  },

  generateReport() {
    const reports = this.data.reports
    if (reports.length === 0) return
    const recent = reports.slice(-4)
    const lines = [
      '📋 副作用追踪报告',
      `生成日期：${new Date().toLocaleDateString('zh-CN')}`,
      `记录周期：${recent.length} 周`,
      '──────────────',
      ''
    ]
    recent.forEach(r => {
      const score = r.items.reduce((a, b) => a + b.value, 0)
      const highItems = r.items.filter(i => i.value >= 2).map(i => `${i.label}(${LEVELS[i.value]})`)
      lines.push(`📅 ${r.date}（${r.weekKey}）总分：${score}/28`)
      if (highItems.length > 0) lines.push(`   较明显：${highItems.join('、')}`)
      if (r.note) lines.push(`   备注：${r.note}`)
      lines.push('')
    })
    if (recent.length >= 2) {
      const first = recent[0].items.reduce((a, b) => a + b.value, 0)
      const last = recent[recent.length - 1].items.reduce((a, b) => a + b.value, 0)
      const trend = last < first ? '↓ 改善趋势' : last > first ? '↑ 需要关注' : '→ 保持稳定'
      lines.push(`📊 趋势分析：${trend}（${first} → ${last}）`)
    }
    lines.push('')
    lines.push('此报告由「申归途」小程序自动生成，仅供参考。')
    this.setData({ reportText: lines.join('\n'), view: 'report' })
  },

  copyReport() {
    wx.setClipboardData({
      data: this.data.reportText,
      success: () => {
        wx.showToast({ title: '✅ 报告已复制，复诊时可粘贴给医生', icon: 'none' })
      },
      fail: () => {
        wx.showToast({ title: '复制失败，请手动选择文本复制', icon: 'none' })
      }
    })
  }
})
