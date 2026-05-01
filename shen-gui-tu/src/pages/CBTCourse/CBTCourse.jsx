import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { cbtCourses } from '../../data/cbtContent'
import useLocalStorage from '../../hooks/useLocalStorage'
import Toast from '../../components/Toast/Toast'
import styles from './CBTCourse.module.css'

export default function CBTCourse() {
  const navigate = useNavigate()
  const [progress, setProgress] = useLocalStorage('sgt-cbt-progress', {})
  const [activeCourse, setActiveCourse] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [toast, setToast] = useState('')

  const openCourse = useCallback((idx) => {
    const course = cbtCourses[idx]
    // 动态判断锁定：检查前置课程是否全部完成
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
            <div className={styles.stepBody}>{step.body.split('\n').map((line, i) => <p key={i}>{line}</p>)}</div>
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
        <h1>CBT课程 📖</h1>
        <p>认知行为疗法自助课程</p>
      </div>
      <div className={styles.content}>
        {cbtCourses.map((course, idx) => {
          const completed = progress[course.id]
          const isLocked = course.prerequisites?.some(preId => !progress[preId])
          const courseProgress = completed ? 100 : 0
          return (
            <div key={course.id} className={`${styles.courseCard} ${isLocked ? styles.locked : ''}`} onClick={() => openCourse(idx)}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{isLocked ? '🔒' : course.icon}</span>
                <span className={styles.cardTitle}>{course.title}</span>
              </div>
              <div className={styles.cardDesc}>{isLocked ? '完成前置课程后解锁' : course.desc}</div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${courseProgress}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
