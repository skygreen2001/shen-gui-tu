import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import RiskGauge from '../../components/RiskGauge/RiskGauge'
import useRiskLevel from '../../hooks/useRiskLevel'
import useCheckIn from '../../hooks/useCheckIn'
import useMedication from '../../hooks/useMedication'
import styles from './Dashboard.module.css'

const dimColors = ['#B2BEC3','#6BAF7A','#4A90D9','#E8C95A','#E8985E','#D46B6B']
const dimKeys = ['sleep','mood','body','motivation','cognition','social']
const dayLabels = ['一','二','三','四','五','六','日']

export default function Dashboard() {
  const navigate = useNavigate()
  const { score, level, color, label } = useRiskLevel()
  const { getRecentCheckIns, hasCheckedToday } = useCheckIn()
  const { getAdherenceRate } = useMedication()
  const adherence = getAdherenceRate(30)
  const recent = getRecentCheckIns(7)

  const streak = useMemo(() => {
    let count = 0
    for (let i = recent.length - 1; i >= 0; i--) {
      count++
    }
    return count
  }, [recent])

  const trendData = useMemo(() => {
    const data = Array.from({ length: 7 }, () => Array(6).fill(0))
    recent.forEach(ci => {
      const idx = recent.indexOf(ci)
      if (idx < 7) {
        dimKeys.forEach((key, di) => {
          data[idx][di] = ci.dimensions?.[key] || 0
        })
      }
    })
    return data
  }, [recent])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>你好 👋</h1>
        <p>今天感觉怎么样？</p>
      </div>
      <div className={styles.content}>
        <RiskGauge score={score} level={level} />
        <button
          className={`${styles.checkinBtn} ${hasCheckedToday ? styles.checked : ''}`}
          onClick={() => navigate('/checkin')}
        >
          {hasCheckedToday ? '✅ 今日已签到（点击查看）' : '📋 开始今日签到'}
        </button>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{color:'var(--success)'}}>{streak}</div>
            <div className={styles.statLabel}>打卡天数</div>
          </div>
          <div className={styles.statCard} onClick={() => navigate('/medication')} role="button" tabIndex={0}>
            <div className={styles.statValue} style={{color:'var(--primary)'}}>{adherence}%</div>
            <div className={styles.statLabel}>用药率</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{color:'var(--accent)'}}>{recent.length}</div>
            <div className={styles.statLabel}>本周记录</div>
          </div>
        </div>
        <div className={styles.trend}>
          <div className={styles.trendTitle}>近7天趋势</div>
          <div className={styles.trendChart}>
            {dayLabels.map((day, i) => (
              <div key={day} className={styles.trendDay}>
                <div className={styles.trendBars}>
                  {dimKeys.map((_, di) => (
                    <div
                      key={di}
                      className={styles.trendBar}
                      style={{
                        height: `${(trendData[i]?.[di] || 0) * 12}px`,
                        background: dimColors[di],
                        opacity: trendData[i]?.[di] ? 0.7 : 0.2,
                      }}
                    />
                  ))}
                </div>
                <div className={styles.trendDayLabel}>{day}</div>
              </div>
            ))}
          </div>
        </div>
        {level === 'red' && (
          <div className={styles.riskBanner}>
            <span>⚠️</span>
            <span>您的状态评分偏低，建议联系医生或拨打 <a href="tel:962525" style={{color:'var(--danger)',fontWeight:700}}>962525</a></span>
          </div>
        )}
        <div className={styles.wrapEntry} onClick={() => navigate('/wrap')}>
          <div className={styles.wrapEntryIcon}>📝</div>
          <div className={styles.wrapEntryText}>
            <div className={styles.wrapEntryTitle}>WRAP 个人危机预防计划</div>
            <div className={styles.wrapEntryDesc}>制定你的个人康复行动计划，包含每日维护、预警信号、应对策略等</div>
          </div>
          <div className={styles.wrapEntryArrow}>→</div>
        </div>
      </div>
    </div>
  )
}
