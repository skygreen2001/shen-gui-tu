import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const tabs = [
  { to: '/dashboard', icon: '🏠', label: '首页' },
  { to: '/medication', icon: '💊', label: '疗愈' },
  { to: '/resources', icon: '📚', label: '服务' },
  { to: '/cbt', icon: '📖', label: '成长' },
]

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
