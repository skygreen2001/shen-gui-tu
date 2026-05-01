import { useEffect, useState } from 'react'
import styles from './RiskGauge.module.css'

export default function RiskGauge({ score = 0, level = 'unknown' }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const circumference = 2 * Math.PI * 85
  const offset = circumference * (1 - score / 100)

  const config = {
    green: { color: 'var(--success)', label: '状态良好' },
    yellow: { color: 'var(--warning)', label: '需要关注' },
    orange: { color: 'var(--accent)', label: '建议就医' },
    red: { color: 'var(--danger)', label: '请尽快就医' },
    unknown: { color: 'var(--border)', label: '暂无数据' },
  }
  const { color, label } = config[level] || config.unknown

  useEffect(() => {
    let current = 0
    const step = Math.max(1, Math.floor(score / 30))
    const timer = setInterval(() => {
      current += step
      if (current >= score) { current = score; clearInterval(timer) }
      setAnimatedScore(current)
    }, 20)
    return () => clearInterval(timer)
  }, [score])

  return (
    <div className={styles.gauge}>
      <div className={styles.wrap}>
        <svg className={styles.svg} viewBox="0 0 200 200">
          <circle className={styles.bg} cx="100" cy="100" r="85" />
          <circle
            className={styles.fill}
            cx="100" cy="100" r="85"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ stroke: color }}
          />
        </svg>
        <div className={styles.center}>
          <div className={styles.score}>{animatedScore}</div>
          <div className={styles.scoreLabel}>综合评分</div>
          <div className={styles.level} style={{ color }}>{label}</div>
        </div>
      </div>
    </div>
  )
}
