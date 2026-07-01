import { loadData, saveData } from '../storage'

const STORAGE_KEY = 'sgt-checkins'

interface CheckInRecord {
  date: string
  dimensions: {
    sleep: number
    mood: number
    body: number
    motivation: number
    cognition: number
    social: number
  }
  note: string
  timestamp: number
}

export default {
  namespaced: true,
  state: () => ({
    records: loadData<CheckInRecord[]>(STORAGE_KEY, [])
  }),
  mutations: {
    ADD_RECORD(state, record: CheckInRecord) {
      state.records.push(record)
      saveData(STORAGE_KEY, state.records)
    },
    UPDATE_RECORD(state, payload: { date: string; dimensions: any; note: string }) {
      const idx = state.records.findIndex((r: CheckInRecord) => r.date === payload.date)
      if (idx !== -1) {
        state.records[idx] = { ...state.records[idx], dimensions: payload.dimensions, note: payload.note }
        saveData(STORAGE_KEY, state.records)
      }
    },
    CLEAR_RECORDS(state) {
      state.records = []
      saveData(STORAGE_KEY, [])
    }
  },
  getters: {
    recentRecords: (state) => (days: number = 7) => {
      return state.records.slice(-days).sort((a: CheckInRecord, b: CheckInRecord) => a.date.localeCompare(b.date))
    },
    todayRecord: (state) => {
      const today = new Date().toISOString().slice(0, 10)
      return state.records.find((r: CheckInRecord) => r.date === today) || null
    },
    streakDays: (state) => {
      if (state.records.length === 0) return 0
      const sorted = [...state.records].sort((a: CheckInRecord, b: CheckInRecord) => b.date.localeCompare(a.date))
      let streak = 0
      const today = new Date().toISOString().slice(0, 10)
      const checkDate = new Date()
      if (sorted[0].date !== today) {
        checkDate.setDate(checkDate.getDate() - 1)
      }
      for (const record of sorted) {
        const dateStr = checkDate.toISOString().slice(0, 10)
        if (record.date === dateStr) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (record.date < dateStr) {
          break
        }
      }
      return streak
    }
  }
}

