import { loadData, saveData } from '../storage'

const MED_KEY = 'sgt-medications'
const SIDE_EFFECT_KEY = 'sgt-side-effects'

interface DoseRecord { date: string; status: string; timestamp: number }
interface Medication { id: number; name: string; dose: string; frequency: string; time: string; doses: DoseRecord[]; createdAt: number }

export default {
  namespaced: true,
  state: () => ({
    medications: loadData<Medication[]>(MED_KEY, []),
    sideEffectRecords: loadData<any[]>(SIDE_EFFECT_KEY, [])
  }),
  mutations: {
    SET_MEDICATIONS(state, list: Medication[]) {
      state.medications = list
      saveData(MED_KEY, list)
    },
    ADD_MEDICATION(state, med: Medication) {
      state.medications.push(med)
      saveData(MED_KEY, state.medications)
    },
    REMOVE_MEDICATION(state, id: number) {
      state.medications = state.medications.filter((m: Medication) => m.id !== id)
      saveData(MED_KEY, state.medications)
    },
    RECORD_DOSE(state, payload: { medId: number; status: string }) {
      const med = state.medications.find((m: Medication) => m.id === payload.medId)
      if (med) {
        const todayStr = new Date().toISOString().slice(0, 10)
        const existing = med.doses.findIndex((d: DoseRecord) => d.date === todayStr)
        const record: DoseRecord = { date: todayStr, status: payload.status, timestamp: Date.now() }
        if (existing >= 0) {
          med.doses[existing] = record
        } else {
          med.doses.push(record)
        }
        saveData(MED_KEY, state.medications)
      }
    },
    ADD_SIDE_EFFECT_RECORD(state, record: any) {
      state.sideEffectRecords.push(record)
      saveData(SIDE_EFFECT_KEY, state.sideEffectRecords)
    },
    CLEAR_ALL(state) {
      state.medications = []
      state.sideEffectRecords = []
      saveData(MED_KEY, [])
      saveData(SIDE_EFFECT_KEY, [])
    }
  },
  getters: {
    adherenceRate: (state) => (days: number = 30) => {
      let total = 0, taken = 0
      const since = new Date()
      since.setDate(since.getDate() - days)
      const sinceStr = since.toISOString().slice(0, 10)
      state.medications.forEach((med: Medication) => {
        (med.doses || []).forEach((d: DoseRecord) => {
          if (d.date >= sinceStr) { total++; if (d.status === 'taken') taken++ }
        })
      })
      return total === 0 ? 0 : Math.round((taken / total) * 100)
    },
    getStreak: (state) => {
      const dateSet = new Set<string>()
      state.medications.forEach((med: Medication) => {
        (med.doses || []).forEach((d: DoseRecord) => {
          if (d.status === 'taken') dateSet.add(d.date)
        })
      })
      let streak = 0
      const d = new Date()
      while (true) {
        const dateStr = d.toISOString().slice(0, 10)
        if (dateSet.has(dateStr)) {
          streak++
          d.setDate(d.getDate() - 1)
        } else {
          break
        }
      }
      return streak
    },
    todayMedStatuses: (state) => {
      const todayStr = new Date().toISOString().slice(0, 10)
      return state.medications.map((med: Medication) => {
        const todayDose = (med.doses || []).find((d: DoseRecord) => d.date === todayStr)
        return { id: med.id, name: med.name, status: todayDose ? todayDose.status : 'pending' }
      })
    }
  }
}

