import { useNavigate } from 'react-router-dom'
import styles from './CrisisButton.module.css'

export default function CrisisButton() {
  const navigate = useNavigate()
  return (
    <button className={styles.btn} onClick={() => navigate('/crisis')} aria-label="紧急求助">
      🆘
    </button>
  )
}
