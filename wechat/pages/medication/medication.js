import {
  getMedications, addMedication, recordDose,
  getAdherenceRate, getMedStatus, getStreak, getOnsetPhase
} from '../../utils/service'
import { getMissedDoseAdvice } from '../../data/medicationKnowledge'

const DEFAULT_MEDS = [
  { name: '草酸艾司西酞普兰', dose: '10mg', frequency: '每日一次', time: '早餐后 ⏰' },
  { name: '喹硫平', dose: '25mg', frequency: '每晚一次', time: '睡前 🌙' }
]

const ENCOURAGEMENTS = ['🎉 太棒了！坚持就是胜利', '💪 今天又照顾好自己了', '🌟 用药规律是康复的关键', '🌱 你在为健康做正确的事']
const WARM_MESSAGES = ['😊 没关系，记得和医生聊聊', '💛 偶尔忘记很正常，明天继续', '🤗 身体感受很重要，和医生沟通一下']

Page({
  data: {
    meds: [],
    adherence: 0,
    animatedPct: 0,
    adherenceColor: '#D46B6B',
    streak: 0,
    onsetPhase: { active: false },
    showAdd: false,
    newName: '',
    newDose: ''
  },

  onShow() {
    this.refresh()
    this.startAnimate()
  },

  onHide() {
    if (this._timer) clearInterval(this._timer)
  },

  onUnload() {
    if (this._timer) clearInterval(this._timer)
  },

  refresh() {
    // 首次使用时写入默认药物（对齐 H5 默认药品）
    if (getMedications().length === 0) {
      DEFAULT_MEDS.forEach(med => addMedication(med))
    }
    const adherence = getAdherenceRate(30)
    const meds = getMedications().map(m => Object.assign({}, m, { status: getMedStatus(m.id) }))
    this.setData({
      meds,
      adherence,
      adherenceColor: adherence >= 80 ? '#6BAF7A' : adherence >= 50 ? '#E8C95A' : '#D46B6B',
      streak: getStreak(),
      onsetPhase: getOnsetPhase()
    })
  },

  startAnimate() {
    if (this._timer) clearInterval(this._timer)
    let current = 0
    const target = this.data.adherence
    this._timer = setInterval(() => {
      current += 2
      if (current >= target) { current = target; clearInterval(this._timer) }
      this.setData({ animatedPct: current })
    }, 20)
  },

  handleTake(e) {
    const id = Number(e.currentTarget.dataset.id)
    recordDose(id, 'taken')
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
    wx.showToast({ title: msg, icon: 'none', duration: 2500 })
    this.refresh()
  },

  handleSkip(e) {
    const id = Number(e.currentTarget.dataset.id)
    recordDose(id, 'skipped')
    const med = getMedications().find(m => m.id === id)
    const advice = med ? getMissedDoseAdvice(med.name) : ''
    wx.showToast({ title: advice || WARM_MESSAGES[Math.floor(Math.random() * WARM_MESSAGES.length)], icon: 'none', duration: 3000 })
    this.refresh()
  },

  toggleAdd() {
    this.setData({ showAdd: !this.data.showAdd, newName: '', newDose: '' })
  },

  onNameInput(e) { this.setData({ newName: e.detail.value }) },
  onDoseInput(e) { this.setData({ newDose: e.detail.value }) },

  handleAdd() {
    const { newName, newDose } = this.data
    if (newName.trim() && newDose.trim()) {
      addMedication({ name: newName.trim(), dose: newDose.trim(), frequency: '每日一次', time: '自行安排' })
      this.setData({ showAdd: false, newName: '', newDose: '' })
      this.refresh()
      wx.showToast({ title: '已添加', icon: 'success' })
    }
  },

  goCrisis() {
    wx.navigateTo({ url: '/pages/crisis/crisis' })
  },

  openKnowledge(e) {
    const name = e.currentTarget.dataset.name
    wx.navigateTo({ url: `/pages/med-knowledge/med-knowledge?name=${encodeURIComponent(name)}` })
  },

  goSideEffects() {
    wx.navigateTo({ url: '/pages/side-effects/side-effects' })
  },

  goMoodCorrelation() {
    wx.navigateTo({ url: '/pages/mood-correlation/mood-correlation' })
  },

  goTaper() {
    wx.navigateTo({ url: '/pages/taper/taper' })
  }
})
