<template>
  <view class="medication-page">
    <view class="header">
      <text class="title">💊 用药管理</text>
      <text class="subtitle">坚持用药是康复的重要保障</text>
    </view>
    <!-- 依从率概览 -->
    <view class="overview">
      <view class="ov-card">
        <text class="ov-value" :style="{ color: adherenceColor }">{{ adherenceRate }}%</text>
        <text class="ov-label">30日依从率</text>
      </view>
      <view class="ov-card">
        <text class="ov-value" style="color:#6BAF7A">{{ streakDays }}</text>
        <text class="ov-label">连续服药天数</text>
      </view>
    </view>
    <!-- 今日药物列表 -->
    <view class="section">
      <text class="section-title">今日药物</text>
      <view v-for="med in medications" :key="med.id" class="med-card">
        <view class="med-info">
          <text class="med-name">{{ med.name }}</text>
          <text class="med-dose">{{ med.dose }}</text>
          <text class="med-time">{{ med.time }}</text>
        </view>
        <view class="med-actions">
          <view v-if="med.status === 'taken'" class="action-btn taken"><text>✅ 已服</text></view>
          <view v-else-if="med.status === 'skipped'" class="action-btn skipped"><text>⏭️ 跳过</text></view>
          <view v-else class="action-row">
            <view class="action-btn take" @tap="takeMed(med.id)"><text>服药</text></view>
            <view class="action-btn skip" @tap="skipMed(med.id)"><text>跳过</text></view>
          </view>
        </view>
      </view>
    </view>
    <!-- 添加药物 -->
    <view class="section">
      <view class="add-toggle-btn" @tap="showAddForm = !showAddForm"><text>+ 添加药物</text></view>
      <view v-if="showAddForm" class="add-form">
        <input v-model="newMed.name" class="form-input" placeholder="药物名称" />
        <input v-model="newMed.dose" class="form-input" placeholder="剂量（如 10mg）" />
        <input v-model="newMed.time" class="form-input" placeholder="服药时间（如 早上8点）" />
        <view class="add-btn" @tap="addMed"><text>+ 确认添加</text></view>
      </view>
    </view>
    <!-- 辅助功能入口 -->
    <view class="section">
      <text class="section-title">辅助工具</text>
      <view class="tool-list">
        <view class="tool-item" @tap="goTool('med-knowledge')">
          <text class="tool-icon">📖</text>
          <view class="tool-text"><text class="tool-name">药物知识库</text><text class="tool-desc">了解药物信息</text></view>
          <text class="tool-arrow">→</text>
        </view>
        <view class="tool-item" @tap="goTool('side-effect-tracker')">
          <text class="tool-icon">📋</text>
          <view class="tool-text"><text class="tool-name">副作用追踪</text><text class="tool-desc">记录副作用</text></view>
          <text class="tool-arrow">→</text>
        </view>
        <view class="tool-item" @tap="goTool('mood-correlation')">
          <text class="tool-icon">📈</text>
          <view class="tool-text"><text class="tool-name">情绪关联分析</text><text class="tool-desc">查看趋势</text></view>
          <text class="tool-arrow">→</text>
        </view>
        <view class="tool-item" @tap="goTool('taper-navigator')">
          <text class="tool-icon">🎯</text>
          <view class="tool-text"><text class="tool-name">减药导航</text><text class="tool-desc">安全减药指引</text></view>
          <text class="tool-arrow">→</text>
        </view>
      </view>
    </view>
    <view class="tip">
      <text>💡 用药期间如出现严重不适，请立即联系医生。不要自行调整药物剂量。</text>
    </view>
    <CrisisButton :visible="true" />
  </view>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'

const store = useStore()
const adherenceRate = computed(() => store.getters['medication/adherenceRate'](30) || 0)
const streakDays = computed(() => store.getters['medication/streakDays'] || 0)
const adherenceColor = computed(() => {
  const rate = adherenceRate.value
  if (rate >= 80) return '#6BAF7A'
  if (rate >= 50) return '#E8985E'
  return '#D46B6B'
})

