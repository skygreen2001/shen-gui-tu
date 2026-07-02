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
      <!-- 重置按钮 -->
      <view class="reset-btn" @tap="showResetConfirm = true">
        <text>🗑️ 重置所有数据（仅开发环境）</text>
      </view>
      <view v-if="showResetConfirm" class="reset-overlay" @tap.self="showResetConfirm = false">
        <view class="reset-dialog">
          <text class="reset-dialog-title">重置所有数据</text>
          <text class="reset-dialog-msg">确定要清除所有用户数据吗？包括签到记录、用药记录、副作用追踪等，此操作不可撤销。</text>
          <view class="reset-dialog-actions">
            <text class="reset-cancel" @tap="showResetConfirm = false">取消</text>
            <text class="reset-confirm" @tap="handleReset">确认重置</text>
          </view>
        </view>
      </view>
    </view>
    <CrisisButton :visible="true" />
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
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

// 重置功能（仅开发环境）
const isDev = process.env.NODE_ENV === 'development'
const showResetConfirm = ref(false)

function handleReset() {
  showResetConfirm.value = false
  try {
    const res = uni.getStorageInfoSync()
    res.keys.filter((k: string) => k.startsWith('sgt-')).forEach((k: string) => {
      uni.removeStorageSync(k)
    })
  } catch (e) {}
  uni.showToast({ title: '数据已重置', icon: 'success' })
  setTimeout(() => { uni.reLaunch({ url: '/pages/welcome/welcome' }) }, 1000)
}
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

/* ── 重置按钮（仅开发环境） ── */
.reset-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 24rpx; margin-top: 48rpx;
  background: transparent; color: #9B9B9B;
  border: 2rpx dashed #E5E2DC; border-radius: 24rpx;
  font-size: 24rpx;
}
.reset-btn:active { transform: scale(0.96); }
.reset-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999;
}
.reset-dialog {
  width: 600rpx; background: #FFFFFF; border-radius: 24rpx; padding: 40rpx;
}
.reset-dialog-title { font-size: 32rpx; font-weight: 600; display: block; color: #2D2D2D; margin-bottom: 16rpx; }
.reset-dialog-msg { font-size: 26rpx; color: #6B6B6B; line-height: 1.6; display: block; margin-bottom: 32rpx; }
.reset-dialog-actions { display: flex; justify-content: flex-end; gap: 24rpx; }
.reset-cancel { font-size: 28rpx; color: #9B9B9B; padding: 16rpx 24rpx; }
.reset-confirm { font-size: 28rpx; color: #D46B6B; font-weight: 600; padding: 16rpx 24rpx; }
</style>
