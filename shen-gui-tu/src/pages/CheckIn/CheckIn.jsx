import { useState, useCallback, useEffect } from 'react'
import useCheckIn from '../../hooks/useCheckIn'
import Toast from '../../components/Toast/Toast'
import styles from './CheckIn.module.css'

const dimensions = [
  { key: 'sleep', label: '睡眠质量', icon: '😴', left: '很差', right: '很好' },
  { key: 'mood', label: '情绪状态', icon: '😊', left: '低落', right: '愉悦' },
  { key: 'body', label: '身体活力', icon: '🏃', left: '疲惫', right: '充沛' },
  { key: 'motivation', label: '动力水平', icon: '🎯', left: '无', right: '强烈' },
  { key: 'cognition', label: '思维清晰度', icon: '🧠', left: '模糊', right: '清晰' },
  { key: 'social', label: '社交意愿', icon: '👥', left: '回避', right: '主动' },
]

const encouragements = [
  '✅ 签到成功！记录是康复的第一步 💪',
  '🌟 很好！你正在了解自己',
  '🌱 每一天的记录都是成长的种子',
  '💪 你做得很好，继续保持！',
  '🌈 感谢你花时间关注自己',
]

export default function CheckIn() {
  const { hasCheckedToday, todayCheckIn, submitCheckIn } = useCheckIn()
  const [ratings, setRatings] = useState({})
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState('')

  // 进入编辑模式时回填已有数据
  useEffect(() => {
    if (editing && todayCheckIn) {
      setRatings(todayCheckIn.dimensions || {})
      setNote(todayCheckIn.note || '')
    }
  }, [editing, todayCheckIn])

  const allRated = dimensions.every(d => ratings[d.key])

  const selectRating = useCallback((key, val) => {
    setRatings(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleSubmit = useCallback(() => {
    if (!allRated) return
    submitCheckIn(ratings, note)
    setSubmitted(true)
    setEditing(false)
    setToast(encouragements[Math.floor(Math.random() * encouragements.length)])
  }, [allRated, ratings, note, submitCheckIn])

  // 已签到且未进入编辑模式：显示已签到卡片
  if (hasCheckedToday && !editing && !submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>每日签到 📋</h1>
          <p>今日签到记录</p>
        </div>
        <div className={styles.content}>
          <div className={styles.doneCard}>
            <div className={styles.doneIcon}>✅</div>
            <div className={styles.doneTitle}>今日已签到</div>
            <div className={styles.doneDesc}>你今天已经完成了签到，可以修改或明天继续加油！</div>
            <button className={styles.reEditBtn} onClick={() => setEditing(true)}>修改今日签到</button>
          </div>
        </div>
      </div>
    )
  }

  // 提交成功后
  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>每日签到 📋</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.doneCard}>
            <div className={styles.doneIcon}>🎉</div>
            <div className={styles.doneTitle}>{editing ? '修改成功！' : '签到完成！'}</div>
            <div className={styles.doneDesc}>{toast}</div>
          </div>
        </div>
        <Toast message="" />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>每日签到 📋</h1>
        <p>{editing ? '修改今日签到内容' : '花1分钟了解自己的状态'}</p>
      </div>
      <div className={styles.content}>
        {dimensions.map((dim, idx) => (
          <div key={dim.key} className={styles.dimGroup} style={{animationDelay:`${idx*0.05}s`}}>
            <div className={styles.dimLabel}>
              <span>{dim.icon}</span> {dim.label}
            </div>
            <div className={styles.ratingRow}>
              <div className={styles.radioGroup} role="radiogroup" aria-label={dim.label}>
                {[1,2,3,4,5].map(val => (
                  <button
                    key={val}
                    className={`${styles.radioBtn} ${ratings[dim.key] === val ? styles.selected : ''}`}
                    onClick={() => selectRating(dim.key, val)}
                    role="radio"
                    aria-checked={ratings[dim.key] === val}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.ratingLabels}>
              <span>{dim.left}</span>
              <span>{dim.right}</span>
            </div>
          </div>
        ))}
        <div className={styles.noteWrap}>
          <textarea
            className={styles.note}
            placeholder="今天有什么想记录的吗？（选填）"
            maxLength={200}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
        <button
          className={styles.submitBtn}
          disabled={!allRated}
          onClick={handleSubmit}
          style={allRated ? {animation:'pulse 2s infinite'} : {}}
        >
          {editing ? '保存修改' : '提交签到'}
        </button>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
