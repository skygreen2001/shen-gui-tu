<template>
  <view class="welcome-page">
    <view class="brand-area">
      <view class="brand-name">申归途</view>
      <view class="brand-sub">抑郁症复发预防支持工具</view>
    </view>
    <view class="features">
      <view class="feature-card">
        <text class="feature-icon">📋</text>
        <text class="feature-title">每日追踪</text>
        <text class="feature-desc">6维度签到</text>
      </view>
      <view class="feature-card">
        <text class="feature-icon">💊</text>
        <text class="feature-title">用药提醒</text>
        <text class="feature-desc">智能管理</text>
      </view>
      <view class="feature-card">
        <text class="feature-icon">🛡️</text>
        <text class="feature-title">危机守护</text>
        <text class="feature-desc">一键求助</text>
      </view>
    </view>
    <view class="divider"><text>数据支撑</text></view>
    <view class="stats">
      <view class="stat-card"><text class="stat-num">50%</text><text class="stat-label">复发率</text></view>
      <view class="stat-card"><text class="stat-num">2年</text><text class="stat-label">高发期</text></view>
      <view class="stat-card"><text class="stat-num">85%</text><text class="stat-label">可预防</text></view>
    </view>
    <view class="cta" @tap="enterApp"><text class="cta-text">开始使用</text></view>
    <view class="disclaimer">
      <text>本工具仅作为辅助支持，不替代专业医疗建议</text>
      <text class="hotline-link" @tap="callHotline">如需帮助请拨打心理热线 962525</text>
    </view>
  </view>
</template>
<script setup lang="ts">
function enterApp() { uni.switchTab({ url: '/pages/dashboard/dashboard' }) }
function callHotline() { uni.makePhoneCall({ phoneNumber: '962525' }) }
</script>
<style lang="scss" scoped>
.welcome-page { min-height: 100vh; background: linear-gradient(180deg, #d6e8f7 0%, #F8F6F2 100%); padding: 64rpx 48rpx; display: flex; flex-direction: column; align-items: center; }
.brand-area { text-align: center; margin-bottom: 96rpx; margin-top: 96rpx; }
.brand-name { font-size: 64rpx; font-weight: 700; color: #2D2D2D; display: block; letter-spacing: 8rpx; }
.brand-sub { font-size: 32rpx; color: #6B6B6B; margin-top: 16rpx; display: block; }
.features { display: flex; gap: 24rpx; margin-bottom: 64rpx; width: 100%; }
.feature-card { flex: 1; background: #FFFFFF; border-radius: 24rpx; padding: 32rpx 16rpx; text-align: center; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06); }
.feature-icon { font-size: 64rpx; display: block; margin-bottom: 12rpx; }
.feature-title { font-size: 28rpx; font-weight: 600; color: #2D2D2D; display: block; }
.feature-desc { font-size: 24rpx; color: #9B9B9B; margin-top: 4rpx; display: block; }
.divider { display: flex; align-items: center; width: 100%; margin-bottom: 48rpx; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1rpx; background: #E5E2DC; }
.divider text { padding: 0 24rpx; font-size: 24rpx; color: #9B9B9B; }
.stats { display: flex; gap: 48rpx; margin-bottom: 96rpx; }
.stat-card { text-align: center; }
.stat-num { font-size: 48rpx; font-weight: 700; color: #4A90D9; display: block; }
.stat-label { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.cta { background: #E8985E; border-radius: 24rpx; padding: 28rpx 0; width: 480rpx; text-align: center; margin-bottom: 64rpx; box-shadow: 0 8rpx 24rpx rgba(232,152,94,0.3); }
.cta:active { opacity: 0.9; transform: scale(0.98); }
.cta-text { font-size: 36rpx; font-weight: 600; color: #fff; }
.disclaimer { text-align: center; border-top: 1rpx solid #E5E2DC; padding-top: 24rpx; margin-top: 16rpx; }
.disclaimer text { font-size: 24rpx; color: #9B9B9B; display: block; }
.hotline-link { color: #D46B6B; margin-top: 8rpx; }
</style>
