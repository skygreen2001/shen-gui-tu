<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-content">
      <view class="header">
        <text class="title">📊 副作用追踪</text>
        <text class="subtitle">记录和评估药物副作用，帮助医生调整方案</text>
      </view>
      <!-- 记录表单 -->
      <view class="form-card">
        <text class="form-title">记录今天的副作用</text>
        <view class="form-group">
          <text class="form-label">药物名称</text>
          <picker :range="medNames" @change="onMedChange">
            <view class="picker-btn"><text>{{ selectedMed || '选择药物' }}</text></view>
          </picker>
        </view>
        <view class="form-group">
          <text class="form-label">副作用类型</text>
          <view class="tag-list">
            <text v-for="se in sideEffectOptions" :key="se"
              :class="['tag', selectedSE === se ? 'tag-active' : '']"
              @tap="selectedSE = selectedSE === se ? '' : se">{{ se }}</text>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">严重程度（{{ severityRating }}/10）</text>
          <view class="rating-row">
            <view v-for="n in 10" :key="n" :class="['rating-btn', severityRating >= n ? 'rating-active' : '']" @tap="severityRating = n"><text>{{ n }}</text></view>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">补充说明（选填）</text>
          <textarea v-model="note" class="note-input" placeholder="描述副作用的持续时间、频率等" :maxlength="300" />
        </view>
        <view :class="['submit-btn', canSubmit ? 'submit-active' : '']" @tap="handleSubmit">
          <text>提交记录</text>
        </view>
      </view>
      <!-- 历史记录 -->
      <view class="history-section">
        <text class="form-title">历史记录</text>
        <view v-if="history.length === 0" class="empty-state">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无记录，开始追踪副作用吧</text>
        </view>
        <view v-for="(record, idx) in history" :key="idx" class="history-card">
          <view class="history-header">
            <text class="history-med">{{ record.med }}</text>
            <text class="history-date">{{ record.date }}</text>
          </view>
          <view class="history-body">
            <text class="history-se">{{ record.sideEffect }} - 严重度 {{ record.severity }}/10</text>
            <text v-if="record.note" class="history-note">{{ record.note }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'

const medNames = ['草酸艾司西酞普兰', '喹硫平', '舍曲林', '文拉法辛', '米氮平']
const sideEffectOptions = ['恶心', '头痛', '嗜睡', '失眠', '口干', '体重增加', '性功能障碍', '头晕', '焦虑加重', '其他']

const selectedMed = ref('')
const selectedSE = ref('')
const severityRating = ref(0)
const note = ref('')
const history = ref<Array<{ med: string; sideEffect: string; severity: number; note: string; date: string }>>([])

const canSubmit = computed(() => selectedMed.value && selectedSE.value && severityRating.value > 0)

function onMedChange(e: any) { selectedMed.value = medNames[e.detail.value] }

function handleSubmit() {
  if (!canSubmit.value) return
  const now = new Date()
  const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  history.value.unshift({
    med: selectedMed.value,
    sideEffect: selectedSE.value,
    severity: severityRating.value,
    note: note.value,
    date: dateStr,
  })
  selectedSE.value = ''
  severityRating.value = 0
  note.value = ''
  uni.showToast({ title: '记录成功', icon: 'success' })
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: #F8F6F2; }
.scroll-content { padding: 32rpx; padding-bottom: 60rpx; }
.header { margin-bottom: 32rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.form-card { background: #FFFFFF; border-radius: 20rpx; padding: 32rpx; margin-bottom: 32rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.form-title { font-size: 32rpx; font-weight: 600; color: #2D2D2D; display: block; margin-bottom: 24rpx; }
.form-group { margin-bottom: 28rpx; }
.form-label { font-size: 28rpx; font-weight: 500; color: #4A4A4A; display: block; margin-bottom: 12rpx; }
.picker-btn { background: #F0EDE7; border-radius: 16rpx; padding: 20rpx 24rpx; font-size: 28rpx; color: #6B6B6B; }
.tag-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag { font-size: 24rpx; padding: 12rpx 20rpx; border-radius: 16rpx; background: #F0EDE7; color: #6B6B6B; }
.tag-active { background: #E8F1FB; color: #4A90D9; }
.rating-row { display: flex; gap: 12rpx; flex-wrap: wrap; }
.rating-btn { width: 56rpx; height: 56rpx; border-radius: 12rpx; background: #F0EDE7; display: flex; align-items: center; justify-content: center; font-size: 24rpx; color: #6B6B6B; }
.rating-active { background: #E8985E; color: #fff; }
.note-input { width: 100%; min-height: 120rpx; padding: 20rpx; background: #F8F6F2; border-radius: 16rpx; font-size: 28rpx; box-sizing: border-box; }
.submit-btn { background: #F0EDE7; color: #9B9B9B; border-radius: 9999rpx; padding: 24rpx 0; text-align: center; font-size: 30rpx; font-weight: 600; }
.submit-active { background: #4A90D9; color: #fff; }
.history-section { margin-top: 16rpx; }
.empty-state { text-align: center; padding: 64rpx 0; }
.empty-icon { font-size: 64rpx; display: block; margin-bottom: 16rpx; }
.empty-text { font-size: 28rpx; color: #9B9B9B; }
.history-card { background: #FFFFFF; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.history-med { font-size: 28rpx; font-weight: 600; color: #2D2D2D; }
.history-date { font-size: 22rpx; color: #9B9B9B; }
.history-se { font-size: 26rpx; color: #4A4A4A; display: block; }
.history-note { font-size: 24rpx; color: #9B9B9B; margin-top: 8rpx; display: block; }
</style>
