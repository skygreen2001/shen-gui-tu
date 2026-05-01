import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../BottomNav/BottomNav'
import CrisisButton from '../CrisisButton/CrisisButton'
import styles from './Layout.module.css'

export default function Layout() {
  const location = useLocation()
  const hideCrisis = location.pathname === '/crisis'
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      {!hideCrisis && <CrisisButton />}
      <BottomNav />
    </div>
  )
}
