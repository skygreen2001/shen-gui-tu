import { getStore, setStore } from '../../utils/store'
import { socialStages } from '../../data/socialTasks'
import { peerStories, storyCategories } from '../../data/peerStories'

const ACTIVITY_TYPES = [
  { key: 'chat', label: '💬 线上聊天' },
  { key: 'phone', label: '📞 电话' },
  { key: 'face', label: '☕ 面对面' },
  { key: 'group', label: '👥 群体活动' },
  { key: 'other', label: '📝 其他' }
]

const ENCOURAGEMENTS = ['🌱 很棒！你又迈出了一步', '💪 你比自己想象的更勇敢', '🌟 每一步都算数', '✨ 继续保持！']

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

Component({
  data: {
    view: 'tasks', // tasks | stories | storyDetail | record
    stages: [],
    activityTypes: ACTIVITY_TYPES,
    completedTasks: {},
    activities: [],
    expandedStage: null,
    feelingTask: null,
    feelingInput: '',
    storyFilter: 'all',
    activeStory: null,
    story: null,
    recordType: '',
    recordNote: '',
    storyCategories,
    filteredStories: peerStories,
    totalTasks: 0,
    doneTasks: 0,
    weekActivities: 0
  },

  lifetimes: {
    attached() {
      const completedTasks = getStore('sgt-social-tasks', {})
      const activities = getStore('sgt-social-activities', [])
      const totalTasks = socialStages.reduce((a, s) => a + s.tasks.length, 0)
      const weekAgo = Date.now() - 7 * 86400000
      const weekActivities = activities.filter(a => a.timestamp >= weekAgo).length
      this.setData({
        stages: this.decorateStages(completedTasks),
        completedTasks,
        activities,
        totalTasks,
        doneTasks: Object.keys(completedTasks).length,
        weekActivities
      })
    }
  },

  methods: {
    /** 为每个阶段计算已完成任务数 */
    decorateStages(completedTasks) {
      return socialStages.map(stage => Object.assign({}, stage, {
        doneCount: stage.tasks.filter(t => completedTasks[t.id]).length
      }))
    },

    /* ── 社交任务 ── */
    toggleStage(e) {
      const si = Number(e.currentTarget.dataset.index)
      this.setData({ expandedStage: this.data.expandedStage === si ? null : si })
    },

    toggleTask(e) {
      const taskId = e.currentTarget.dataset.id
      const completedTasks = Object.assign({}, this.data.completedTasks)
      if (completedTasks[taskId]) {
        delete completedTasks[taskId]
        setStore('sgt-social-tasks', completedTasks)
        this.setData({
          completedTasks,
          doneTasks: Object.keys(completedTasks).length,
          stages: this.decorateStages(completedTasks)
        })
      } else {
        this.setData({ feelingTask: taskId, feelingInput: '' })
      }
    },

    onFeelingInput(e) {
      this.setData({ feelingInput: e.detail.value })
    },

    skipFeeling() {
      this.confirmTask(this.data.feelingTask, '')
    },

    confirmFeeling() {
      this.confirmTask(this.data.feelingTask, this.data.feelingInput || '')
    },

    confirmTask(taskId, feeling) {
      const completedTasks = Object.assign({}, this.data.completedTasks)
      completedTasks[taskId] = { completedAt: new Date().toISOString(), feeling }
      setStore('sgt-social-tasks', completedTasks)
      this.setData({
        completedTasks,
        feelingTask: null,
        doneTasks: Object.keys(completedTasks).length,
        stages: this.decorateStages(completedTasks)
      })
      const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
      wx.showToast({ title: msg, icon: 'none', duration: 2500 })
    },

    /* ── 社交记录 ── */
    goRecord() {
      this.setData({ view: 'record', recordType: '', recordNote: '' })
    },

    selectType(e) {
      this.setData({ recordType: e.currentTarget.dataset.key })
    },

    onRecordNote(e) {
      this.setData({ recordNote: e.detail.value })
    },

    submitRecord() {
      if (!this.data.recordType) {
        wx.showToast({ title: '请选择活动类型', icon: 'none' })
        return
      }
      const activities = [{
        date: todayISO(),
        type: this.data.recordType,
        note: this.data.recordNote,
        timestamp: Date.now()
      }].concat(this.data.activities).slice(0, 90)
      setStore('sgt-social-activities', activities)
      const weekAgo = Date.now() - 7 * 86400000
      this.setData({
        activities,
        view: 'tasks',
        weekActivities: activities.filter(a => a.timestamp >= weekAgo).length
      })
      wx.showToast({ title: '✅ 已记录今天的社交活动', icon: 'none' })
    },

    /* ── 同伴故事 ── */
    goStories() {
      this.setData({ view: 'stories' })
    },

    goTasks() {
      this.setData({ view: 'tasks' })
    },

    filterStories(e) {
      const key = e.currentTarget.dataset.key
      const filtered = key === 'all' ? peerStories : peerStories.filter(s => s.category === key)
      this.setData({ storyFilter: key, filteredStories: filtered })
    },

    openStory(e) {
      const id = e.currentTarget.dataset.id
      const story = peerStories.find(s => s.id === id)
      if (story) {
        this.setData({
          activeStory: id,
          story: Object.assign({}, story, { lines: story.body.split('\n') }),
          view: 'storyDetail'
        })
      }
    },

    backToStories() {
      this.setData({ view: 'stories', activeStory: null, story: null })
    }
  }
})
