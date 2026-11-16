import { getStore, setStore } from '../../utils/store'
import { familyCourses } from '../../data/familyCourses'
import { familyActionGuide } from '../../data/familyGuide'
import { caregiverQuestions, getScoreLevel, defaultSelfCareItems } from '../../data/caregiverAssessment'
import { todayISO } from '../../utils/date'

Component({
  data: {
    familyCourses,
    familyActionGuide,
    caregiverQuestions,
    view: 'list', // list | course | assessment | result
    activeCourseIdx: null,
    activeStep: 0,
    progress: {},
    assessments: [],
    selfCareItems: defaultSelfCareItems,
    answers: {},
    expandedGuide: null,
    showSelfCare: false,
    // 课程视图缓存
    course: null,
    step: null,
    isLast: false,
    isCompleted: false,
    // 结果视图缓存
    latest: null,
    latestLevel: null,
    lastAssessLabel: ''
  },

  lifetimes: {
    attached() {
      const progress = getStore('sgt-family-progress', {})
      const assessments = getStore('sgt-caregiver-assessments', [])
      const selfCareItems = getStore('sgt-caregiver-selfcare', defaultSelfCareItems)
      const lastAssessLabel = assessments.length > 0
        ? `上次：${assessments[0].totalScore}分 · ${getScoreLevel(assessments[0].totalScore).label}`
        : ''
      this.setData({ progress, assessments, selfCareItems, lastAssessLabel })
    }
  },

  methods: {
    /* ── 家属课程 ── */
    openCourse(e) {
      const idx = Number(e.currentTarget.dataset.index)
      const course = familyCourses[idx]
      this.setData({
        view: 'course',
        activeCourseIdx: idx,
        activeStep: 0,
        course,
        step: this.decorateStep(course.steps[0]),
        isLast: course.steps.length === 1,
        isCompleted: !!this.data.progress[course.id]
      })
    },

    /** 将 step.body 按 \n 拆分为行数组，便于渲染 */
    decorateStep(step) {
      return Object.assign({}, step, { lines: step.body.split('\n') })
    },

    prevStep() {
      if (this.data.activeStep === 0) return
      const step = this.decorateStep(this.data.course.steps[this.data.activeStep - 1])
      this.setData({ activeStep: this.data.activeStep - 1, step })
    },

    nextStep() {
      const { course, activeStep } = this.data
      if (activeStep < course.steps.length - 1) {
        const step = this.decorateStep(course.steps[activeStep + 1])
        this.setData({
          activeStep: activeStep + 1,
          step,
          isLast: activeStep + 1 === course.steps.length - 1
        })
      } else {
        const progress = Object.assign({}, this.data.progress)
        progress[course.id] = true
        setStore('sgt-family-progress', progress)
        this.setData({ view: 'list', progress, activeCourseIdx: null })
        wx.showToast({ title: '🎉 课程完成！感谢你为家人学习', icon: 'none', duration: 2500 })
      }
    },

    backToList() {
      this.setData({ view: 'list' })
    },

    /* ── 行动指南 ── */
    toggleGuide(e) {
      const i = Number(e.currentTarget.dataset.index)
      this.setData({ expandedGuide: this.data.expandedGuide === i ? null : i })
    },

    /* ── 自评 ── */
    startAssessment() {
      this.setData({ view: 'assessment', answers: {} })
    },

    selectAnswer(e) {
      const { qid, val } = e.currentTarget.dataset
      const answers = Object.assign({}, this.data.answers)
      answers[qid] = Number(val)
      this.setData({ answers })
    },

    submitAssessment() {
      const { answers } = this.data
      if (Object.keys(answers).length < caregiverQuestions.length) {
        wx.showToast({ title: '请完成所有题目', icon: 'none' })
        return
      }
      let totalScore = 0
      Object.keys(answers).forEach(k => { totalScore += answers[k] })
      const level = getScoreLevel(totalScore)
      const record = {
        date: todayISO(),
        answers: Object.assign({}, answers),
        totalScore,
        level: level.level,
        timestamp: Date.now()
      }
      const assessments = [record].concat(this.data.assessments).slice(0, 30)
      setStore('sgt-caregiver-assessments', assessments)
      this.setData({
        assessments,
        view: 'result',
        latest: record,
        latestLevel: level,
        lastAssessLabel: `上次：${totalScore}分 · ${level.label}`
      })
    },

    /* ── 自我关怀清单 ── */
    toggleSelfCare() {
      this.setData({ showSelfCare: !this.data.showSelfCare })
    },

    addSelfCareItem() {
      const items = this.data.selfCareItems.concat([''])
      this.setData({ selfCareItems: items })
      setStore('sgt-caregiver-selfcare', items)
    },

    updateSelfCareItem(e) {
      const idx = Number(e.currentTarget.dataset.index)
      const items = this.data.selfCareItems.slice()
      items[idx] = e.detail.value
      this.setData({ selfCareItems: items })
      setStore('sgt-caregiver-selfcare', items)
    },

    removeSelfCareItem(e) {
      const idx = Number(e.currentTarget.dataset.index)
      const items = this.data.selfCareItems.filter((_, i) => i !== idx)
      this.setData({ selfCareItems: items })
      setStore('sgt-caregiver-selfcare', items)
    }
  }
})
