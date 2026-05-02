import { useState, useEffect, useCallback } from 'react'
import styles from './Toast.module.css'

export default function Toast({ message, duration, onClose }) {
  // Auto-calculate duration based on text length: ~150ms per character, min 2.5s, max 6s
  const autoDuration = duration ?? Math.min(4000, Math.max(2500, (message?.length || 0) * 80))
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (message) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onClose?.()
      }, autoDuration)
      return () => clearTimeout(timer)
    }
  }, [message, autoDuration, onClose])

  if (!message) return null
  return <div className={`${styles.toast} ${show ? styles.show : ''}`}>{message}</div>
}