const medications = reactive([
  { id: '1', name: '草酸艾司西酞普兰', dose: '10mg', time: '早上 8:00', status: 'pending' as const },
  { id: '2', name: '喹硫平', dose: '25mg', time: '晚上 9:00', status: 'pending' as const },
])

const newMed = reactive({ name: '', dose: '', time: '' })
const showAddForm = ref(false)

function takeMed(id: string) {
  const med = medications.find(m => m.id === id)
  if (med) med.status = 'taken'
  store.dispatch('medication/recordDose', { name: med?.name, taken: true })
  uni.showToast({ title: '已记录服药', icon: 'success' })
}

function skipMed(id: string) {
  const med = medications.find(m => m.id === id)
  if (med) med.status = 'skipped'
  store.dispatch('medication/recordDose', { name: med?.name, taken: false })
}

function addMed() {
  if (!newMed.name || !newMed.dose) {
    uni.showToast({ title: '请填写药物名称和剂量', icon: 'none' })
    return
  }
  medications.push({
    id: Date.now().toString(),
    name: newMed.name,
    dose: newMed.dose,
    time: newMed.time || '未设定',
    status: 'pending',
  })
  newMed.name = ''
  newMed.dose = ''
  newMed.time = ''
  uni.showToast({ title: '药物已添加', icon: 'success' })
}

function goTool(name: string) {
  uni.navigateTo({ url: `/pages/medication/${name}` })
}
</script>
<style lang="scss" scoped>
.medication-page { padding: 32rpx; padding-bottom: 180rpx; background: #F8F6F2; min-height: 100vh; }
.header { margin-bottom: 32rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.overview { display: flex; gap: 16rpx; margin-bottom: 32rpx; }
.ov-card { flex: 1; background: #FFFFFF; border-radius: 20rpx; padding: 24rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.ov-value { font-size: 56rpx; font-weight: 700; display: block; }
.ov-label { font-size: 24rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.section { margin-bottom: 32rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #2D2D2D; display: block; margin-bottom: 16rpx; }
.med-card { background: #FFFFFF; border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.med-info { flex: 1; }
.med-name { font-size: 30rpx; font-weight: 600; display: block; }
.med-dose { font-size: 26rpx; color: #4A90D9; display: block; margin-top: 4rpx; }
.med-time { font-size: 24rpx; color: #9B9B9B; margin-top: 4rpx; display: block; }
.med-actions { flex-shrink: 0; }
.action-row { display: flex; gap: 12rpx; }
.action-btn { padding: 20rpx; border-radius: 16rpx; font-size: 26rpx; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center; }
.take { background: #4A90D9; color: white; }
.skip { background: transparent; color: #4A90D9; border: 3rpx solid #4A90D9; }
.taken { background: #EDF5EF; color: #6BAF7A; }
.skipped { background: #FFF0E0; color: #E8985E; }
.add-form { background: #FFFFFF; border-radius: 20rpx; padding: 24rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.form-input { background: #F8F6F2; border-radius: 12rpx; padding: 20rpx; font-size: 28rpx; margin-bottom: 16rpx; width: 100%; box-sizing: border-box; }
.add-btn { background: #4A90D9; color: #fff; border-radius: 16rpx; padding: 20rpx; text-align: center; font-size: 28rpx; font-weight: 600; margin-top: 8rpx; }
.tool-list { display: flex; flex-direction: column; gap: 16rpx; }
.tool-item { background: #FFFFFF; border-radius: 20rpx; padding: 24rpx; display: flex; align-items: center; gap: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.tool-icon { font-size: 40rpx; }
.tool-text { flex: 1; }
.tool-name { font-size: 28rpx; font-weight: 600; display: block; }
.tool-desc { font-size: 24rpx; color: #9B9B9B; margin-top: 4rpx; display: block; }
.tool-arrow { font-size: 28rpx; color: #9B9B9B; }
.add-toggle-btn { border: 3rpx dashed #A8C8E8; background: transparent; color: #4A90D9; border-radius: 24rpx; text-align: center; font-size: 28rpx; font-weight: 500; padding: 24rpx; }
.tip { background: #EBF3FB; border-radius: 16rpx; padding: 24rpx; font-size: 26rpx; color: #3A7BBF; line-height: 1.5; margin-top: 32rpx; }
</style>
