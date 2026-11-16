import { cbtCourses, tierInfo } from '../../data/cbtContent'
import { getStore, setStore } from '../../utils/store'

function formatTime(ms) {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

Page({
  data: {
    view: 'list', // list | course
    groupedCourses: [],
    course: null,
    step: null,
    activeStepIdx: 0,
    toast: '',
    collapsedTiers: {},
    /* 引导练习播放器状态（对齐 H5 GuidedPlayer） */
    gp: {
      type: '',
      playing: false,
      paused: false,
      finished: false,
      idx: 0,
      seg: null,
      segments: [],
      countdown: 0,
      progress: 0,
      elapsedText: '0:00',
      totalText: '0:00',
      bodyParts: [],
      hasAudio: false,
      phaseLabel: ''
    }
  },

  onShow() {
    this.refreshList()
  },

  onHide() {
    this.stopGpAll()
  },

  onUnload() {
    this.stopGpAll()
  },

  goCrisis() {
    wx.navigateTo({ url: '/pages/crisis/crisis' })
  },

  refreshList() {
    const progress = getStore('sgt-cbt-progress', {})
    const groupedCourses = tierInfo.map(tier => {
      const courses = cbtCourses.filter(c => c.tier === tier.tier).map(c => ({
        id: c.id,
        title: c.title,
        icon: c.icon,
        desc: c.desc,
        tag: c.tag,
        prerequisites: c.prerequisites || [],
        completed: !!progress[c.id],
        isLocked: (c.prerequisites || []).some(preId => !progress[preId]),
        tierColor: tier.color
      }))
      return {
        tier: tier.tier,
        title: tier.title,
        desc: tier.desc,
        color: tier.color,
        courses,
        doneCount: courses.filter(c => c.completed).length
      }
    })
    this.setData({ groupedCourses, progress })
  },

  toggleTier(e) {
    const tier = Number(e.currentTarget.dataset.tier)
    const collapsedTiers = Object.assign({}, this.data.collapsedTiers)
    collapsedTiers[tier] = !collapsedTiers[tier]
    this.setData({ collapsedTiers })
  },

  openCourse(e) {
    const id = Number(e.currentTarget.dataset.id)
    const idx = cbtCourses.findIndex(c => c.id === id)
    if (idx === -1) return
    const course = cbtCourses[idx]
    const isLocked = (course.prerequisites || []).some(preId => !this.data.progress[preId])
    if (isLocked) {
      wx.showToast({ title: '🔒 请先完成前面的课程', icon: 'none' })
      return
    }
    this.setData({
      view: 'course',
      course: Object.assign({}, course, { steps: course.steps }),
      activeStepIdx: 0,
      step: this.decorateStep(course.steps[0])
    })
  },

  decorateStep(step) {
    const decorated = Object.assign({}, step)
    if (!step.guided) {
      decorated.lines = step.body.split('\n')
    } else {
      const segments = step.guided.segments.map(s => Object.assign({}, s))
      this.setData({
        gp: {
          type: step.guided.type,
          playing: false,
          paused: false,
          finished: false,
          idx: 0,
          seg: null,
          segments,
          countdown: 0,
          progress: 0,
          elapsedText: '0:00',
          totalText: formatTime(segments.reduce((a, s) => a + s.duration, 0)),
          bodyParts: segments.filter(s => s.part).map(s => s.part),
          hasAudio: segments.some(s => s.audio),
          phaseLabel: '准备开始'
        }
      })
      decorated.lines = step.body.split('\n')
    }
    return decorated
  },

  prevStep() {
    if (this.data.activeStepIdx === 0) return
    this.stopGpAll()
    this.setData({
      activeStepIdx: this.data.activeStepIdx - 1,
      step: this.decorateStep(this.data.course.steps[this.data.activeStepIdx - 1])
    })
  },

  nextStep() {
    const { course, activeStepIdx } = this.data
    if (activeStepIdx < course.steps.length - 1) {
      this.stopGpAll()
      this.setData({
        activeStepIdx: activeStepIdx + 1,
        step: this.decorateStep(course.steps[activeStepIdx + 1])
      })
    } else {
      const progress = Object.assign({}, this.data.progress)
      progress[course.id] = true
      setStore('sgt-cbt-progress', progress)
      this.setData({ view: 'list', progress })
      this.refreshList()
      wx.showToast({ title: '🎉 恭喜完成课程！', icon: 'none', duration: 2500 })
    }
  },

  closeCourse() {
    this.stopGpAll()
    this.setData({ view: 'list', course: null, step: null, activeStepIdx: 0 })
  },

  /* ────────── 引导练习播放器 ────────── */

  stopGpTimers() {
    if (this._gpTimeout) clearTimeout(this._gpTimeout)
    if (this._gpInterval) clearInterval(this._gpInterval)
    this._gpTimeout = null
    this._gpInterval = null
  },

  stopGpAudio() {
    if (this._gpAudio) {
      try {
        this._gpAudio.stop()
        this._gpAudio.destroy()
      } catch (e) { /* ignore */ }
      this._gpAudio = null
    }
  },

  stopGpAll() {
    this.stopGpTimers()
    this.stopGpAudio()
  },

  playSegmentAudio(seg) {
    this.stopGpAudio()
    if (!seg.audio) return
    const audio = wx.createInnerAudioContext()
    audio.src = seg.audio
    audio.onError(() => {
      console.warn('音频播放失败：', seg.audio)
    })
    this._gpAudio = audio
    audio.play()
  },

  runSegment(idx) {
    const gp = this.data.gp
    if (idx >= gp.segments.length) {
      this.stopGpTimers()
      this.stopGpAudio()
      this.setData({
        gp: Object.assign({}, gp, {
          finished: true, playing: false, paused: false,
          idx: gp.segments.length, phaseLabel: '练习结束 🌱',
          elapsedText: gp.totalText, progress: 100
        })
      })
      return
    }
    const seg = gp.segments[idx]
    const totalSec = Math.ceil(seg.duration / 1000)
    let remaining = totalSec
    const elapsed = gp.segments.slice(0, idx).reduce((a, s) => a + s.duration, 0)
    const total = gp.segments.reduce((a, s) => a + s.duration, 0)

    this.playSegmentAudio(seg)

    const updateCountdown = () => {
      const currentGp = this.data.gp
      this.setData({
        gp: Object.assign({}, currentGp, {
          countdown: Math.max(0, remaining),
          elapsedText: formatTime(elapsed + (seg.duration - remaining * 1000)),
          progress: Math.min(100, ((elapsed + (seg.duration - remaining * 1000)) / total) * 100),
          seg,
          idx,
          finished: false,
          phaseLabel:
            seg.phase === 'observe' ? '觉察当下'
            : seg.phase === 'breathe' ? '聚焦呼吸'
            : seg.phase === 'expand' ? '扩展觉察'
            : (currentGp.playing ? '正在引导...' : '准备开始')
        })
      })
    }
    updateCountdown()

    this._gpInterval = setInterval(() => {
      remaining--
      updateCountdown()
      if (remaining <= 0) clearInterval(this._gpInterval)
    }, 1000)

    this._gpTimeout = setTimeout(() => {
      clearInterval(this._gpInterval)
      this.runSegment(idx + 1)
    }, seg.duration)
  },

  gpPlay() {
    const gp = this.data.gp
    this.stopGpTimers()
    if (gp.finished) {
      this.setData({ gp: Object.assign({}, gp, { finished: false, idx: 0, playing: true, paused: false }) })
      this.runSegment(0)
      return
    }
    if (gp.paused) {
      // 从当前剩余时间继续
      const remainingMs = gp.countdown * 1000
      const idx = gp.idx
      this.setData({ gp: Object.assign({}, this.data.gp, { playing: true, paused: false }) })
      if (this._gpAudio) this._gpAudio.play()
      const seg = gp.segments[idx]
      const elapsed = gp.segments.slice(0, idx).reduce((a, s) => a + s.duration, 0)
      const total = gp.segments.reduce((a, s) => a + s.duration, 0)
      let remaining2 = Math.ceil(remainingMs / 1000)
      const updateCd = () => {
        const cur = this.data.gp
        this.setData({
          gp: Object.assign({}, cur, {
            countdown: Math.max(0, remaining2),
            elapsedText: formatTime(elapsed + (seg.duration - remaining2 * 1000)),
            progress: Math.min(100, ((elapsed + (seg.duration - remaining2 * 1000)) / total) * 100)
          })
        })
      }
      updateCd()
      this._gpInterval = setInterval(() => {
        remaining2--
        updateCd()
        if (remaining2 <= 0) clearInterval(this._gpInterval)
      }, 1000)
      this._gpTimeout = setTimeout(() => {
        clearInterval(this._gpInterval)
        this.runSegment(idx + 1)
      }, remainingMs)
      return
    }
    this.setData({ gp: Object.assign({}, gp, { playing: true, paused: false }) })
    this.runSegment(0)
  },

  gpPause() {
    this.stopGpTimers()
    if (this._gpAudio) this._gpAudio.pause()
    const gp = this.data.gp
    this.setData({ gp: Object.assign({}, gp, { playing: false, paused: true }) })
  },

  gpStop() {
    this.stopGpAll()
    const gp = this.data.gp
    this.setData({
      gp: Object.assign({}, gp, {
        playing: false, paused: false, finished: false,
        idx: 0, seg: null, countdown: 0, progress: 0,
        elapsedText: '0:00', phaseLabel: '准备开始'
      })
    })
  },

  gpSkip() {
    this.stopGpTimers()
    this.stopGpAudio()
    const gp = this.data.gp
    this.setData({ gp: Object.assign({}, gp, { playing: true, paused: false }) })
    this.runSegment(gp.idx + 1)
  },

  gpJump(e) {
    const idx = Number(e.currentTarget.dataset.index)
    this.stopGpTimers()
    this.stopGpAudio()
    const gp = this.data.gp
    this.setData({ gp: Object.assign({}, gp, { playing: true, paused: false }) })
    this.runSegment(idx)
  }
})
