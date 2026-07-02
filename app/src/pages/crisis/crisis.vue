<template>
  <view class="crisis-page">
    <!-- 返回首页按钮 -->
    <view class="back-bar">
      <text class="back-link" @tap="goBack">← 返回首页</text>
    </view>

    <!-- 英雄区域 -->
    <view class="hero">
      <text class="hero-title">你不是一个人 🤝</text>
      <text class="hero-sub">无论何时，都有人愿意倾听和帮助你</text>
    </view>

    <!-- 紧急热线按钮 -->
    <view class="actions">
      <view class="primary-btn" @tap="callHotline('962525')">
        <text>📞 立即拨打 962525</text>
      </view>
      <view class="secondary-btn" @tap="callHotline('4001619995')">
        <text>📞 全国热线 400-161-9995</text>
      </view>
    </view>

    <!-- 其他渠道 -->
    <view class="channels">
      <view class="channel-item" @tap="callHotline('120')"><text>🏥 </text><text class="channel-link" @tap="callHotline('120')">急救电话 120</text></view>
      <view class="channel-item"><text>💬 </text><text class="channel-link" @tap="callHotline('4001619995')">希望24热线</text></view>
      <view class="channel-item"><text>📱 </text><text class="channel-link" @tap="callHotline('12345')">市民服务热线 12345</text></view>
      <view class="channel-item"><text>🏫 </text><text class="channel-link" @tap="callHotline('962525')">学校心理中心</text></view>
    </view>

    <!-- 4-7-8 呼吸练习 -->
    <view class="breathe-card">
      <text class="breathe-title">🌬️ 4-7-8 呼吸练习</text>
      <text class="breathe-sub">一个简单有效的放松技巧</text>
      <view class="breathe-circle-area">
        <view :class="['breathe-circle', breathePhase === 'inhale' ? 'circle-inhale' : breathePhase === 'hold' ? 'circle-hold' : breathePhase === 'exhale' ? 'circle-exhale' : '']">
          <text class="breathe-phase-text">{{ breatheText }}</text>
          <text class="breathe-count">{{ breatheCount }}</text>
        </view>
      </view>
      <view class="breathe-controls">
        <view v-if="!isBreathing" class="breathe-btn" @tap="startBreathing"><text>开始练习</text></view>
        <view v-else class="breathe-btn" @tap="stopBreathing"><text>停止</text></view>
      </view>
      <view class="breathe-info">
        <text class="breathe-step">吸气 4 秒 → 屏息 7 秒 → 呼气 8 秒</text>
        <text class="breathe-hint">建议重复 3-4 个循环</text>
      </view>
      <view class="cycle-count" v-if="completedCycles > 0">
        <text>已完成 {{ completedCycles }} 个循环</text>
      </view>
    </view>

    <!-- 安全小贴士 -->
    <view class="tips-card">
      <text class="safety-title">🛡️ 安全小贴士</text>
      <view class="tips-list">
        <text class="safety-item">1. 深呼吸：缓慢吸气，再缓缓呼出，重复几次</text>
        <text class="safety-item">2. 感受当下：双脚踩在地面上，注意脚底的感觉</text>
        <text class="safety-item">3. 找人倾诉：联系你信任的人，告诉他们你的感受</text>
        <text class="safety-item">4. 去安全的地方：回家或找一个安静的角落待一会儿</text>
      </view>
    </view>

    <!-- 底部空白区域 -->
    <view style="height: 300rpx;"></view>
  </view>
</template>
<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

// 呼吸练习状态
const isBreathing = ref(false)
const breathePhase = ref<'inhale' | 'hold' | 'exhale' | 'ready'>('ready')
const breatheText = ref('准备好了')
const breatheCount = ref(0)
const completedCycles = ref(0)
let breatheTimer: ReturnType<typeof setTimeout> | null = null
let countTimer: ReturnType<typeof setInterval> | null = null

function startBreathing() {
  isBreathing.value = true
  completedCycles.value = 0
  runCycle()
}

function runCycle() {
  if (!isBreathing.value) return
  // 吸气 4秒
  breathePhase.value = 'inhale'
  breatheText.value = '吸气'
  breatheCount.value = 4
  countDown(4, () => {
    if (!isBreathing.value) return
    // 屏息 7秒
    breathePhase.value = 'hold'
    breatheText.value = '屏息'
    breatheCount.value = 7
    countDown(7, () => {
      if (!isBreathing.value) return
      // 呼气 8秒
      breathePhase.value = 'exhale'
      breatheText.value = '呼气'
      breatheCount.value = 8
      countDown(8, () => {
        completedCycles.value++
        if (isBreathing.value) {
          breathePhase.value = 'ready'
          breatheText.value = '准备下一轮'
          breatheCount.value = 0
          breatheTimer = setTimeout(runCycle, 2000)
        }
      })
    })
  })
}

