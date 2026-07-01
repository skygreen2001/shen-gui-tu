<template>
  <view class="checkin-page">
    <view class="header"><text class="title">每日签到 📋</text><text class="subtitle">{{ view === 'form' ? (editing ? '修改今日签到内容' : '花1分钟了解自己的状态') : '' }}</text></view>
    <!-- 已签到状态 -->
    <view v-if="view === 'done'" class="done-card">
      <text class="done-icon">✅</text>
      <text class="done-title">今日已签到</text>
      <text class="done-desc">你今天已经完成了签到，可以修改或明天继续加油！</text>
      <view class="edit-btn" @tap="startEdit"><text>修改今日签到</text></view>
    </view>
    <!-- 提交成功 -->
    <view v-else-if="view === 'success'" class="done-card">
      <text class="done-icon">🎉</text>
      <text class="done-title">{{ editing ? '修改成功！' : '签到完成！' }}</text>
      <text class="done-desc">{{ encouragement }}</text>
    </view>
    <!-- 签到表单 -->
    <view v-else class="form-area">
      <view v-for="dim in dimensions" :key="dim.key" class="dim-group">
        <text class="dim-label">{{ dim.icon }} {{ dim.label }}</text>
        <view class="rating-row">
          <view v-for="n in 5" :key="n" :class="['rating-btn', ratings[dim.key] === n ? 'rating-active' : '']" @tap="setRating(dim.key, n)"><text>{{ n }}</text></view>
        </view>
        <view class="rating-labels"><text class="label-left">{{ dim.left }}</text><text class="label-right">{{ dim.right }}</text></view>
      </view>
      <view class="note-area">
        <textarea v-model="note" class="note-input" placeholder="今天有什么想记录的吗？（选填）" :maxlength="200" />
      </view>
      <view :class="['submit-btn', allRated ? 'submit-active' : '']" @tap="handleSubmit">
        <text>{{ editing ? '保存修改' : '提交签到' }}</text>
      </view>
    </view>
    <CrisisButton :visible="true" />
  </view>
</template>
<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'
import { useCheckIn } from '@/composables/use-checkin'

const { hasCheckedToday, todayRecord, submitCheckIn } = useCheckIn()

const dimensions = [
  { key: 'sleep', label: '睡眠质量', icon: '😴', left: '很差', right: '很好' },
  { key: 'mood', label: '情绪状态', icon: '😊', left: '低落', right: '愉悦' },
  { key: 'body', label: '身体活力', icon: '🏃', left: '疲惫', right: '充沛' },
  { key: 'motivation', label: '动力水平', icon: '🎯', left: '无', right: '强烈' },
  { key: 'cognition', label: '思维清晰度', icon: '🧠', left: '模糊', right: '清晰' },
  { key: 'social', label: '社交意愿', icon: '👥', left: '回避', right: '主动' },
]

const encouragements = ['✅ 签到成功！记录是康复的第一步 💪', '🌟 很好！你正在了解自己', '🌱 每一天的记录都是成长的种子', '💪 你做得很好，继续保持！', '🌈 感谢你花时间关注自己']
const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]

const ratings = reactive<Record<string, number>>({})
const note = ref('')
const editing = ref(false)
const view = ref<'done' | 'form' | 'success'>('form')
const allRated = computed(() => dimensions.every(d => ratings[d.key]))

watch(hasCheckedToday, (val) => {
  if (val && !editing.value && view.value !== 'success') view.value = 'done'
}, { immediate: true })

function setRating(key: string, val: number) { ratings[key] = val }
function startEdit() {
  editing.value = true; view.value = 'form'
  if (todayRecord.value) {
    Object.keys(todayRecord.value.dimensions).forEach(k => { ratings[k] = todayRecord.value.dimensions[k] })
    note.value = todayRecord.value.note || ''
  }
}
function handleSubmit() {
  if (!allRated.value) return
  submitCheckIn({ ...ratings }, note.value)
  view.value = 'success'
}
</script>
<style lang="scss" scoped>
.checkin-page { padding: 32rpx; padding-bottom: 180rpx; }
.header { margin-bottom: 32rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 30rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.done-card { background: #FFFFFF; border-radius: 32rpx; padding: 64rpx 48rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); margin-top: 32rpx; }
.done-icon { font-size: 120rpx; display: block; margin-bottom: 32rpx; }
.done-title { font-size: 44rpx; font-weight: 600; display: block; }
.done-desc { font-size: 30rpx; color: #6B6B6B; margin-top: 16rpx; display: block; }
.edit-btn { margin-top: 48rpx; background: #4A90D9; color: white; border-radius: 16rpx; padding: 20rpx 48rpx; display: inline-block; font-size: 28rpx; font-weight: 600; }
.dim-group { margin-bottom: 40rpx; }
.dim-label { font-size: 32rpx; font-weight: 600; margin-bottom: 16rpx; display: block; }
.rating-row { display: flex; gap: 20rpx; }
.rating-btn { width: 72rpx; height: 72rpx; border-radius: 50%; border: 4rpx solid #E5E2DC; background: #FFFFFF; font-size: 24rpx; font-weight: 600; color: #9B9B9B; display: flex; align-items: center; justify-content: center; }
.rating-active { border-color: #4A90D9; background: #4A90D9; color: white; }
.rating-labels { display: flex; justify-content: space-between; margin-top: 8rpx; }
.label-left, .label-right { font-size: 22rpx; color: #9B9B9B; }
.note-area { margin-bottom: 32rpx; }
.note-input { width: 100%; min-height: 160rpx; padding: 24rpx; border: 3rpx solid #E5E2DC; border-radius: 16rpx; font-size: 28rpx; box-sizing: border-box; background: #FFFFFF; }
.submit-btn { background: #F0EDE7; color: #9B9B9B; border-radius: 24rpx; padding: 28rpx 0; text-align: center; font-size: 30rpx; font-weight: 600; }
.submit-active { background: #4A90D9; color: #fff; }
</style>
