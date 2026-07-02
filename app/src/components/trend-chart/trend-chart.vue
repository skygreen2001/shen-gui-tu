<template>
  <view class="chart-container">
    <scroll-view scroll-x class="chart-scroll">
      <view class="chart-body">
        <view class="y-axis"><text v-for="v in [5,4,3,2,1]" :key="v" class="y-label">{{ v }}</text></view>
        <view class="bars-area">
          <view v-for="day in chartData" :key="day.date" class="bar-group">
            <view class="bars">
              <view v-for="dim in dimensions" :key="dim.key" class="bar" :style="{ height: (day.dimensions[dim.key] || 0) * 28 + 'rpx', backgroundColor: dim.color }" />
            </view>
            <text class="date-label">{{ formatDate(day.date) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({ records: { type: Array, default: () => [] } })
const dimensions = [
  { key: 'sleep', label: '睡眠', color: '#4A90D9' }, { key: 'mood', label: '情绪', color: '#E8985E' },
  { key: 'body', label: '身体', color: '#6BAF7A' }, { key: 'motivation', label: '动力', color: '#D46B6B' },
  { key: 'cognition', label: '思维', color: '#9B8EC4' }, { key: 'social', label: '社交', color: '#E8C95A' }
]
const chartData = computed(() => {
  const today = new Date(); const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const record = (props.records as any[]).find((r: any) => r.date === dateStr)
    days.push({ date: dateStr, dimensions: record?.dimensions || {} })
  }
  return days
})
function formatDate(dateStr: string) { const d = new Date(dateStr); return `${d.getMonth() + 1}/${d.getDate()}` }
</script>
<style lang="scss" scoped>
.chart-container { margin: 32rpx 0; }
.chart-title { font-size: 32rpx; font-weight: 600; margin-bottom: 16rpx; }
.chart-scroll { white-space: nowrap; }
.chart-body { display: flex; min-width: 100%; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between; height: 140rpx; padding-right: 16rpx; margin-right: 8rpx; }
.y-label { font-size: 20rpx; color: #9B9B9B; text-align: right; }
.bars-area { flex: 1; display: flex; justify-content: space-around; }
.bar-group { display: flex; flex-direction: column; align-items: center; min-width: 60rpx; }
.bars { display: flex; align-items: flex-end; gap: 4rpx; height: 140rpx; }
.bar { width: 12rpx; border-radius: 6rpx; transition: height 0.5s ease; min-height: 4rpx; }
.date-label { font-size: 20rpx; color: #9B9B9B; margin-top: 8rpx; white-space: nowrap; }
</style>
