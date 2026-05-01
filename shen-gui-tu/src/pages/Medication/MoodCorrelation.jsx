import useMedMoodCorrelation from '../../hooks/useMedMoodCorrelation'
import styles from './MoodCorrelation.module.css'

export default function MoodCorrelation({ onBack }) {
  const { weeks, insights, hasData } = useMedMoodCorrelation()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← 返回</button>
        <h2>药物-情绪联动</h2>
      </div>
      <div className={styles.content}>
        {!hasData ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📈</div>
            <p>数据积累中</p>
            <p className={styles.emptyHint}>需要至少 2 周的签到和副作用记录才能生成分析</p>
          </div>
        ) : (
          <>
            {/* 图表区域 */}
            <div className={styles.chartSection}>
              <h3 className={styles.chartTitle}>近 {weeks.length} 周趋势</h3>
              <div className={styles.chartLegend}>
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.moodDot}`}></span> 情绪评分
                </span>
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.seDot}`}></span> 副作用总分
                </span>
              </div>
              <div className={styles.chart}>
                {weeks.map((wk, i) => (
                  <div key={wk.weekKey} className={styles.barGroup}>
                    {/* 情绪条 */}
                    <div className={styles.barRow}>
                      <div
                        className={`${styles.bar} ${styles.moodBar}`}
                        style={{ height: wk.avgMood !== null ? `${wk.avgMood * 10}%` : 0 }}
                        title={wk.avgMood !== null ? `情绪: ${wk.avgMood}` : '无数据'}
                      />
                    </div>
                    {/* 副作用条 */}
                    <div className={styles.barRow}>
                      <div
                        className={`${styles.bar} ${styles.seBar}`}
                        style={{ height: wk.sideEffectScore !== null ? `${(wk.sideEffectScore / 28) * 100}%` : 0 }}
                        title={wk.sideEffectScore !== null ? `副作用: ${wk.sideEffectScore}/28` : '无数据'}
                      />
                    </div>
                    <div className={styles.barLabel}>{wk.weekKey.replace(/^\d{4}-/, '')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 洞察区域 */}
            <div className={styles.insightSection}>
              <h3 className={styles.chartTitle}>📋 分析洞察</h3>
              {insights.map((text, i) => (
                <div key={i} className={styles.insightCard}>{text}</div>
              ))}
            </div>
          </>
        )}
        <div className={styles.disclaimer}>
          ⚕️ 以上分析仅供参考，不能替代专业医疗建议。如有不适请及时就医。
        </div>
      </div>
    </div>
  )
}
