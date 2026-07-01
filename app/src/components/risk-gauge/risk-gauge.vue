<template>
  <view class="gauge-container">
    <canvas canvas-id="riskGauge" :style="{ width: '220rpx', height: '220rpx' }" id="riskGauge" />
    <view class="gauge-center">
      <text class="gauge-score">{{ displayScore }}</text>
      <text class="gauge-label">{{ label }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
const props = defineProps({ score: { type: Number, default: 0 }, level: { type: String, default: 'unknown' }, label: { type: String, default: '暂无数据' } })
const displayScore = ref(0)
const levelColors: Record<string, string> = { green: '#6BAF7A', yellow: '#E8C95A', orange: '#E8985E', red: '#D46B6B', unknown: '#E5E2DC' }
function drawGauge(score: number) {
  const ctx = uni.createCanvasContext('riskGauge')
  const cx = 55, cy = 55, radius = Math.max(1, 42), lineWidth = 5
  const fgColor = levelColors[props.level] || levelColors.unknown
  const progress = Math.min(Math.max(score, 0), 100) / 100
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, 2 * Math.PI); ctx.setStrokeStyle('#F0EDE7'); ctx.setLineWidth(lineWidth); ctx.setLineCap('round'); ctx.stroke()
  if (progress > 0) {
    const startAngle = -Math.PI / 2; const endAngle = startAngle + 2 * Math.PI * progress
    ctx.beginPath(); ctx.arc(cx, cy, radius, startAngle, endAngle); ctx.setStrokeStyle(fgColor); ctx.setLineWidth(lineWidth); ctx.setLineCap('round'); ctx.stroke()
  }
  ctx.draw()
}
function animateScore(target: number) {
  if (target === 0) { displayScore.value = 0; return }
  const step = Math.max(1, Math.ceil(target / 30))
  const interval = setInterval(() => { displayScore.value = Math.min(displayScore.value + step, target); if (displayScore.value >= target) clearInterval(interval) }, 30)
}
onMounted(() => { setTimeout(() => drawGauge(props.score), 200); animateScore(props.score) })
watch(() => props.score, (newVal) => { displayScore.value = 0; setTimeout(() => drawGauge(newVal), 200); animateScore(newVal) })
</script>
<style lang="scss" scoped>
.gauge-container { position: relative; display: flex; align-items: center; justify-content: center; margin: 32rpx auto; }
.gauge-center { position: absolute; display: flex; flex-direction: column; align-items: center; }
.gauge-score { font-size: 56rpx; font-weight: 700; color: #2D2D2D; }
.gauge-label { font-size: 24rpx; color: #6B6B6B; margin-top: 4rpx; }
</style>
