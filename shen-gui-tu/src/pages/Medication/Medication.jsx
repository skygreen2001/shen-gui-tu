import { useState, useCallback, useEffect } from 'react'
import useMedication from '../../hooks/useMedication'
import Toast from '../../components/Toast/Toast'
import MedKnowledge from './MedKnowledge'
import SideEffectTracker from './SideEffectTracker'
import MoodCorrelation from './MoodCorrelation'
import TaperNavigator from './TaperNavigator'
import styles from './Medication.module.css'

const defaultMeds = [
  { name: '草酸艾司西酞普兰', dose: '10mg', frequency: '每日一次', time: '早餐后 ⏰' },
  { name: '喹硫平', dose: '25mg', frequency: '每晚一次', time: '睡前 🌙' },
]

const encouragements = ['🎉 太棒了！坚持就是胜利', '💪 今天又照顾好自己了', '🌟 用药规律是康复的关键', '🌱 你在为健康做正确的事']
const warmMessages = ['😊 没关系，记得和医生聊聊', '💛 偶尔忘记很正常，明天继续', '🤗 身体感受很重要，和医生沟通一下']

export default function Medication() {
  const { medications, addMedication, removeMedication, recordDose, getAdherenceRate, getMedStatus } = useMedication()
  const [toast, setToast] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDose, setNewDose] = useState('')
  const [subView, setSubView] = useState(null) // null | 'knowledge' | 'sideEffects' | 'moodCorrelation' | 'taper'
  const [selectedMed, setSelectedMed] = useState(null)

  useEffect(() => {
    if (medications.length === 0) {
      defaultMeds.forEach(med => addMedication(med))
    }
  }, [])

  const adherence = getAdherenceRate(30)
  const [animatedPct, setAnimatedPct] = useState(0)
  useEffect(() => {
    let current = 0
    const timer = setInterval(() => {
      current += 2
      if (current >= adherence) { current = adherence; clearInterval(timer) }
      setAnimatedPct(current)
    }, 20)
    return () => clearInterval(timer)
  }, [adherence])

  const handleTake = useCallback((medId) => {
    recordDose(medId, 'taken')
    setToast(encouragements[Math.floor(Math.random() * encouragements.length)])
  }, [recordDose])

  const handleSkip = useCallback((medId) => {
    recordDose(medId, 'skipped')
    setToast(warmMessages[Math.floor(Math.random() * warmMessages.length)])
  }, [recordDose])

  const handleAdd = useCallback(() => {
    if (newName.trim() && newDose.trim()) {
      addMedication({ name: newName, dose: newDose, frequency: '每日一次', time: '自行安排' })
      setNewName(''); setNewDose(''); setShowAdd(false)
    }
  }, [newName, newDose, addMedication])

  const openKnowledge = useCallback((name) => {
    setSelectedMed(name)
    setSubView('knowledge')
  }, [])

  const adherenceColor = adherence >= 80 ? 'var(--success)' : adherence >= 50 ? 'var(--warning)' : 'var(--danger)'

  // 子视图
  if (subView === 'knowledge') {
    return <MedKnowledge name={selectedMed} onBack={() => setSubView(null)} />
  }
  if (subView === 'sideEffects') {
    return <SideEffectTracker onBack={() => setSubView(null)} />
  }
  if (subView === 'moodCorrelation') {
    return <MoodCorrelation onBack={() => setSubView(null)} />
  }
  if (subView === 'taper') {
    return <TaperNavigator onBack={() => setSubView(null)} />
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>用药管理 💊</h1>
        <p>坚持用药是康复的重要保障</p>
      </div>
      <div className={styles.content}>
        <div className={styles.adherence}>
          <div className={styles.adherenceCircle} style={{background: adherenceColor}}>
            <span>{animatedPct}%</span>
          </div>
          <div className={styles.adherenceLabel}>本月用药依从率</div>
        </div>
        {medications.map(med => {
          const status = getMedStatus(med.id)
          return (
            <div key={med.id} className={styles.medCard}>
              <div className={styles.medCardTop}>
                <div>
                  <div className={styles.medName}>{med.name}</div>
                  <div className={styles.medDose}>{med.dose} · {med.frequency}</div>
                  <div className={styles.medTime}>{med.time}</div>
                </div>
                <button className={styles.infoBtn} onClick={() => openKnowledge(med.name)} title="了解此药">📖</button>
              </div>
              <div className={styles.medActions}>
                <button
                  className={`${styles.takeBtn} ${status === 'taken' ? styles.taken : ''}`}
                  onClick={() => handleTake(med.id)}
                >
                  {status === 'taken' ? '✅ 已服用' : '✅ 已服用'}
                </button>
                <button
                  className={`${styles.skipBtn} ${status === 'skipped' ? styles.skipped : ''}`}
                  onClick={() => handleSkip(med.id)}
                >
                  {status === 'skipped' ? '⏭️ 已跳过' : '⏭️ 跳过'}
                </button>
              </div>
            </div>
          )
        })}
        <button className={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '取消' : '+ 添加药物'}
        </button>
        {showAdd && (
          <div className={styles.addForm}>
            <input className={styles.input} placeholder="药物名称" value={newName} onChange={e => setNewName(e.target.value)} />
            <input className={styles.input} placeholder="剂量（如 10mg）" value={newDose} onChange={e => setNewDose(e.target.value)} />
            <button className={styles.confirmBtn} onClick={handleAdd}>确认添加</button>
          </div>
        )}
        {/* 辅助功能入口 */}
        <div className={styles.auxEntry} onClick={() => setSubView('sideEffects')}>
          <div className={styles.auxIcon}>📋</div>
          <div className={styles.auxText}>
            <div className={styles.auxTitle}>副作用周报</div>
            <div className={styles.auxDesc}>每周记录药物副作用，追踪身体变化</div>
          </div>
          <div className={styles.auxArrow}>→</div>
        </div>
        <div className={styles.auxEntry} onClick={() => setSubView('moodCorrelation')}>
          <div className={styles.auxIcon}>📈</div>
          <div className={styles.auxText}>
            <div className={styles.auxTitle}>药物-情绪联动</div>
            <div className={styles.auxDesc}>查看用药与情绪的关联趋势</div>
          </div>
          <div className={styles.auxArrow}>→</div>
        </div>
        <div className={styles.auxEntry} onClick={() => setSubView('taper')}>
          <div className={styles.auxIcon}>🎯</div>
          <div className={styles.auxText}>
            <div className={styles.auxTitle}>减药导航</div>
            <div className={styles.auxDesc}>在医生指导下安全渐进减药</div>
          </div>
          <div className={styles.auxArrow}>→</div>
        </div>
        <div className={styles.tip}>
          💡 <strong>温馨提示：</strong>即使感觉好转，也请遵医嘱继续服药。突然停药可能导致不适。如有疑问，请咨询您的主治医生。
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
