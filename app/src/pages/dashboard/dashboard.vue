<template>
  <view class="dashboard">
    <view class="header"><text class="title">你好 👋</text><text class="subtitle">今天感觉怎么样？</text></view>
    <view class="content">
      <RiskGauge :score="riskInfo.score" :level="riskInfo.level" :label="riskInfo.label" />
      <view class="checkin-btn" :class="{ checked: hasCheckedToday }" @tap="goCheckIn">
        <text>{{ hasCheckedToday ? '✅ 今日已签到（点击查看）' : '📋 开始今日签到' }}</text>
      </view>
      <view class="stats">
        <view class="stat-card"><text class="stat-value" style="color:#6BAF7A">{{ streakDays }}</text><text class="stat-label">打卡天数</text></view>
        <view class="stat-card" @tap="goMedication"><text class="stat-value" style="color:#4A90D9">{{ adherenceRate }}%</text><text class="stat-label">用药率</text></view>
        <view class="stat-card"><text class="stat-value" style="color:#E8985E">{{ recentRecords.length }}</text><text class="stat-label">本周记录</text></view>
      </view>
      <view class="trend-section">
        <text class="trend-title">近7天趋势</text>
        <TrendChart :records="recentRecords" />
      </view>
      <view v-if="riskInfo.level === 'red'" class="risk-banner">
        <text>⚠️ 您的状态评分偏低，建议联系医生或拨打 </text>
        <text class="risk-link" @tap="callHotline">962525</text>
      </view>
      <view class="wrap-entry" @tap="goWrap">
        <text class="wrap-icon">📝</text>
        <view class="wrap-text">
          <text class="wrap-title">WRAP 个人危机预防计划</text>
          <text class="wrap-desc">制定你的个人康复行动计划，包含每日维护、预警信号、应对策略等</text>
        </view>
        <text class="wrap-arrow">→</text>
      </view>
    </view>
    <CrisisButton :visible="true" />
  </view>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import RiskGauge from '@/components/risk-gauge/risk-gauge.vue'
import TrendChart from '@/components/trend-chart/trend-chart.vue'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'
import { useRiskLevel } from '@/composables/use-risk-level'
import { useCheckIn } from '@/composables/use-checkin'

const store = useStore()
const { riskInfo, recentRecords } = useRiskLevel()
const { hasCheckedToday, streakDays } = useCheckIn()
const adherenceRate = computed(() => store.getters['medication/adherenceRate'](30))

function goCheckIn() { uni.navigateTo({ url: '/pages/checkin/checkin' }) }
function goMedication() { uni.switchTab({ url: '/pages/medication/medication' }) }
function goWrap() { uni.navigateTo({ url: '/pages/wrap-plan/wrap-plan' }) }
function callHotline() { uni.makePhoneCall({ phoneNumber: '962525' }) }
</script>
<style lang="scss" scoped>
.dashboard { padding: 32rpx; padding-bottom: 180rpx; }
.header { margin-bottom: 32rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 30rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.checkin-btn { background: #4A90D9; border-radius: 24rpx; padding: 28rpx; box-shadow: 0 4rpx 16rpx rgba(74,144,217,0.2); margin: 16rpx 0 32rpx; text-align: center; font-size: 30rpx; font-weight: 600; color: #FFFFFF; }
.checkin-btn.checked { background: #FFFFFF; color: #6BAF7A; border: 3rpx solid #6BAF7A; box-shadow: none; }
.stats { display: flex; gap: 16rpx; margin-bottom: 32rpx; }
.stat-card { flex: 1; background: #FFFFFF; border-radius: 24rpx; padding: 24rpx 16rpx; text-align: center; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.06); }
.stat-value { font-size: 48rpx; font-weight: 700; display: block; }
.stat-label { font-size: 24rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.risk-banner { background: #FDECEC; border-radius: 20rpx; padding: 24rpx; margin-bottom: 32rpx; font-size: 28rpx; color: #D46B6B; line-height: 1.6; }
.risk-link { font-weight: 700; text-decoration: underline; }
.wrap-entry { background: #F5F0E8; border-radius: 24rpx; padding: 28rpx 32rpx; display: flex; align-items: center; gap: 20rpx; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.06); margin-top: 32rpx; }
.wrap-icon { font-size: 48rpx; }
.wrap-text { flex: 1; }
.wrap-title { font-size: 30rpx; font-weight: 600; display: block; }
.wrap-desc { font-size: 24rpx; color: #9B9B9B; margin-top: 4rpx; display: block; }
.wrap-arrow { font-size: 32rpx; color: #9B9B9B; }
.trend-section { margin-bottom: 32rpx; }
.trend-title { font-size: 32rpx; font-weight: 600; display: block; margin-bottom: 16rpx; color: #2D2D2D; }
</style>
