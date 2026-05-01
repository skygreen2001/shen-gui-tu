import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Welcome from './pages/Welcome/Welcome'
import Dashboard from './pages/Dashboard/Dashboard'
import CheckIn from './pages/CheckIn/CheckIn'
import Medication from './pages/Medication/Medication'
import Resources from './pages/Resources/Resources'
import Crisis from './pages/Crisis/Crisis'
import CBTCourse from './pages/CBTCourse/CBTCourse'
import WRAPPlan from './pages/WRAPPlan/WRAPPlan'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/medication" element={<Medication />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/crisis" element={<Crisis />} />
        <Route path="/cbt" element={<CBTCourse />} />
        <Route path="/wrap" element={<WRAPPlan />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
