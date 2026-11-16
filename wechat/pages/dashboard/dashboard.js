import {
  getRiskResult, getRecentCheckIns, hasCheckedToday, getAdherenceRate
} from '../../utils/service'
import { clearAllData } from '../../utils/store'

const DIM_COLORS = ['#B2BEC3', '#6BAF7A', '#4A90D9', '#E8C95A', '#E8985E', '#D46B6B']
const DIM_KEYS = ['sleep', 'mood', 'body', 'motivation', 'cognition', 'social']
const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

Page({
  data: {
    score: 0,
    level: 'unknown',
    levelLabel: '暂无数据',
    hasCheckedToday: false,
    streak: 0,
    adherence: 0,
    recentCount: 0,
    trendData: [],
    dayLabels: DAY_LABELS,
    isRed: false
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const { score, level, label } = getRiskResult()
    const recent = getRecentCheckIns(7)

    // 打卡天数（最近连续记录数，对齐 H5 简化实现）
    const streak = recent.length

    // 近7天趋势数据：7天 × 6维，逐日构建柱高
    const trendData = Array.from({ length: 7 }, () => [])
    const byDate = {}
    recent.forEach(ci => { byDate[ci.date] = ci })
    // 按最近7个自然日排列（一~日）
    const dayList = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      dayList.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    }
    dayList.forEach((dateStr, i) => {
      const ci = byDate[dateStr]
      DIM_KEYS.forEach((key, di) => {
        const val = ci && ci.dimensions && ci.dimensions[key] ? ci.dimensions[key] : 0
        trendData[i].push({
          height: val * 24, // rpx
          color: DIM_COLORS[di],
          opacity: val ? 0.7 : 0.2
        })
      })
    })

    this.setData({
      score,
      level,
      levelLabel: label,
      hasCheckedToday: hasCheckedToday(),
      streak,
      adherence: getAdherenceRate(30),
      recentCount: recent.length,
      trendData,
      isRed: level === 'red'
    })
  },

  goCheckIn() {
    wx.navigateTo({ url: '/pages/checkin/checkin' })
  },

  goMedication() {
    wx.switchTab({ url: '/pages/medication/medication' })
  },

  goWrap() {
    wx.navigateTo({ url: '/pages/wrap/wrap' })
  },

  goCrisis() {
    wx.navigateTo({ url: '/pages/crisis/crisis' })
  },

  callHotline() {
    wx.makePhoneCall({ phoneNumber: '962525' })
  },

  /** 重置所有数据（对应 H5 开发环境重置功能，小程序保留并默认开启） */
  confirmReset() {
    wx.showModal({
      title: '重置所有数据',
      content: '确定要清除所有用户数据吗？包括签到记录、用药记录、副作用追踪等，此操作不可撤销。',
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#D46B6B',
      success: res => {
        if (res.confirm) {
          clearAllData()
          wx.reLaunch({ url: '/pages/welcome/welcome' })
        }
      }
    })
  }
})
