<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-content">
      <view class="header">
        <text class="title">💊 药物知识库</text>
        <text class="subtitle">了解你正在服用的药物</text>
      </view>
      <view class="disclaimer-banner">
        <text class="disclaimer-text">⚠️ 以下信息仅供科普参考，不替代医生的专业建议。用药调整请务必咨询主治医生。</text>
      </view>
      <view v-for="(info, name) in medDatabase" :key="name" class="med-card">
        <view class="med-card-header" @tap="toggleExpand(name)">
          <text class="med-name">{{ name }}</text>
          <text class="med-category">{{ info.category }}</text>
          <text class="expand-arrow">{{ expanded[name] ? '▲' : '▼' }}</text>
        </view>
        <view v-if="expanded[name]" class="med-card-body">
          <view class="med-section">
            <text class="section-label">🎯 作用机制</text>
            <text class="section-text">{{ info.mechanism }}</text>
          </view>
          <view class="med-section">
            <text class="section-label">⏰ 起效时间</text>
            <text class="section-text">{{ info.onsetTime }}</text>
          </view>
          <view class="med-section">
            <text class="section-label">📋 常见副作用</text>
            <view class="tag-list">
              <text v-for="se in info.sideEffects" :key="se" class="tag tag-warning">{{ se }}</text>
            </view>
          </view>
          <view class="med-section">
            <text class="section-label">💡 用药须知</text>
            <view v-for="(tip, i) in info.tips" :key="i" class="tip-item">
              <text class="tip-dot">•</text>
              <text class="tip-text">{{ tip }}</text>
            </view>
          </view>
          <view class="med-section">
            <text class="section-label">❓ 漏服建议</text>
            <text class="section-text">{{ info.missedDoseAdvice }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { medicationDB } from '@/data/medicationKnowledge'

const medDatabase = medicationDB
const expanded = reactive<Record<string, boolean>>({})

function toggleExpand(name: string) {
  expanded[name] = !expanded[name]
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: #F8F6F2; }
.scroll-content { padding: 32rpx; padding-bottom: 60rpx; }
.header { margin-bottom: 32rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.disclaimer-banner { background: #FFF8E1; border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 32rpx; border-left: 6rpx solid #E8985E; }
.disclaimer-text { font-size: 24rpx; color: #8B6914; line-height: 1.6; }
.med-card { background: #FFFFFF; border-radius: 20rpx; margin-bottom: 24rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.med-card-header { padding: 28rpx 32rpx; display: flex; align-items: center; }
.med-name { font-size: 32rpx; font-weight: 600; color: #2D2D2D; flex: 1; }
.med-category { font-size: 22rpx; color: #9B9B9B; margin-right: 16rpx; max-width: 200rpx; }
.expand-arrow { font-size: 24rpx; color: #9B9B9B; }
.med-card-body { padding: 0 32rpx 28rpx; border-top: 1rpx solid #F0EDE7; }
.med-section { margin-top: 24rpx; }
.section-label { font-size: 28rpx; font-weight: 600; color: #4A90D9; display: block; margin-bottom: 8rpx; }
.section-text { font-size: 26rpx; color: #4A4A4A; line-height: 1.6; }
.tag-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.tag { font-size: 22rpx; padding: 8rpx 16rpx; border-radius: 12rpx; }
.tag-warning { background: #FFF0E0; color: #E8985E; }
.tip-item { display: flex; gap: 8rpx; margin-top: 8rpx; }
.tip-dot { font-size: 26rpx; color: #4A90D9; }
.tip-text { font-size: 26rpx; color: #4A4A4A; line-height: 1.5; flex: 1; }
</style>
