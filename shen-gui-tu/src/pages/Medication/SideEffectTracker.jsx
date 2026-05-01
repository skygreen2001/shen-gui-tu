import { useState, useCallback } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage'
import Toast from '../../components/Toast/Toast'
import styles from './SideEffectTracker.module.css'

const defaultItems = [
  { key: 'weight', label: '体重变化' },
  { key: 'drowsiness', label: '嗜睡' },
  { key: 'sexual', label: '性功能' },
  { key: 'gi', label: '胃肠反应' },
  { key: 'insomnia', label: '失眠' },
  { key: 'appetite', label: '食欲变化' },
  { key: 'anxiety', label: '焦虑/躁动' },
]

const levels = ['无', '轻微', '轻度', '中度', '重度']

export default function SideEffectTracker({ onBack }) {
  const [reports, setReports] = useLocalStorage('sgt-side-effects', [])
  const [ratings, setRatings] = useState({})
  const [note, setNote] = useState('')
  const [view, setView] = useState('form') // form | history
  const [toast, setToast] = useState('')

  const selectRating = useCallback((key, val) => {
    setRatings(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleSubmit = useCallback(() => {
    const items = defaultItems.map(item => ({
      key: item.key,
      label: item.label,
      value: ratings[item.key] || 0,
    }))
    const now = new Date()
    const weekNum = getWeekNumber(now)
    const newReport = {
      id: Date.now(),
      weekKey: `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`,
      date: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`,
      items,
      note,
      timestamp: Date.now(),
    }
    setReports(prev => [...prev, newReport])
    setRatings({})
    setNote('')
    setToast('✅ 副作用周报已记录')
  }, [ratings, note, setReports])

  const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← 返回</button>
        <h2>副作用追踪</h2>
      </div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${view === 'form' ? styles.activeTab : ''}`} onClick={() => setView('form')}>📝 本周记录</button>
        <button className={`${styles.tab} ${view === 'history' ? styles.activeTab : ''}`} onClick={() => setView('history')}>📊 历史记录</button>
      </div>
      {view === 'form' ? (
        <div className={styles.content}>
          <div className={styles.hint}>根据你的真实感受评分，没有对错之分</div>
          {defaultItems.map(item => (
            <div key={item.key} className={styles.item}>
              <div className={styles.itemLabel}>{item.label}</div>
              <div className={styles.ratingRow}>
                {levels.map((level, i) => (
                  <button
                    key={i}
                    className={`${styles.ratingBtn} ${ratings[item.key] === i ? styles.selected : ''}`}
                    onClick={() => selectRating(item.key, i)}
                  >{i}</button>
                ))}
              </div>
              <div className={styles.ratingLabels}>
                <span>{levels[0]}</span><span>{levels[4]}</span>
              </div>
            </div>
          ))}
          <textarea
            className={styles.note}
            placeholder="本周有什么想记录的吗？（选填）"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <div className={styles.summary}>
            总分：<strong>{totalScore}</strong> / 28
          </div>
          <button className={styles.submitBtn} onClick={handleSubmit}>提交周报</button>
        </div>
      ) : (
        <div className={styles.content}>
          {reports.length === 0 ? (
            <div className={styles.empty}>暂无记录，完成第一次周报后这里会显示历史趋势</div>
          ) : (
            reports.slice(-8).reverse().map(report => (
              <div key={report.id} className={styles.historyCard}>
                <div className={styles.historyDate}>{report.date}（{report.weekKey}）</div>
                <div className={styles.historyScore}>总分：{report.items.reduce((a, b) => a + b.value, 0)} / 28</div>
                {report.note && <div className={styles.historyNote}>{report.note}</div>}
              </div>
            ))
          )}
        </div>
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}
