import { getStore, setStore } from '../../utils/store'
import { todayISO } from '../../utils/date'

/**
 * 减药导航（对齐 H5 useTaperPlan + TaperNavigator）
 */
function createDoctorReport(plan) {
  if (!plan) return ''
  const completedPhases = plan.phases.filter(p => p.status === 'done')
  const currentPhase = plan.phases.find(p => p.status === 'current')
  const pendingPhases = plan.phases.filter(p => p.status === 'pending')

  const lines = [
    '【减药进度报告】',
    `药物：${plan.medName}`,
    `起始剂量：${plan.startDose}`,
    `目标剂量：${plan.targetDose || '停药'}`,
    `创建日期：${plan.createdAt}`,
    '',
    `已完成阶段：${completedPhases.length} / ${plan.phases.length}`
  ]
  completedPhases.forEach((p, i) => {
    lines.push(`  ✅ 第${i + 1}阶段：${p.dose}，${p.duration}（已完成）`)
  })
  lines.push('')
  if (currentPhase) lines.push(`当前阶段：${currentPhase.dose}，${currentPhase.duration}`)
  if (pendingPhases.length > 0) lines.push(`待完成阶段：${pendingPhases.length}`)
  lines.push('', '⚠️ 此报告由「申归途」生成，仅供参考。减药调整请遵医嘱。')
  return lines.join('\n')
}

Page({
  data: {
    view: 'create', // create | progress
    medName: '',
    startDose: '',
    targetDose: '停药',
    phaseCount: 4,
    phaseOptions: [2, 3, 4, 5, 6],
    phaseLabels: ['2 阶段', '3 阶段', '4 阶段', '5 阶段', '6 阶段'],
    phaseIndex: 2,
    activePlan: null
  },

  onShow() {
    const plans = getStore('sgt-taper-plans', [])
    const activePlan = plans.find(p => p.status === 'active') || null
    if (activePlan) {
      this.setData({ activePlan, view: 'progress' })
    } else {
      this.setData({ activePlan: null, view: this.data.activePlan ? 'create' : this.data.view })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  switchCreate() {
    this.setData({ view: 'create' })
  },

  onMedName(e) { this.setData({ medName: e.detail.value }) },
  onStartDose(e) { this.setData({ startDose: e.detail.value }) },
  onTargetDose(e) { this.setData({ targetDose: e.detail.value }) },

  onPhaseChange(e) {
    this.setData({ phaseIndex: Number(e.detail.value) })
  },

  handleCreate() {
    const { medName, startDose, targetDose, phaseIndex, phaseOptions } = this.data
    if (!medName.trim() || !startDose.trim()) {
      wx.showToast({ title: '请填写药物名称和起始剂量', icon: 'none' })
      return
    }
    const phaseCount = phaseOptions[phaseIndex]
    const phases = Array.from({ length: phaseCount }, (_, i) => ({
      dose: i === phaseCount - 1 ? (targetDose === '停药' ? '停药' : targetDose) : `${medName.trim()} 减量第${i + 1}阶段`,
      duration: `第${i + 1}~${i + 2}周`,
      status: i === 0 ? 'current' : 'pending'
    }))
    const plans = getStore('sgt-taper-plans', [])
    const newPlan = {
      id: Date.now(),
      createdAt: todayISO(),
      status: 'active',
      medName: medName.trim(),
      startDose: startDose.trim(),
      targetDose,
      phases
    }
    plans.push(newPlan)
    setStore('sgt-taper-plans', plans)
    this.setData({ activePlan: newPlan, view: 'progress' })
    wx.showToast({ title: '✅ 减药计划已创建，请严格遵医嘱执行', icon: 'none', duration: 2500 })
  },

  handlePhaseDone(e) {
    const index = Number(e.currentTarget.dataset.index)
    const plan = this.data.activePlan
    if (!plan) return
    const plans = getStore('sgt-taper-plans', [])
    const updated = plans.map(p => {
      if (p.id !== plan.id) return p
      const phases = p.phases.slice()
      phases[index] = Object.assign({}, phases[index], { status: 'done' })
      if (index + 1 < phases.length) {
        phases[index + 1] = Object.assign({}, phases[index + 1], { status: 'current' })
      }
      const allDone = phases.every(ph => ph.status === 'done')
      return Object.assign({}, p, { phases, status: allDone ? 'completed' : p.status })
    })
    setStore('sgt-taper-plans', updated)
    const activePlan = updated.find(p => p.id === plan.id) || null
    this.setData({ activePlan })
    wx.showToast({ title: '✅ 阶段完成', icon: 'success' })
  },

  copyReport() {
    const report = createDoctorReport(this.data.activePlan)
    wx.setClipboardData({
      data: report,
      success: () => wx.showToast({ title: '📋 报告已复制到剪贴板', icon: 'none' }),
      fail: () => wx.showToast({ title: '复制失败，请手动选择文本复制', icon: 'none' })
    })
  }
})