function countDown(total: number, callback: () => void) {
  breatheCount.value = total
  let count = total
  countTimer = setInterval(() => {
    count--
    if (count <= 0) {
      if (countTimer) clearInterval(countTimer)
      callback()
    } else {
      breatheCount.value = count
    }
  }, 1000)
}

function stopBreathing() {
  isBreathing.value = false
  breathePhase.value = 'ready'
  breatheText.value = '准备好了'
  breatheCount.value = 0
  if (breatheTimer) { clearTimeout(breatheTimer); breatheTimer = null }
  if (countTimer) { clearInterval(countTimer); countTimer = null }
}

onUnmounted(() => { stopBreathing() })

function goBack() {
  uni.switchTab({ url: '/pages/dashboard/dashboard' })
}

function callHotline(phone: string) { uni.makePhoneCall({ phoneNumber: phone }) }
</script>
<style lang="scss" scoped>
.crisis-page { min-height: 100vh; background: #F8F6F2; }

.back-bar { padding: 48rpx 32rpx 0; }
.back-link { font-size: 28rpx; color: #4A90D9; font-weight: 500; }

.hero { text-align: center; padding: 48rpx 32rpx 40rpx; }
.hero-title { font-size: 56rpx; font-weight: 700; line-height: 1.3; display: block; }
.hero-sub { font-size: 28rpx; color: #6B6B6B; margin-top: 16rpx; display: block; }

.actions { padding: 0 32rpx; display: flex; flex-direction: column; gap: 16rpx; margin-bottom: 40rpx; }
.primary-btn { display: flex; align-items: center; justify-content: center; padding: 32rpx; background: #4A90D9; color: white; border-radius: 32rpx; font-size: 36rpx; font-weight: 700; box-shadow: 0 8rpx 32rpx rgba(74,144,217,0.3); }
.primary-btn:active { transform: scale(0.96); }
.secondary-btn { display: flex; align-items: center; justify-content: center; padding: 28rpx; background: transparent; color: #4A90D9; border: 3rpx solid #4A90D9; border-radius: 32rpx; font-size: 30rpx; font-weight: 600; }
.secondary-btn:active { transform: scale(0.96); }

.channels { padding: 0 32rpx; margin-bottom: 40rpx; }
.channel-item { display: flex; align-items: center; gap: 12rpx; padding: 12rpx 0; font-size: 28rpx; }
.channel-link { color: #4A90D9; font-weight: 500; }

.breathe-card { background: #F5F0E8; border-radius: 24rpx; padding: 40rpx; text-align: center; margin: 0 32rpx 40rpx; }
.breathe-title { font-size: 32rpx; font-weight: 700; display: block; }
.breathe-sub { font-size: 26rpx; color: #6B6B6B; margin-top: 4rpx; display: block; }
.breathe-circle-area { padding: 64rpx 0; display: flex; justify-content: center; }
.breathe-circle { width: 240rpx; height: 240rpx; border-radius: 50%; background: #E8F1FB; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 1s ease-in-out; }
.circle-inhale, .circle-hold { transform: scale(1.3); background: #4A90D9; }
.circle-exhale { transform: scale(1); background: #d6e8f7; }
.breathe-phase-text, .breathe-count { color: white; }
.breathe-controls { margin-top: 16rpx; }
.breathe-btn { padding: 20rpx 48rpx; border-radius: 999rpx; border: 3rpx solid #4A90D9; background: transparent; color: #4A90D9; font-size: 28rpx; font-weight: 600; display: inline-block; }
.breathe-info { margin-top: 24rpx; }
.breathe-step { font-size: 26rpx; color: #6B6B6B; display: block; }
.breathe-hint { font-size: 24rpx; color: #9B9B9B; margin-top: 8rpx; display: block; }
.cycle-count { margin-top: 16rpx; font-size: 26rpx; color: #6BAF7A; font-weight: 600; }

.tips-card { background: #FFFFFF; border-radius: 20rpx; padding: 32rpx; margin: 0 32rpx 32rpx; }
.safety-title { font-size: 30rpx; font-weight: 600; margin-bottom: 16rpx; display: block; }
.safety-item { font-size: 26rpx; color: #6B6B6B; padding: 8rpx 0 8rpx 32rpx; position: relative; display: block; }
</style>
