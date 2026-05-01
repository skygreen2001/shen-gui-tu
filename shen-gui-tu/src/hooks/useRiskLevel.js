import { useMemo } from 'react'
import useCheckIn from './useCheckIn'
import { calculateRiskScore } from '../utils/riskCalculator'

export default function useRiskLevel() {
  const { checkIns, getRecentCheckIns } = useCheckIn()
  const recent = getRecentCheckIns(7)
  const result = useMemo(() => calculateRiskScore(recent), [recent])
  return { ...result, checkIns, recordCount: checkIns.length }
}
