<template>
  <view class="player">
    <!-- 动画区域（与 Web 版一致） -->
    <view class="animation-area">
      <!-- 呼吸练习 -->
      <view v-if="type === 'breathing'" class="breath-container">
        <view :class="['breath-circle', playing ? 'breath-active' : '']" />
        <view class="breath-label">
          <text>{{ breathLabelText }}</text>
        </view>
      </view>
      <!-- 身体扫描 -->
      <view v-if="type === 'bodyScan'" class="body-scan-container">
        <view class="body-outline">
          <view v-for="(part, i) in bodyParts" :key="part"
            :class="['body-part', i <= currentIdx && playing ? 'body-part-active' : '']">
            <text>{{ part }}</text>
          </view>
        </view>
      </view>
      <!-- 冥想 -->
      <view v-if="type === 'meditation'" class="meditation-container">
        <view :class="['meditation-circle', playing ? 'meditation-pulse' : '']" />
        <view class="meditation-label">
          <text>{{ meditationLabelText }}</text>
        </view>
      </view>
    </view>

    <!-- 进度条 -->
    <view class="progress-track">
      <view class="progress-fill" :style="{ width: progress + '%' }" />
    </view>

    <!-- 当前段落文字 -->
    <view class="segment-text">
      <text>{{ finished ? '练习结束。你做得很棒！' : (currentSeg?.text || '') }}</text>
    </view>

    <!-- 段落指示点（可点击跳转） -->
    <view class="segment-dots">
      <view v-for="(_, i) in segments" :key="i"
        :class="['seg-dot', i === currentIdx && playing ? 'seg-dot-active' : '', i < currentIdx || finished ? 'seg-dot-done' : '']"
        @tap="jumpTo(i)" />
    </view>

    <!-- 计时器 -->
    <view class="timer-row">
      <text>{{ formatTime(elapsed) }}</text>
      <text>{{ formatTime(totalDuration) }}</text>
    </view>

    <!-- 控制按钮（与 Web 版一致：方形圆角） -->
    <view class="controls">
      <view v-if="!playing && !paused" class="play-btn" @tap="handlePlay">
        <text>▶ {{ finished ? '重新播放' : '开始引导' }}</text>
      </view>
      <template v-if="playing">
        <view class="skip-btn" @tap="skipToNext"><text>⏭ 跳过</text></view>
        <view class="pause-btn" @tap="handlePause"><text>⏸ 暂停</text></view>
      </template>
      <view v-if="paused" class="play-btn" @tap="handlePlay"><text>▶ 继续</text></view>
      <view v-if="playing || paused" class="stop-btn" @tap="handleStop"><text>⏹ 结束</text></view>
    </view>

    <!-- 音频提示 -->
    <view v-if="!hasAudio" class="notice">
      <text>音频文件暂未生成，请跟随文字自行练习</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  guided: { type: Object, required: true }
})

const { type, segments } = props.guided
const playing = ref(false)
const paused = ref(false)
const finished = ref(false)
const currentIdx = ref(0)
const countdown = ref(0)

let timerRef: any = null
let countdownRef: any = null
let innerAudio: any = null

const currentSeg = computed(() => segments[currentIdx.value])
const totalDuration = computed(() => segments.reduce((s: number, seg: any) => s + seg.duration, 0))
const elapsed = computed(() => {
  const past = segments.slice(0, currentIdx.value).reduce((s: number, seg: any) => s + seg.duration, 0)
  return past + (currentSeg.value ? currentSeg.value.duration - countdown.value * 1000 : 0)
})
const progress = computed(() => totalDuration.value > 0 ? Math.min(100, (elapsed.value / totalDuration.value) * 100) : 0)
const hasAudio = computed(() => segments.some((s: any) => s.audio))
const bodyParts = computed(() => segments.filter((s: any) => s.part).map((s: any) => s.part))

const breathLabelText = computed(() => {
  if (!playing.value && !finished.value) return '准备开始'
  if (finished.value) return ''
  const phase = currentSeg.value?.phase
  if (phase === 'observe') return '觉察当下'
  if (phase === 'breathe') return '聚焦呼吸'
  if (phase === 'expand') return '扩展觉察'
  return ''
})

const meditationLabelText = computed(() => {
  if (!playing.value && !finished.value) return '准备开始'
  if (finished.value) return '练习结束 🌱'
  return '正在引导...'
})

function stopTimers() {
  clearTimeout(timerRef)
  clearInterval(countdownRef)
  timerRef = null
  countdownRef = null
}

function stopAudio() {
  if (innerAudio) {
    try { innerAudio.stop() } catch (e) {}
    try { innerAudio.destroy() } catch (e) {}
    innerAudio = null
  }
}

function playSegAudio(seg: any) {
  stopAudio()
  if (!seg.audio) return
  innerAudio = uni.createInnerAudioContext()
  const audioPath = seg.audio.startsWith('/') ? '/static' + seg.audio : seg.audio
  innerAudio.src = audioPath
  innerAudio.onError(() => { console.warn('音频播放失败:', audioPath) })
  innerAudio.play()
}

