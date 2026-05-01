import { useNavigate } from 'react-router-dom'
import styles from './Welcome.module.css'

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <div className={`${styles.hero} fade-in`}>
        <div className={styles.brand}>申归途</div>
        <div className={styles.subtitle}>抑郁症复发预防支持工具</div>
      </div>
      <div className={styles.props}>
        <div className={`${styles.prop} fade-in`} style={{animationDelay:'0.05s'}}>
          <div className={styles.propIcon}>📋</div>
          <div className={styles.propTitle}>每日追踪</div>
          <div className={styles.propDesc}>6维度签到</div>
        </div>
        <div className={`${styles.prop} fade-in`} style={{animationDelay:'0.1s'}}>
          <div className={styles.propIcon}>💊</div>
          <div className={styles.propTitle}>用药提醒</div>
          <div className={styles.propDesc}>智能管理</div>
        </div>
        <div className={`${styles.prop} fade-in`} style={{animationDelay:'0.15s'}}>
          <div className={styles.propIcon}>🛡️</div>
          <div className={styles.propTitle}>危机守护</div>
          <div className={styles.propDesc}>一键求助</div>
        </div>
      </div>
      <div className={styles.divider}><span>数据支撑</span></div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statNum}>50%</div>
          <div className={styles.statLabel}>复发率</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>2年</div>
          <div className={styles.statLabel}>高发期</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNum}>85%</div>
          <div className={styles.statLabel}>可预防</div>
        </div>
      </div>
      <div className={styles.cta}>
        <button className={styles.ctaBtn} onClick={() => navigate('/dashboard')}>开始使用</button>
      </div>
      <div className={styles.disclaimer}>
        本工具仅作为辅助支持，不替代专业医疗建议<br />
        如需帮助请拨打 <a href="tel:962525">心理热线 962525</a>
      </div>
    </div>
  )
}
