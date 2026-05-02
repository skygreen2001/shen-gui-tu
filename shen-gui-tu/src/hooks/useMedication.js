import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'
import { formatDate } from '../utils/dateUtils'

export default function useMedication() {
  const [medications, setMedications] = useLocalStorage('sgt-medications', [])

  const addMedication = useCallback((med) => {
    const newMed = { ...med, id: Date.now(), createdAt: Date.now(), doses: [] }
    setMedications(prev => [...prev, newMed])
    return newMed
  }, [setMedications])

  const removeMedication = useCallback((id) => {
    setMedications(prev => prev.filter(m => m.id !== id))
  }, [setMedications])

  const recordDose = useCallback((medId, status = 'taken') => {
    const todayStr = formatDate()
    setMedications(prev => prev.map(m => {
      if (m.id === medId) {
        const doses = [...(m.doses || [])]
        const idx = doses.findIndex(d => d.date === todayStr)
        const record = { date: todayStr, status, timestamp: Date.now() }
        if (idx >= 0) {
          doses[idx] = record // 当天已有记录：覆盖，以最后一次为准
        } else {
          doses.push(record)
        }
        return { ...m, doses }
      }
      return m
    }))
  }, [setMedications])

  const getAdherenceRate = useCallback((days = 30) => {
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = formatDate(since)
    let total = 0, taken = 0
    medications.forEach(m => {
      (m.doses || []).forEach(d => {
        if (d.date >= sinceStr) { total++; if (d.status === 'taken') taken++ }
      })
    })
    return total === 0 ? 0 : Math.round((taken / total) * 100)
  }, [medications])

  const getMedStatus = useCallback((medId) => {
    const med = medications.find(m => m.id === medId)
    if (!med) return 'unknown'
    const todayStr = formatDate()
    const todayDose = (med.doses || []).find(d => d.date === todayStr)
    return todayDose ? todayDose.status : 'pending'
  }, [medications])

  const getStreak = useCallback(() => {
    if (medications.length === 0) return 0
    // Collect all dates where ALL medications were taken
    const dateSet = new Set()
    medications.forEach(m => {
      (m.doses || []).forEach(d => {
        if (d.status === 'taken') dateSet.add(d.date)
      })
    })
    // Count consecutive days from today backwards
    let streak = 0
    const d = new Date()
    while (true) {
      const dateStr = formatDate(d)
      if (dateSet.has(dateStr)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }, [medications])

  const getOnsetPhase = useCallback(() => {
    // Count actual taken days from dose records
    const fourWeeks = 4 * 7
    for (const med of medications) {
      const takenDates = new Set(
        (med.doses || []).filter(d => d.status === 'taken').map(d => d.date)
      )
      const takenDays = takenDates.size
      if (takenDays > 0 && takenDays <= fourWeeks) {
        return { active: true, medName: med.name, daysSince: takenDays }
      }
    }
    return { active: false }
  }, [medications])

  return { medications, addMedication, removeMedication, recordDose, getAdherenceRate, getMedStatus, getStreak, getOnsetPhase }
}
