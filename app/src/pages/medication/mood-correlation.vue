<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-content">
      <view class="header">
        <text class="title">🔗 情绪与用药关联</text>
        <text class="subtitle">分析你的签到数据与用药记录之间的趋势</text>
      </view>
      <!-- 概览卡片 -->
      <view class="overview-cards">
        <view class="ov-card">
          <text class="ov-value">{{ analysisSummary.avgMood }}</text>
          <text class="ov-label">平均情绪评分</text>
        </view>
        <view class="ov-card">
          <text class="ov-value">{{ analysisSummary.adherenceDays }}</text>
          <text class="ov-label">按时服药天数</text>
        </view>
        <view class="ov-card">
          <text class="ov-value" :style="{ color: analysisSummary.correlationTrend }">{{ analysisSummary.trend }}</text>
          <text class="ov-label">趋势方向</text>
        </view>
      </view>
      <!-- 分析结果 -->
      <view class="analysis-card">
        <text class="analysis-title">趋势分析</text>
        <view v-for="(item, idx) in analysisItems" :key="idx" class="analysis-item">
          <text class="analysis-icon">{{ item.icon }}</text>
          <view class="analysis-text">
            <text class="analysis-heading">{{ item.heading }}</text>
            <text class="analysis-detail">{{ item.detail }}</text>
          </view>
        </view>
      </view>
      <!-- 提示 -->
      <view class="tip-card">
        <text class="tip-title">💡 小贴士</text>
        <view class="tip-list">
          <text class="tip-text">规律服药是情绪稳定的基础，尽量每天同一时间服药</text>
          <text class="tip-text">情绪波动是正常的，关注整体趋势比单日数据更有意义</text>
          <text class="tip-text">如果连续多天情绪低落，建议联系医生讨论调整方案</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const checkInRecords = computed(() => store.state.checkin?.records || [])
const medRecords = computed(() => store.state.medication?.records || [])

const analysisSummary = computed(() => {
  const records = checkInRecords.value as any[]
  if (records.length === 0) return { avgMood: '--', adherenceDays: '--', trend: '数据不足', correlationTrend: '#9B9B9B' }

  const moodScores = records.map(r => r.dimensions?.mood || 0)
  const avg = (moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length).toFixed(1)
  const adherenceDays = (medRecords.value as any[]).filter((r: any) => r.taken).length

  let trend = '稳定'
  let color = '#6BAF7A'
  if (moodScores.length >= 7) {
    const recent = moodScores.slice(-7)
    const earlier = moodScores.slice(-14, -7)
    if (earlier.length > 0) {
      const recentAvg = recent.reduce((a: number, b: number) => a + b, 0) / recent.length
      const earlierAvg = earlier.reduce((a: number, b: number) => a + b, 0) / earlier.length
      if (recentAvg > earlierAvg + 0.3) { trend = '上升'; color = '#6BAF7A' }
      else if (recentAvg < earlierAvg - 0.3) { trend = '下降'; color = '#D46B6B' }
    }
  }
  return { avgMood: avg, adherenceDays, trend, correlationTrend: color }
})

const analysisItems = computed(() => {
  const records = checkInRecords.value as any[]
  if (records.length < 3) return [{ icon: '📊', heading: '数据积累中', detail: '至少需要3天签到数据才能进行趋势分析，请坚持每日签到。' }]

  const items: Array<{ icon: string; heading: string; detail: string }> = []
  const sleepScores = records.map(r => r.dimensions?.sleep || 0)
  const moodScores = records.map(r => r.dimensions?.mood || 0)

  if (sleepScores.length >= 3) {
    const avgSleep = sleepScores.slice(-7).reduce((a: number, b: number) => a + b, 0) / Math.min(sleepScores.length, 7)
    items.push({
      icon: avgSleep >= 3.5 ? '😊' : '😴',
      heading: '睡眠与情绪',
      detail: avgSleep >= 3.5 ? '近期睡眠质量较好，对情绪稳定有积极影响。' : '近期睡眠评分偏低，建议关注睡眠卫生，规律作息有助于改善情绪。',
    })
  }

  if (medRecords.value.length > 0) {
    const takenCount = (medRecords.value as any[]).filter(r => r.taken).length
    const total = medRecords.value.length
    items.push({
      icon: takenCount / total >= 0.8 ? '💊' : '⚠️',
      heading: '用药依从性',
      detail: `过去${total}天中，按时服药${takenCount}天（${Math.round(takenCount / total * 100)}%）。${takenCount / total >= 0.8 ? '依从性良好，请继续保持。' : '依从性偏低，规律服药对情绪稳定非常重要。'}`,
    })
  }

  items.push({
    icon: '🎯',
    heading: '综合建议',
    detail: '持续每日签到可以帮助你更好地了解自己的状态模式。数据越多，分析越准确。',
  })

  return items
})
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: #F8F6F2; }
.scroll-content { padding: 32rpx; padding-bottom: 60rpx; }
.header { margin-bottom: 32rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.overview-cards { display: flex; gap: 16rpx; margin-bottom: 32rpx; }
.ov-card { flex: 1; background: #FFFFFF; border-radius: 20rpx; padding: 24rpx 16rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.ov-value { font-size: 40rpx; font-weight: 700; color: #4A90D9; display: block; }
.ov-label { font-size: 22rpx; color: #9B9B9B; margin-top: 8rpx; display: block; }
.analysis-card { background: #FFFFFF; border-radius: 20rpx; padding: 32rpx; margin-bottom: 32rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.analysis-title { font-size: 32rpx; font-weight: 600; color: #2D2D2D; margin-bottom: 24rpx; display: block; }
.analysis-item { display: flex; gap: 16rpx; padding: 16rpx 0; border-bottom: 1rpx solid #F0EDE7; }
.analysis-item:last-child { border-bottom: none; }
.analysis-icon { font-size: 36rpx; margin-top: 4rpx; }
.analysis-text { flex: 1; }
.analysis-heading { font-size: 28rpx; font-weight: 600; color: #2D2D2D; display: block; margin-bottom: 4rpx; }
.analysis-detail { font-size: 26rpx; color: #6B6B6B; line-height: 1.5; }
.tip-card { background: #EDF5EF; border-radius: 20rpx; padding: 28rpx; border-left: 6rpx solid #6BAF7A; }
.tip-title { font-size: 28rpx; font-weight: 600; color: #6BAF7A; display: block; margin-bottom: 16rpx; }
.tip-list { display: flex; flex-direction: column; gap: 12rpx; }
.tip-text { font-size: 26rpx; color: #4A4A4A; line-height: 1.5; }
</style>
