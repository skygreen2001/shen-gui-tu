import { computed } from 'vue'
import { useStore } from 'vuex'
import { calculateRiskScore } from '../utils/riskCalculator'

export function useRiskLevel() {
  const store = useStore()
  const recentRecords = computed(() => store.getters['checkin/recentRecords'](7))
  const riskInfo = computed(() => {
    if (recentRecords.value.length === 0) {
      return { score: 0, level: 'unknown', color: '#E5E2DC', label: '暂无数据' }
    }
    return calculateRiskScore(recentRecords.value)
  })
  return { riskInfo, recentRecords }
}
