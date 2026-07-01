import { computed } from 'vue'
import { useStore } from 'vuex'

export function useCheckIn() {
  const store = useStore()
  const todayRecord = computed(() => store.getters['checkin/todayRecord'])
  const hasCheckedToday = computed(() => !!todayRecord.value)
  const streakDays = computed(() => store.getters['checkin/streakDays'])

  function submitCheckIn(dimensions: any, note: string = '') {
    const today = new Date().toISOString().slice(0, 10)
    if (hasCheckedToday.value) {
      store.commit('checkin/UPDATE_RECORD', { date: today, dimensions, note })
    } else {
      store.commit('checkin/ADD_RECORD', { date: today, dimensions, note, timestamp: Date.now() })
    }
  }

  return { todayRecord, hasCheckedToday, streakDays, submitCheckIn }
}
