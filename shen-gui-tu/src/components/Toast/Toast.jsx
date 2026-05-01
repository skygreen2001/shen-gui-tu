import { useState, useEffect, useCallback } from 'react'
import styles from './Toast.module.css'

export default function Toast({ message, duration = 2500, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (message) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])

  if (!message) return null
  return <div className={`${styles.toast} ${show ? styles.show : ''}`}>{message}</div>
}
