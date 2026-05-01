import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'

/**
 * 减药计划管理 hook
 * 简化版：创建计划 → 阶段性进度 → 生成医生报告
 */
export default function useTaperPlan() {
  const [plans, setPlans] = useLocalStorage('sgt-taper-plans', [])

  const createPlan = useCallback((plan) => {
    const newPlan = {
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active', // active | completed | paused
      ...plan,
    }
    setPlans(prev => [...prev, newPlan])
    return newPlan
  }, [setPlans])

  const updatePhaseStatus = useCallback((planId, phaseIndex, status) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p
      const phases = [...p.phases]
      phases[phaseIndex] = { ...phases[phaseIndex], status }
      // 检查是否全部完成
      const allDone = phases.every(ph => ph.status === 'done')
      return { ...p, phases, status: allDone ? 'completed' : p.status }
    }))
  }, [setPlans])

  const getActivePlan = useCallback(() => {
    return plans.find(p => p.status === 'active') || null
  }, [plans])

  const generateDoctorReport = useCallback((planId) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return ''

    const completedPhases = plan.phases.filter(p => p.status === 'done')
    const currentPhase = plan.phases.find(p => p.status === 'current')
    const pendingPhases = plan.phases.filter(p => p.status === 'pending')

    const lines = [
      `【减药进度报告】`,
      `药物：${plan.medName}`,
      `起始剂量：${plan.startDose}`,
      `目标剂量：${plan.targetDose || '停药'}`,
      `创建日期：${plan.createdAt}`,
      ``,
      `已完成阶段：${completedPhases.length} / ${plan.phases.length}`,
      ...completedPhases.map((p, i) => `  ✅ 第${i + 1}阶段：${p.dose}，${p.duration}（已完成）`),
      ``,
    ]

    if (currentPhase) {
      lines.push(`当前阶段：${currentPhase.dose}，${currentPhase.duration}`)
    }
    if (pendingPhases.length > 0) {
      lines.push(`待完成阶段：${pendingPhases.length}`)
    }

    lines.push('', '⚠️ 此报告由"申归途"生成，仅供参考。减药调整请遵医嘱。')

    return lines.join('\n')
  }, [plans])

  return { plans, createPlan, updatePhaseStatus, getActivePlan, generateDoctorReport }
}
