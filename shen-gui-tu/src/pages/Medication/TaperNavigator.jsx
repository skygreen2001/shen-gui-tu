import { useState, useCallback } from 'react'
import useTaperPlan from '../../hooks/useTaperPlan'
import Toast from '../../components/Toast/Toast'
import styles from './TaperNavigator.module.css'

export default function TaperNavigator({ onBack }) {
  const { getActivePlan, createPlan, updatePhaseStatus, generateDoctorReport } = useTaperPlan()
  const activePlan = getActivePlan()
  const [view, setView] = useState(activePlan ? 'progress' : 'create') // create | progress
  const [toast, setToast] = useState('')

  // 创建表单
  const [medName, setMedName] = useState('')
  const [startDose, setStartDose] = useState('')
  const [targetDose, setTargetDose] = useState('停药')
  const [phaseCount, setPhaseCount] = useState(4)

  const handleCreate = useCallback(() => {
    if (!medName.trim() || !startDose.trim()) {
      setToast('请填写药物名称和起始剂量')
      return
    }
    // 生成等分阶段
    const phases = Array.from({ length: phaseCount }, (_, i) => {
      const status = i === 0 ? 'current' : 'pending'
      return {
        dose: i === phaseCount - 1 ? (targetDose === '停药' ? '停药' : targetDose) : `${medName} 减量第${i + 1}阶段`,
        duration: `第${i + 1}~${i + 2}周`,
        status,
      }
    })
    createPlan({ medName: medName.trim(), startDose: startDose.trim(), targetDose, phases })
    setView('progress')
    setToast('✅ 减药计划已创建，请严格遵医嘱执行')
  }, [medName, startDose, targetDose, phaseCount, createPlan])

  const handlePhaseDone = useCallback((plan, index) => {
    updatePhaseStatus(plan.id, index, 'done')
    // 标记下一阶段为 current
    if (index + 1 < plan.phases.length) {
      updatePhaseStatus(plan.id, index + 1, 'current')
    }
    setToast('✅ 阶段完成')
  }, [updatePhaseStatus])

  const handleCopyReport = useCallback(() => {
    const report = generateDoctorReport(activePlan.id)
    navigator.clipboard?.writeText(report).then(() => {
      setToast('📋 报告已复制到剪贴板')
    }).catch(() => {
      setToast('复制失败，请手动选择文本复制')
    })
  }, [activePlan, generateDoctorReport])

  const currentPlan = getActivePlan()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← 返回</button>
        <h2>减药导航</h2>
      </div>
      <div className={styles.content}>
        <div className={styles.warning}>
          ⚠️ 减药必须在医生指导下进行，切勿自行调整剂量！
        </div>

        {view === 'create' ? (
          <div className={styles.form}>
            <h3>创建减药计划</h3>
            <input className={styles.input} placeholder="药物名称" value={medName} onChange={e => setMedName(e.target.value)} />
            <input className={styles.input} placeholder="当前剂量（如 20mg）" value={startDose} onChange={e => setStartDose(e.target.value)} />
            <input className={styles.input} placeholder="目标（默认：停药）" value={targetDose} onChange={e => setTargetDose(e.target.value)} />
            <div className={styles.phaseRow}>
              <label>分阶段数：</label>
              <select className={styles.select} value={phaseCount} onChange={e => setPhaseCount(Number(e.target.value))}>
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} 阶段</option>)}
              </select>
            </div>
            <button className={styles.submitBtn} onClick={handleCreate}>创建计划</button>
          </div>
        ) : currentPlan ? (
          <div className={styles.progress}>
            <div className={styles.planInfo}>
              <div className={styles.planMed}>{currentPlan.medName}</div>
              <div className={styles.planDose}>{currentPlan.startDose} → {currentPlan.targetDose || '停药'}</div>
            </div>
            {/* 时间线 */}
            <div className={styles.timeline}>
              {currentPlan.phases.map((phase, i) => (
                <div key={i} className={`${styles.phase} ${styles[phase.status]}`}>
                  <div className={styles.phaseDot} />
                  {i < currentPlan.phases.length - 1 && <div className={styles.phaseLine} />}
                  <div className={styles.phaseContent}>
                    <div className={styles.phaseLabel}>{phase.dose}</div>
                    <div className={styles.phaseDuration}>{phase.duration}</div>
                    {phase.status === 'current' && (
                      <button className={styles.doneBtn} onClick={() => handlePhaseDone(currentPlan, i)}>
                        标记完成
                      </button>
                    )}
                    {phase.status === 'done' && <span className={styles.doneLabel}>✅ 已完成</span>}
                  </div>
                </div>
              ))}
            </div>
            {/* 医生报告 */}
            <div className={styles.reportSection}>
              <h3>📋 生成医生报告</h3>
              <p className={styles.reportHint}>将减药进度整理为文本，方便与医生沟通</p>
              <button className={styles.reportBtn} onClick={handleCopyReport}>复制报告</button>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <p>暂无进行中的减药计划</p>
            <button className={styles.submitBtn} onClick={() => setView('create')}>创建新计划</button>
          </div>
        )}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
