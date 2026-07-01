<template>
  <view v-if="visible" class="crisis-btn" @tap="goToCrisis" hover-class="crisis-btn-hover">
    <text class="crisis-icon">🆘</text>
  </view>
</template>
<script setup lang="ts">
defineProps({ visible: { type: Boolean, default: true } })
function goToCrisis() { uni.navigateTo({ url: '/pages/crisis/crisis' }) }
</script>
<style lang="scss" scoped>
.crisis-btn { position: fixed; right: 30rpx; bottom: 200rpx; width: 100rpx; height: 100rpx; border-radius: 50%; background: #D46B6B; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 40rpx rgba(212,107,107,0.3); z-index: 100; animation: crisisPulse 2s ease-in-out infinite; }
.crisis-icon { font-size: 48rpx; }
.crisis-btn-hover { transform: scale(0.9); opacity: 0.9; }
@keyframes crisisPulse { 0%, 100% { box-shadow: 0 4rpx 20rpx rgba(212,107,107,0.3); } 50% { box-shadow: 0 4rpx 40rpx rgba(212,107,107,0.6); } }
</style>
