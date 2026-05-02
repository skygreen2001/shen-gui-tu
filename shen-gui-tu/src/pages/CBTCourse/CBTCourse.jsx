import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { cbtCourses, tierInfo } from '../../data/cbtContent'
import useLocalStorage from '../../hooks/useLocalStorage'
import Toast from '../../components/Toast/Toast'
import GuidedPlayer from '../../components/GuidedPlayer/GuidedPlayer'
import styles from './CBTCourse.module.css'

export default function CBTCourse() {
  const navigate = useNavigate()
  const [progress, setProgress] = useLocalStorage('sgt-cbt-progress', {})
  const [activeCourse, setActiveCourse] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [toast, setToast] = useState('')
  const [collapsedTiers, setCollapsedTiers] = useState({})

  // 按 tier 分组
  const groupedCourses = useMemo(() => {
    return tierInfo.map(tier => ({
      ...tier,
      courses: cbtCourses.filter(c => c.tier === tier.tier)
    }))
  }, [])

  const openCourse = useCallback((courseId) => {
    const idx = cbtCourses.findIndex(c => c.id === courseId)
    if (idx === -1) return
    const course = cbtCourses[idx]
    const isLocked = course.prerequisites?.some(preId => !progress[preId])
    if (isLocked) { setToast('🔒 请先完成前面的课程'); return }
    setActiveCourse(idx)
    setActiveStep(0)
  }, [progress])

  const closeCourse = useCallback(() => {
    setActiveCourse(null)
    setActiveStep(0)
  }, [])

  const nextStep = useCallback(() => {
    if (activeCourse === null) return
    const course = cbtCourses[activeCourse]
    if (activeStep < course.steps.length - 1) {
      setActiveStep(prev => prev + 1)
    } else {
      setProgress(prev => ({ ...prev, [course.id]: true }))
      setToast('🎉 恭喜完成课程！')
      closeCourse()
    }
  }, [activeCourse, activeStep, closeCourse, setProgress])

  const prevStep = useCallback(() => {
    setActiveStep(prev => Math.max(0, prev - 1))
  }, [])

  const toggleTier = useCallback((tier) => {
    setCollapsedTiers(prev => ({ ...prev, [tier]: !prev[tier] }))
  }, [])

  if (activeCourse !== null) {
    const course = cbtCourses[activeCourse]
    const step = course.steps[activeStep]
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={closeCourse}>← 返回</button>
          <h1>{course.title}</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.stepDots}>
            {course.steps.map((_, i) => (
              <div key={i} className={`${styles.dot} ${i === activeStep ? styles.dotActive : ''} ${i < activeStep ? styles.dotDone : ''}`} />
            ))}
          </div>
          <div className={styles.stepContent}>
            <div className={styles.stepType}>{step.type}</div>
            <div className={styles.stepTitle}>{step.title}</div>
            {step.guided ? (
              <GuidedPlayer guided={step.guided} />
            ) : (
              <div className={styles.stepBody}>{step.body.split('\n').map((line, i) => <p key={i}>{line}</p>)}</div>
            )}
          </div>
          <div className={styles.stepNav}>
            <button className={styles.prevBtn} onClick={prevStep} disabled={activeStep === 0}>← 上一步</button>
            <button className={styles.nextBtn} onClick={nextStep}>
              {activeStep === course.steps.length - 1 ? '✅ 完成课程' : '下一步 →'}
            </button>
          </div>
        </div>
        <Toast message={toast} onClose={() => setToast('')} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>心理干预课程 📖</h1>
        <p>CBT · MBCT · WRAP · ACT 循证课程体系</p>
      </div>
      <div className={styles.content}>
        {groupedCourses.map(group => {
          const collapsed = collapsedTiers[group.tier]
          return (
          <div key={group.tier} className={styles.tierGroup}>
            <div className={styles.tierHeader} onClick={() => toggleTier(group.tier)}>
              <div className={styles.tierIndicator} style={{ background: group.color }} />
              <div style={{ flex: 1 }}>
                <div className={styles.tierTitle}>{group.title}</div>
                <div className={styles.tierDesc}>{group.desc}</div>
              </div>
              <div className={styles.tierCount}>{group.courses.filter(c => progress[c.id]).length}/{group.courses.length}</div>
              <div className={`${styles.tierArrow} ${collapsed ? styles.tierArrowCollapsed : ''}`}>▾</div>
            </div>
            {!collapsed && group.courses.map(course => {
              const completed = progress[course.id]
              const isLocked = course.prerequisites?.some(preId => !progress[preId])
              return (
                <div key={course.id} className={`${styles.courseCard} ${isLocked ? styles.locked : ''}`} onClick={() => openCourse(course.id)}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>{isLocked ? '🔒' : course.icon}</span>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardTitle}>{course.title}</span>
                      <span className={styles.cardTag} style={{ background: group.color + '20', color: group.color }}>{course.tag}</span>
                    </div>
                  </div>
                  <div className={styles.cardDesc}>{isLocked ? '完成前置课程后解锁' : course.desc}</div>
                  {completed && <div className={styles.completedBadge}>✅ 已完成</div>}
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${completed ? 100 : 0}%`, background: group.color }} />
                  </div>
                </div>
              )
            })}
          </div>
          )
        })}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
