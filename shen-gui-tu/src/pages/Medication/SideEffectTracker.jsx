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

// 循证应对策略
const copingStrategies = {
  weight: [
    '🏃 每周至少3次30分钟有氧运动（散步、游泳）',
    '🥗 选择高纤维、低热量食物，避免含糖饮料',
    '📊 每周固定时间称重并记录，关注趋势而非单次数值',
  ],
  drowsiness: [
    '⏰ 尝试将服药时间调整到睡前（请先咨询医生）',
    '☕ 上午适量咖啡因可能帮助（避免下午后摄入）',
    '🚶 白天短时间散步（10-15分钟）有助于提神',
  ],
  sexual: [
    '💬 不要羞于和医生沟通，这是常见的药物反应',
    '📅 医生可能会调整剂量或换药，多数情况可以改善',
    '🤝 与伴侣坦诚沟通，减少心理压力',
  ],
  gi: [
    '🍽️ 随餐服药或饭后服用可减轻胃肠不适',
    '🫖 避免辛辣、油腻食物，少食多餐',
    '💧 保持充足水分摄入',
  ],
  insomnia: [
    '🌙 建立固定的睡前仪式：洗温水澡、轻度拉伸、避免屏幕',
    '⏰ 白天固定时间起床，即使没睡好也不要赖床',
    '🧘 尝试"三分钟呼吸空间"练习（可在干预训练中找到）',
  ],
  appetite: [
    '📋 每日记录饮食，帮助了解食欲变化模式',
    '🍽️ 定时进餐，即使不饿也吃少量健康食物',
    '🥜 准备一些营养密集的零食（坚果、酸奶）',
  ],
  anxiety: [
    '🧠 提醒自己：这可能是药物初期的暂时反应，通常1-2周后减轻',
    '🌬️ 焦虑时尝试"三分钟呼吸空间"练习',
    '📞 如果焦虑严重或持续加重，请及时联系医生',
  ],
}

export default function SideEffectTracker({ onBack }) {
  const [reports, setReports] = useLocalStorage('sgt-side-effects', [])
  const [ratings, setRatings] = useState({})
  const [note, setNote] = useState('')
  const [view, setView] = useState('form') // form | history | strategies | report
  const [toast, setToast] = useState('')
  const [strategies, setStrategies] = useState([])
  const [reportText, setReportText] = useState('')

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

    // Generate coping strategies for items rated >= 2
    const highItems = items.filter(item => item.value >= 2)
    if (highItems.length > 0) {
      const tips = []
      highItems.forEach(item => {
        const itemStrategies = copingStrategies[item.key]
        if (itemStrategies) {
          tips.push({ label: item.label, value: item.value, strategies: itemStrategies })
        }
      })
      setStrategies(tips)
      setView('strategies')
    } else {
      setToast('✅ 副作用周报已记录，各项指标良好！')
    }
  }, [ratings, note, setReports])

  const handleGenerateReport = useCallback(() => {
    if (reports.length === 0) return
    const recent = reports.slice(-4)
    const lines = [
      '📋 副作用追踪报告',
      `生成日期：${new Date().toLocaleDateString('zh-CN')}`,
      `记录周期：${recent.length} 周`,
      '──────────────',
      '',
    ]
    recent.forEach(r => {
      const score = r.items.reduce((a, b) => a + b.value, 0)
      const highItems = r.items.filter(i => i.value >= 2).map(i => `${i.label}(${levels[i.value]})`)
      lines.push(`📅 ${r.date}（${r.weekKey}）总分：${score}/28`)
      if (highItems.length > 0) lines.push(`   较明显：${highItems.join('、')}`)
      if (r.note) lines.push(`   备注：${r.note}`)
      lines.push('')
    })
    // Trend summary
    if (recent.length >= 2) {
      const first = recent[0].items.reduce((a, b) => a + b.value, 0)
      const last = recent[recent.length - 1].items.reduce((a, b) => a + b.value, 0)
      const trend = last < first ? '↓ 改善趋势' : last > first ? '↑ 需要关注' : '→ 保持稳定'
      lines.push(`📊 趋势分析：${trend}（${first} → ${last}）`)
    }
    lines.push('')
    lines.push('此报告由"申归途"APP自动生成，仅供参考。')
    setReportText(lines.join('\n'))
    setView('report')
  }, [reports])

  const handleCopyReport = useCallback(() => {
    navigator.clipboard.writeText(reportText).then(() => {
      setToast('✅ 报告已复制到剪贴板，复诊时可粘贴给医生')
    }).catch(() => {
      setToast('复制失败，请手动选择文本复制')
    })
  }, [reportText])

  const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={view === 'strategies' || view === 'report' ? () => setView('form') : onBack}>
          {view === 'strategies' || view === 'report' ? '← 返回' : '← 返回'}
        </button>
        <h2>副作用追踪</h2>
      </div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${view === 'form' ? styles.activeTab : ''}`} onClick={() => setView('form')}>📝 本周记录</button>
        <button className={`${styles.tab} ${view === 'history' ? styles.activeTab : ''}`} onClick={() => setView('history')}>📊 历史记录</button>
        {reports.length > 0 && (
          <button className={`${styles.tab} ${view === 'report' ? styles.activeTab : ''}`} onClick={handleGenerateReport}>📋 报告</button>
        )}
      </div>

      {view === 'strategies' && (
        <div className={styles.content}>
          <div className={styles.strategyHeader}>💡 针对你本周的副作用，以下是一些循证应对建议：</div>
          {strategies.map((item, idx) => (
            <div key={idx} className={styles.strategyGroup}>
              <div className={styles.strategyTitle}>
                {item.label}
                <span className={styles.strategyLevel}>{levels[item.value]}</span>
              </div>
              {item.strategies.map((tip, i) => (
                <div key={i} className={styles.strategyTip}>{tip}</div>
              ))}
            </div>
          ))}
          <div className={styles.strategyNote}>
            💡 以上建议仅供参考。如果副作用严重影响日常生活，请及时联系医生。
          </div>
          <button className={styles.submitBtn} onClick={() => setView('form')}>我知道了</button>
        </div>
      )}

      {view === 'report' && (
        <div className={styles.content}>
          <div className={styles.reportHeader}>📋 副作用追踪报告（供复诊参考）</div>
          <pre className={styles.reportContent}>{reportText}</pre>
          <button className={styles.submitBtn} onClick={handleCopyReport}>📋 复制报告到剪贴板</button>
        </div>
      )}

      {view === 'form' && (
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
      )}

      {view === 'history' && (
        <div className={styles.content}>
          {reports.length === 0 ? (
            <div className={styles.empty}>暂无记录，完成第一次周报后这里会显示历史趋势</div>
          ) : (
            <>
              {reports.slice(-8).reverse().map(report => (
                <div key={report.id} className={styles.historyCard}>
                  <div className={styles.historyDate}>{report.date}（{report.weekKey}）</div>
                  <div className={styles.historyScore}>总分：{report.items.reduce((a, b) => a + b.value, 0)} / 28</div>
                  {report.note && <div className={styles.historyNote}>{report.note}</div>}
                </div>
              ))}
              <button className={styles.submitBtn} style={{ marginTop: 'var(--space-md)', background: 'var(--primary)' }} onClick={handleGenerateReport}>
                📋 生成复诊报告
              </button>
            </>
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