function runSegment(idx: number) {
  if (idx >= segments.length) {
    finished.value = true
    playing.value = false
    stopAudio()
    return
  }
  currentIdx.value = idx
  finished.value = false
  const seg = segments[idx]
  countdown.value = Math.ceil(seg.duration / 1000)
  playSegAudio(seg)

  let remaining = Math.ceil(seg.duration / 1000)
  countdownRef = setInterval(() => {
    remaining--
    if (remaining <= 0) clearInterval(countdownRef)
    countdown.value = Math.max(0, remaining)
  }, 1000)

  timerRef = setTimeout(() => {
    clearInterval(countdownRef)
    runSegment(idx + 1)
  }, seg.duration)
}

function handlePlay() {
  stopTimers()
  if (finished.value) {
    finished.value = false
    currentIdx.value = 0
    playing.value = true
    paused.value = false
    runSegment(0)
    return
  }
  if (paused.value) {
    paused.value = false
    playing.value = true
    const seg = segments[currentIdx.value]
    const rem = countdown.value * 1000
    let r2 = Math.ceil(rem / 1000)
    countdownRef = setInterval(() => {
      r2--
      if (r2 <= 0) clearInterval(countdownRef)
      countdown.value = Math.max(0, r2)
    }, 1000)
    timerRef = setTimeout(() => {
      clearInterval(countdownRef)
      runSegment(currentIdx.value + 1)
    }, rem)
    return
  }
  playing.value = true
  paused.value = false
  runSegment(0)
}

function handlePause() {
  stopTimers()
  stopAudio()
  paused.value = true
  playing.value = false
}

function handleStop() {
  stopTimers()
  stopAudio()
  playing.value = false
  paused.value = false
  finished.value = false
  currentIdx.value = 0
  countdown.value = 0
}

function skipToNext() {
  stopTimers()
  stopAudio()
  runSegment(currentIdx.value + 1)
}

function jumpTo(idx: number) {
  stopTimers()
  stopAudio()
  playing.value = true
  paused.value = false
  runSegment(idx)
}

function formatTime(ms: number) {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

onBeforeUnmount(() => { stopTimers(); stopAudio() })
</script>

<style lang="scss" scoped>
/* 与 Web 版 GuidedPlayer.module.css 一一对应 */

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  min-height: 420rpx;
}

/* ── 动画区域 ── */
.animation-area {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200rpx;
  margin-bottom: 24rpx;
}

/* 呼吸练习 */
.breath-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}
.breath-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: #d6e8f7;
  transition: transform 4s ease-in-out, background 2s;
}
.breath-active {
  transform: scale(1.3);
  background: #4A90D9;
}
.breath-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #6B6B6B;
}

/* 身体扫描 — flex-wrap 药丸按钮（与 Web 版一致） */
.body-scan-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  width: 100%;
  padding: 0 24rpx;
}
.body-outline {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
}
.body-part {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  background: #E5E2DC;
  color: #9B9B9B;
  transition: all 0.5s ease;
}
.body-part-active {
  background: #4A90D9;
  color: #FFFFFF;
  font-weight: 600;
}

/* 冥想 */
.meditation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}
.meditation-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: #d6e8f7;
}
.meditation-pulse {
  animation: medPulse 3s ease-in-out infinite;
}
@keyframes medPulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
.meditation-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #6B6B6B;
}

/* ── 进度条 ── */
.progress-track {
  width: 100%;
  height: 6rpx;
  background: #E5E2DC;
  border-radius: 3rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}
.progress-fill {
  height: 100%;
  background: #4A90D9;
  border-radius: 3rpx;
  transition: width 1s linear;
}

/* ── 段落文字 ── */
.segment-text {
  font-size: 28rpx;
  color: #6B6B6B;
  text-align: center;
  line-height: 1.6;
  padding: 0 16rpx;
  min-height: 60rpx;
  margin-bottom: 24rpx;
}

/* ── 段落指示点 ── */
.segment-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.seg-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #E5E2DC;
  transition: all 0.3s;
}
.seg-dot-active {
  background: #4A90D9;
  transform: scale(1.4);
}
.seg-dot-done {
  background: #6BAF7A;
}

/* ── 计时器 ── */
.timer-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 24rpx;
  color: #9B9B9B;
  margin-bottom: 24rpx;
  padding: 0 16rpx;
}

/* ── 控制按钮（与 Web 版一致：方形圆角） ── */
.controls {
  display: flex;
  gap: 16rpx;
  align-items: center;
}
.play-btn {
  padding: 20rpx 48rpx;
  border-radius: 16rpx;
  background: #4A90D9;
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 600;
}
.play-btn:active { opacity: 0.8; }
.pause-btn {
  padding: 20rpx 48rpx;
  border-radius: 16rpx;
  background: transparent;
  color: #4A90D9;
  border: 3rpx solid #4A90D9;
  font-size: 28rpx;
  font-weight: 600;
}
.stop-btn {
  padding: 20rpx 32rpx;
  border-radius: 16rpx;
  background: transparent;
  color: #B2BEC3;
  border: 2rpx solid #E8E4DE;
  font-size: 26rpx;
}
.skip-btn {
  padding: 20rpx 32rpx;
  border-radius: 16rpx;
  background: transparent;
  color: #4A90D9;
  border: 3rpx solid #4A90D9;
  font-size: 26rpx;
  font-weight: 500;
}

/* ── 音频提示 ── */
.notice {
  font-size: 24rpx;
  color: #E8985E;
  text-align: center;
  margin-top: 16rpx;
  padding: 0 16rpx;
}
</style>
