import { useEffect } from 'react'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.mask} onClick={onCancel}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>取消</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>确定</button>
        </div>
      </div>
    </div>
  )
}
