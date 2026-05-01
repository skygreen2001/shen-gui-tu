import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './Crisis.module.css'

export default function Crisis() {
  const [breathing, setBreathing] = useState(false)
  const [phase, setPhase] = useState('idle') // idle, inhale, hold, exhale
  const [count, setCount] = useState(0)
  const timerRef = useRef(null)

  const stopBreathing = useCallback(() => {
    setBreathing(false)
    setPhase('idle')
    setCount(0)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const startBreathCycle = useCallback(() => {
    // Inhale 4s
    setPhase('inhale')
    setCount(4)
    const countDown1 = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) { clearInterval(countDown1); return 0 }
        return prev - 1
      })
    }, 1000)

    timerRef.current = setTimeout(() => {
      // Hold 7s
      setPhase('hold')
      setCount(7)
      const countDown2 = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) { clearInterval(countDown2); return 0 }
          return prev - 1
        })
      }, 1000)

      timerRef.current = setTimeout(() => {
        // Exhale 8s
        setPhase('exhale')
        setCount(8)
        const countDown3 = setInterval(() => {
          setCount(prev => {
            if (prev <= 1) { clearInterval(countDown3); return 0 }
            return prev - 1
          })
        }, 1000)

        timerRef.current = setTimeout(() => {
          if (breathing) startBreathCycle()
        }, 8000)
      }, 7000)
    }, 4000)
  }, [breathing])

  const toggleBreathing = useCallback(() => {
    if (breathing) { stopBreathing(); return }
    setBreathing(true)
    startBreathCycle()
  }, [breathing, stopBreathing, startBreathCycle])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const phaseText = { idle: '开始', inhale: `吸气 ${count}`, hold: `屏息 ${count}`, exhale: `呼气 ${count}` }
  const circleClass = `${styles.circle} ${phase === 'inhale' ? styles.inhale : ''} ${phase === 'hold' ? styles.hold : ''} ${phase === 'exhale' ? styles.exhale : ''}`

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroTitle}>你不是一个人 🤝</div>
        <div className={styles.heroSub}>无论何时，都有人愿意倾听和帮助你</div>
      </div>
      <div className={styles.actions}>
        <a href="tel:962525" className={styles.primaryBtn}>📞 立即拨打 962525</a>
        <a href="tel:4001619995" className={styles.secondaryBtn}>📞 全国热线 400-161-9995</a>
      </div>
      <div className={styles.channels}>
        <div className={styles.channelItem}>🏥 <a href="tel:120">急救电话 120</a></div>
        <div className={styles.channelItem}>💬 <a href="tel:4001619995">希望24热线</a></div>
        <div className={styles.channelItem}>📱 <a href="tel:12345">市民服务热线 12345</a></div>
        <div className={styles.channelItem}>🏫 <a href="tel:962525">学校心理中心</a></div>
      </div>
      <div className={styles.breathSection}>
        <div className={styles.breathCard}>
          <div className={styles.breathTitle}>🌬️ 4-7-8 呼吸放松法</div>
          <div className={styles.circleWrap}>
            <div className={circleClass} />
            <div className={styles.breathText}>{phaseText[phase]}</div>
          </div>
          <button className={styles.breathBtn} onClick={toggleBreathing}>
            {breathing ? '停止练习' : '开始练习'}
          </button>
        </div>
      </div>
      <div className={styles.safetyTips}>
        <div className={styles.safetyCard}>
          <h3>🛡️ 安全小贴士</h3>
          <div className={styles.safetyItem}>远离危险物品和环境</div>
          <div className={styles.safetyItem}>联系信任的人，告诉他们你的感受</div>
          <div className={styles.safetyItem}>去一个让你感到安全的地方</div>
          <div className={styles.safetyItem}>记住：这种感觉会过去的</div>
        </div>
      </div>
    </div>
  )
}
