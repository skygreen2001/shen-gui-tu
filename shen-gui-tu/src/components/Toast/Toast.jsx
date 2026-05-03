import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './Toast.module.css'

export default function Toast({ message, duration, onClose }) {
  const autoDuration = duration ?? Math.min(4000, Math.max(2500, (message?.length || 0) * 80))
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ left: '4vw', right: '4vw' })

  // Align with #root container bounds
  useEffect(() => {
    const update = () => {
      const root = document.getElementById('root')
      if (!root) return
      const rect = root.getBoundingClientRect()
      const pad = Math.max(16, rect.width * 0.04)
      setPos({ left: `${rect.left + pad}px`, right: `${window.innerWidth - rect.right + pad}px` })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

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

  return (
    <div
      className={`${styles.toast} ${show ? styles.show : ''}`}
      style={{ left: pos.left, right: pos.right }}
    >
      {message}
    </div>
  )
}
