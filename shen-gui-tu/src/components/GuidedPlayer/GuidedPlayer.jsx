import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './GuidedPlayer.module.css'

export default function GuidedPlayer({ guided }) {
  const { type, segments } = guided
  const [playing, setPlaying] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [finished, setFinished] = useState(false)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)
  const countdownRef = useRef(null)
  const currentIdxRef = useRef(0)
  const audioRef = useRef(null)

  // Check if audio is available for segments
  const hasAudio = segments.some(s => s.audio)

  const currentSeg = segments[currentIdx]
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0)
  const elapsed = segments.slice(0, currentIdx).reduce((sum, s) => sum + s.duration, 0) + (currentSeg ? currentSeg.duration - countdown * 1000 : 0)
  const progress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0

  const stopTimers = useCallback(() => {
    clearTimeout(timerRef.current)
    clearInterval(countdownRef.current)
  }, [])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current = null
    }
  }, [])

  const playSegmentAudio = useCallback((seg) => {
    stopAudio()
    if (!seg.audio) return
    const audio = new Audio(seg.audio)
    audio.onended = () => {
      // Audio finished naturally — timer will handle next segment
    }
    audio.onerror = () => {
      console.warn('Audio playback error:', seg.audio)
    }
    audioRef.current = audio
    audio.play().catch(() => {
      console.warn('Audio play blocked or failed')
    })
  }, [stopAudio])

  const runSegment = useCallback((idx) => {
    if (idx >= segments.length) {
      setFinished(true)
      setPlaying(false)
      stopAudio()
      return
    }
    currentIdxRef.current = idx
    setCurrentIdx(idx)
    setFinished(false)
    const seg = segments[idx]
    setCountdown(Math.ceil(seg.duration / 1000))
    playSegmentAudio(seg)

    const totalSec = Math.ceil(seg.duration / 1000)
    let remaining = totalSec
    countdownRef.current = setInterval(() => {
      remaining--
      if (remaining <= 0) clearInterval(countdownRef.current)
      setCountdown(Math.max(0, remaining))
    }, 1000)

    timerRef.current = setTimeout(() => {
      clearInterval(countdownRef.current)
      runSegment(idx + 1)
    }, seg.duration)
  }, [segments, playSegmentAudio, stopAudio])

  const skipToNext = useCallback(() => {
    stopTimers()
    stopAudio()
    runSegment(currentIdxRef.current + 1)
  }, [stopTimers, stopAudio, runSegment])

  const handlePlay = useCallback(() => {
    stopTimers()
    if (finished) {
      setFinished(false)
      setCurrentIdx(0)
      setPlaying(true)
      setPaused(false)
      runSegment(0)
      return
    }
    if (paused) {
      setPaused(false)
      setPlaying(true)
      // Resume audio
      if (audioRef.current) {
        audioRef.current.play().catch(() => {})
      }
      // Resume countdown
      const seg = segments[currentIdx]
      const remaining = countdown * 1000
      let remaining2 = Math.ceil(remaining / 1000)
      countdownRef.current = setInterval(() => {
        remaining2--
        if (remaining2 <= 0) clearInterval(countdownRef.current)
        setCountdown(Math.max(0, remaining2))
      }, 1000)
      timerRef.current = setTimeout(() => {
        clearInterval(countdownRef.current)
        runSegment(currentIdx + 1)
      }, remaining)
      return
    }
    setPlaying(true)
    setPaused(false)
    runSegment(0)
  }, [finished, paused, currentIdx, countdown, segments, runSegment, stopTimers])

  const handlePause = useCallback(() => {
    stopTimers()
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setPaused(true)
    setPlaying(false)
  }, [stopTimers])

  const handleStop = useCallback(() => {
    stopTimers()
    stopAudio()
    setPlaying(false)
    setPaused(false)
    setFinished(false)
    setCurrentIdx(0)
    setCountdown(0)
  }, [stopTimers, stopAudio])

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      clearInterval(countdownRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.onended = null
      }
    }
  }, [])

  const formatTime = (ms) => {
    const s = Math.ceil(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const bodyParts = segments.filter(s => s.part).map(s => s.part)

  return (
    <div className={styles.player}>
      {/* Animation area */}
      <div className={styles.animationArea}>
        {type === 'breathing' && (
          <div className={styles.breathContainer}>
            <div className={`${styles.breathCircle} ${playing ? styles.breathActive : ''}`} />
            <div className={styles.breathLabel}>
              {currentSeg?.phase === 'observe' && '觉察当下'}
              {currentSeg?.phase === 'breathe' && '聚焦呼吸'}
              {currentSeg?.phase === 'expand' && '扩展觉察'}
              {!playing && !finished && '准备开始'}
            </div>
          </div>
        )}
        {type === 'bodyScan' && (
          <div className={styles.bodyScanContainer}>
            <div className={styles.bodyOutline}>
              {bodyParts.map((part, i) => (
                <div key={part} className={`${styles.bodyPart} ${i <= currentIdx && playing ? styles.bodyPartActive : ''}`}>
                  {part}
                </div>
              ))}
            </div>
          </div>
        )}
        {type === 'meditation' && (
          <div className={styles.meditationContainer}>
            <div className={`${styles.meditCircle} ${playing ? styles.meditPulse : ''}`} />
            <div className={styles.meditLabel}>
              {!playing && !finished && '准备开始'}
              {finished && '练习结束 🌱'}
              {playing && '正在引导...'}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Current segment text */}
      <div className={styles.segmentText}>
        {finished ? '练习结束。你做得很棒！' : (currentSeg?.text || '')}
      </div>

      {/* Segment indicator — clickable to jump */}
      <div className={styles.segmentDots}>
        {segments.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.segDot} ${i === currentIdx && playing ? styles.segDotActive : ''} ${i < currentIdx || finished ? styles.segDotDone : ''}`}
            onClick={() => { stopTimers(); stopAudio(); setPlaying(true); setPaused(false); runSegment(i) }}
            title={`跳转到第 ${i + 1} 段`}
          />
        ))}
      </div>

      {/* Timer */}
      <div className={styles.timerRow}>
        <span>{formatTime(elapsed)}</span>
        <span>{formatTime(totalDuration)}</span>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {!playing && !paused && (
          <button className={styles.playBtn} onClick={handlePlay}>
            ▶ {finished ? '重新播放' : '开始引导'}
          </button>
        )}
        {playing && (
          <>
            <button className={styles.skipBtn} onClick={skipToNext}>⏭ 跳过</button>
            <button className={styles.pauseBtn} onClick={handlePause}>⏸ 暂停</button>
          </>
        )}
        {paused && (
          <button className={styles.playBtn} onClick={handlePlay}>▶ 继续</button>
        )}
        {(playing || paused) && (
          <button className={styles.stopBtn} onClick={handleStop}>⏹ 结束</button>
        )}
      </div>

      {/* Audio status notice */}
      {!hasAudio && (
        <div className={styles.notice}>音频文件暂未生成，请跟随文字自行练习</div>
      )}
    </div>
  )
}
