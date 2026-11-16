/**
 * 核心业务服务层（对齐 H5 useCheckIn / useMedication / useRiskLevel 等 hooks）
 * 所有数据持久化到 wx storage，key 与 H5 保持一致。
 */
import { getStore, setStore } from './store'
import { formatDate } from './date'
import { calculateRiskScore } from './risk'

const KEY_CHECKINS = 'sgt-checkins'
const KEY_MEDS = 'sgt-medications'

/* ─────────── 每日签到 ─────────── */

export function getCheckIns() {
  return getStore(KEY_CHECKINS, [])
}

export function submitCheckIn(dimensions, note = '') {
  const todayKey = formatDate()
  const list = getCheckIns()
  const newCheckIn = { date: todayKey, dimensions, note, timestamp: Date.now() }
  const idx = list.findIndex(ci => ci.date === todayKey)
  if (idx >= 0) {
    list[idx] = newCheckIn // 当天已有记录：更新（替换），保持位置不变
  } else {
    list.push(newCheckIn)
  }
  setStore(KEY_CHECKINS, list)
  return newCheckIn
}

export function getTodayCheckIn() {
  const todayKey = formatDate()
  return getCheckIns().find(ci => ci.date === todayKey) || null
}

export function hasCheckedToday() {
  return !!getTodayCheckIn()
}

export function getRecentCheckIns(days = 7) {
  return getCheckIns().slice(-days)
}

export function getDimensionTrend(dim, days = 7) {
  return getCheckIns().slice(-days).map(ci => (ci.dimensions && ci.dimensions[dim]) || null)
}

/* ─────────── 用药管理 ─────────── */

export function getMedications() {
  return getStore(KEY_MEDS, [])
}

export function addMedication(med) {
  const list = getMedications()
  const newMed = Object.assign({}, med, { id: Date.now(), createdAt: Date.now(), doses: [] })
  list.push(newMed)
  setStore(KEY_MEDS, list)
  return newMed
}

export function removeMedication(id) {
  setStore(KEY_MEDS, getMedications().filter(m => m.id !== id))
}

export function recordDose(medId, status = 'taken') {
  const todayStr = formatDate()
  const list = getMedications().map(m => {
    if (m.id === medId) {
      const doses = (m.doses || []).slice()
      const idx = doses.findIndex(d => d.date === todayStr)
      const record = { date: todayStr, status, timestamp: Date.now() }
      if (idx >= 0) doses[idx] = record // 当天已有记录：覆盖，以最后一次为准
      else doses.push(record)
      return Object.assign({}, m, { doses })
    }
    return m
  })
  setStore(KEY_MEDS, list)
}

export function getAdherenceRate(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = formatDate(since)
  let total = 0
  let taken = 0
  getMedications().forEach(m => {
    ;(m.doses || []).forEach(d => {
      if (d.date >= sinceStr) { total++; if (d.status === 'taken') taken++ }
    })
  })
  return total === 0 ? 0 : Math.round((taken / total) * 100)
}

export function getMedStatus(medId) {
  const med = getMedications().find(m => m.id === medId)
  if (!med) return 'unknown'
  const todayStr = formatDate()
  const todayDose = (med.doses || []).find(d => d.date === todayStr)
  return todayDose ? todayDose.status : 'pending'
}

export function getStreak() {
  const medications = getMedications()
  if (medications.length === 0) return 0
  const dateSet = new Set()
  medications.forEach(m => {
    ;(m.doses || []).forEach(d => {
      if (d.status === 'taken') dateSet.add(d.date)
    })
  })
  let streak = 0
  const d = new Date()
  for (;;) {
    const dateStr = formatDate(d)
    if (dateSet.has(dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function getOnsetPhase() {
  const fourWeeks = 4 * 7
  for (const med of getMedications()) {
    const takenDates = new Set(
      (med.doses || []).filter(d => d.status === 'taken').map(d => d.date)
    )
    const takenDays = takenDates.size
    if (takenDays > 0 && takenDays <= fourWeeks) {
      return { active: true, medName: med.name, daysSince: takenDays }
    }
  }
  return { active: false }
}

/* ─────────── 风险评级 ─────────── */

export function getRiskResult() {
  const recent = getRecentCheckIns(7)
  const result = calculateRiskScore(recent)
  return Object.assign({}, result, { checkIns: getCheckIns(), recordCount: getCheckIns().length })
}
