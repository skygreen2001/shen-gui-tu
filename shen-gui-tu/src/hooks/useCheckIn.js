import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'
import { formatDate } from '../utils/dateUtils'

export default function useCheckIn() {
  const [checkIns, setCheckIns] = useLocalStorage('sgt-checkins', [])

  const todayKey = formatDate()
  const todayCheckIn = checkIns.find(ci => ci.date === todayKey)
  const hasCheckedToday = !!todayCheckIn

  const submitCheckIn = useCallback((dimensions, note = '') => {
    const newCheckIn = { date: todayKey, dimensions, note, timestamp: Date.now() }
    setCheckIns(prev => {
      const idx = prev.findIndex(ci => ci.date === todayKey)
      if (idx >= 0) {
        // 当天已有记录：更新（替换），保持位置不变
        const updated = [...prev]
        updated[idx] = newCheckIn
        return updated
      }
      // 当天无记录：新增
      return [...prev, newCheckIn]
    })
    return newCheckIn
  }, [todayKey, setCheckIns])

  const getRecentCheckIns = useCallback((days = 7) => {
    return checkIns.slice(-days)
  }, [checkIns])

  const getDimensionTrend = useCallback((dim, days = 7) => {
    return checkIns.slice(-days).map(ci => ci.dimensions?.[dim] || null)
  }, [checkIns])

  return { checkIns, todayCheckIn, hasCheckedToday, submitCheckIn, getRecentCheckIns, getDimensionTrend }
}
