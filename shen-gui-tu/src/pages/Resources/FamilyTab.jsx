import { useState, useCallback } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage'
import { familyCourses } from '../../data/familyCourses'
import { familyActionGuide } from '../../data/familyGuide'
import { caregiverQuestions, getScoreLevel, defaultSelfCareItems } from '../../data/caregiverAssessment'
import Toast from '../../components/Toast/Toast'
import styles from './FamilyTab.module.css'

export default function FamilyTab() {
  const [view, setView] = useState('list') // list | course | assessment | result
  const [activeCourseIdx, setActiveCourseIdx] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useLocalStorage('sgt-family-progress', {})
  const [assessments, setAssessments] = useLocalStorage('sgt-caregiver-assessments', [])
  const [selfCareItems, setSelfCareItems] = useLocalStorage('sgt-caregiver-selfcare', defaultSelfCareItems)
  const [answers, setAnswers] = useState({})
  const [toast, setToast] = useState('')
  const [expandedGuide, setExpandedGuide] = useState(null)
  const [showSelfCare, setShowSelfCare] = useState(false)

  // 课程相关
  const openCourse = useCallback((idx) => {
    setActiveCourseIdx(idx)
    setActiveStep(0)
    setView('course')
  }, [])

  const completeCourse = useCallback((courseId) => {
    setProgress(prev => ({ ...prev, [courseId]: true }))
    setView('list')
    setActiveCourseIdx(null)
    setToast('🎉 课程完成！感谢你为家人学习')
  }, [setProgress])

  // 自评相关
  const startAssessment = useCallback(() => {
    setAnswers({})
    setView('assessment')
  }, [])

  const submitAssessment = useCallback(() => {
    if (Object.keys(answers).length < caregiverQuestions.length) {
      setToast('请完成所有题目')
      return
    }
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
    const level = getScoreLevel(totalScore)
    const record = {
      date: new Date().toISOString().split('T')[0],
      answers: { ...answers },
      totalScore,
      level: level.level,
      timestamp: Date.now(),
    }
    setAssessments(prev => [record, ...prev].slice(0, 30))
    setView('result')
  }, [answers, setAssessments])

  // 自我关怀清单
  const addSelfCareItem = useCallback(() => {
    setSelfCareItems(prev => [...prev, ''])
  }, [setSelfCareItems])

  const updateSelfCareItem = useCallback((idx, value) => {
    setSelfCareItems(prev => prev.map((item, i) => i === idx ? value : item))
  }, [setSelfCareItems])

  const removeSelfCareItem = useCallback((idx) => {
    setSelfCareItems(prev => prev.filter((_, i) => i !== idx))
  }, [setSelfCareItems])

  // 课程详情视图
  if (view === 'course' && activeCourseIdx !== null) {
    const course = familyCourses[activeCourseIdx]
    const step = course.steps[activeStep]
    const isLast = activeStep === course.steps.length - 1
    const isCompleted = progress[course.id]

    return (
      <div className={styles.courseView}>
        <button className={styles.backBtn} onClick={() => setView('list')}>← 返回</button>
        <h3 className={styles.courseTitle}>{course.icon} {course.title}</h3>
        <div className={styles.stepDots}>
          {course.steps.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i === activeStep ? styles.activeDot : ''} ${i < activeStep ? styles.doneDot : ''}`} />
          ))}
        </div>
        <div className={styles.stepCard}>
          <span className={styles.stepType}>{step.type}</span>
          <h4 className={styles.stepTitle}>{step.title}</h4>
          <div className={styles.stepBody}>{step.body.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}</div>
        </div>
        <div className={styles.stepNav}>
          <button className={styles.navBtn} disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>上一步</button>
          {isLast ? (
            <button className={styles.navBtn} onClick={() => completeCourse(course.id)}>
              {isCompleted ? '已完成 ✓' : '完成课程'}
            </button>
          ) : (
            <button className={styles.navBtn} onClick={() => setActiveStep(s => s + 1)}>下一步</button>
          )}
        </div>
      </div>
    )
  }

  // 自评视图
  if (view === 'assessment') {
    return (
      <div className={styles.assessmentView}>
        <button className={styles.backBtn} onClick={() => setView('list')}>← 返回</button>
        <h3 className={styles.sectionTitle}>💪 照护者压力自评</h3>
        <p className={styles.assessHint}>请根据你最近一周的真实感受评分（1=完全不符合，5=完全符合）</p>
        <div className={styles.questionList}>
          {caregiverQuestions.map((q, i) => (
            <div key={q.id} className={styles.questionItem}>
              <div className={styles.questionText}>{i + 1}. {q.text}</div>
              <div className={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    className={`${styles.ratingBtn} ${answers[q.id] === v ? styles.ratingSelected : ''}`}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                  >{v}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className={styles.submitBtn} onClick={submitAssessment}>提交自评</button>
      </div>
    )
  }

  // 结果视图
  if (view === 'result' && assessments.length > 0) {
    const latest = assessments[0]
    const level = getScoreLevel(latest.totalScore)
    return (
      <div className={styles.resultView}>
        <button className={styles.backBtn} onClick={() => setView('list')}>← 返回</button>
        <h3 className={styles.sectionTitle}>自评结果</h3>
        <div className={styles.resultCard} style={{ background: level.bgColor, borderColor: level.color }}>
          <div className={styles.resultScore} style={{ color: level.color }}>{latest.totalScore} / 40</div>
          <div className={styles.resultLabel} style={{ color: level.color }}>{level.label}</div>
          <div className={styles.resultAdvice}>{level.advice}</div>
        </div>
        <button className={styles.submitBtn} onClick={() => setView('list')}>返回家属支持</button>
      </div>
    )
  }

  // 主列表视图
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📖 家属教育课程</h3>
        <p className={styles.sectionDesc}>为照护者提供的心理学知识，帮助更好地支持家人</p>
        <div className={styles.courseGrid}>
          {familyCourses.map((c, i) => (
            <div key={c.id} className={`${styles.courseCard} ${progress[c.id] ? styles.courseDone : ''}`} onClick={() => openCourse(i)}>
              <div className={styles.courseIcon}>{c.icon}</div>
              <div className={styles.courseInfo}>
                <div className={styles.courseName}>{c.title}</div>
                <div className={styles.courseDesc}>{c.desc}</div>
              </div>
              {progress[c.id] && <span className={styles.doneBadge}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🎯 家属行动指南</h3>
        <p className={styles.sectionDesc}>根据患者当前状态，采取不同的支持策略</p>
        <div className={styles.guideList}>
          {familyActionGuide.map((g, i) => (
            <div key={g.level} className={styles.guideCard} style={{ borderColor: g.color }}>
              <div className={styles.guideHeader} onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}>
                <span className={styles.guideIcon}>{g.icon}</span>
                <span className={styles.guideLabel} style={{ color: g.color }}>{g.label}</span>
                <span className={styles.guideArrow}>{expandedGuide === i ? '▲' : '▼'}</span>
              </div>
              {expandedGuide === i && (
                <div className={styles.guideBody}>
                  <p className={styles.guideDesc}>{g.description}</p>
                  <div className={styles.guideSubTitle}>✅ 建议做的事：</div>
                  {g.doList.map((item, j) => <div key={j} className={styles.guideItem}>• {item}</div>)}
                  <div className={styles.guideSubTitle}>❌ 应避免的事：</div>
                  {g.dontList.map((item, j) => <div key={j} className={styles.guideItem}>• {item}</div>)}
                  <div className={styles.guideReminder} style={{ background: g.bgColor, color: g.color }}>
                    💡 {g.keyReminder}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>💪 照护者压力自评</h3>
        <p className={styles.sectionDesc}>关注自己的状态，才能更好地支持家人</p>
        <div className={styles.assessEntry}>
          <button className={styles.assessBtn} onClick={startAssessment}>开始自评</button>
          {assessments.length > 0 && (
            <span className={styles.assessLast}>上次：{assessments[0].totalScore}分 · {getScoreLevel(assessments[0].totalScore).label}</span>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.selfCareHeader} onClick={() => setShowSelfCare(!showSelfCare)}>
          <h3 className={styles.sectionTitle}>🌿 自我关怀清单</h3>
          <span className={styles.guideArrow}>{showSelfCare ? '▲' : '▼'}</span>
        </div>
        {showSelfCare && (
          <div className={styles.selfCareList}>
            {selfCareItems.map((item, i) => (
              <div key={i} className={styles.selfCareItem}>
                <input
                  className={styles.selfCareInput}
                  value={item}
                  onChange={e => updateSelfCareItem(i, e.target.value)}
                  placeholder="添加一项自我关怀活动"
                />
                <button className={styles.removeBtn} onClick={() => removeSelfCareItem(i)}>✕</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={addSelfCareItem}>+ 添加</button>
          </div>
        )}
      </div>

      <div className={styles.disclaimer}>
        以上内容仅供参考，不替代专业心理咨询和医疗建议。
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
