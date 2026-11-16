import { hasCheckedToday, getTodayCheckIn, submitCheckIn } from '../../utils/service'

const DIMENSIONS = [
  { key: 'sleep', label: '睡眠质量', icon: '😴', left: '很差', right: '很好', values: [1, 2, 3, 4, 5] },
  { key: 'mood', label: '情绪状态', icon: '😊', left: '低落', right: '愉悦', values: [1, 2, 3, 4, 5] },
  { key: 'body', label: '身体活力', icon: '🏃', left: '疲惫', right: '充沛', values: [1, 2, 3, 4, 5] },
  { key: 'motivation', label: '动力水平', icon: '🎯', left: '无', right: '强烈', values: [1, 2, 3, 4, 5] },
  { key: 'cognition', label: '思维清晰度', icon: '🧠', left: '模糊', right: '清晰', values: [1, 2, 3, 4, 5] },
  { key: 'social', label: '社交意愿', icon: '👥', left: '回避', right: '主动', values: [1, 2, 3, 4, 5] }
]

const ENCOURAGEMENTS = [
  '✅ 签到成功！记录是康复的第一步 💪',
  '🌟 很好！你正在了解自己',
  '🌱 每一天的记录都是成长的种子',
  '💪 你做得很好，继续保持！',
  '🌈 感谢你花时间关注自己'
]

Page({
  data: {
    dimensions: DIMENSIONS,
    ratings: {},
    note: '',
    mode: 'form', // form | done
    editing: false,
    allRated: false,
    doneMsg: '',
    doneTitle: ''
  },

  onLoad(options) {
    // 支持从 dashboard「查看今日签到」进入时直接进入编辑
    if (options && options.edit === '1') {
      this.enterEdit()
    }
  },

  onShow() {
    if (this.data.mode === 'form' && !this.data.editing && hasCheckedToday()) {
      this.setData({ mode: 'done' })
    }
  },

  enterEdit() {
    const today = getTodayCheckIn()
    this.setData({
      editing: true,
      mode: 'form',
      ratings: today ? (today.dimensions || {}) : {},
      note: today ? (today.note || '') : '',
      allRated: this.checkAllRated(today ? (today.dimensions || {}) : {})
    })
  },

  checkAllRated(ratings) {
    return DIMENSIONS.every(d => ratings[d.key])
  },

  selectRating(e) {
    const { key, val } = e.currentTarget.dataset
    const ratings = Object.assign({}, this.data.ratings)
    ratings[key] = Number(val)
    this.setData({ ratings, allRated: this.checkAllRated(ratings) })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  handleSubmit() {
    if (!this.data.allRated) return
    submitCheckIn(this.data.ratings, this.data.note)
    const wasEditing = this.data.editing
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
    this.setData({
      mode: 'done',
      editing: false,
      doneTitle: wasEditing ? '修改成功！' : '签到完成！',
      doneMsg: msg
    })
    wx.showToast({ title: '签到成功', icon: 'success' })
  }
})
