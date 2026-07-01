<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-content">
      <view class="header">
        <text class="title">📉 减药导航</text>
        <text class="subtitle">安全减药的步骤指引与须知</text>
      </view>
      <!-- 重要提示 -->
      <view class="warning-card">
        <text class="warning-title">⚠️ 重要提示</text>
        <text class="warning-text">减药必须在医生指导下进行，切勿自行减量或停药。突然停用抗抑郁药物可能导致撤药反应，包括头晕、恶心、焦虑加重、睡眠障碍等。</text>
      </view>
      <!-- 减药安全须知 -->
      <view class="section-card">
        <text class="section-title">🛡️ 减药安全须知</text>
        <view class="notice-list">
          <view class="notice-item" v-for="(notice, idx) in safetyNotices" :key="idx">
            <text class="notice-icon">{{ notice.icon }}</text>
            <text class="notice-text">{{ notice.text }}</text>
          </view>
        </view>
      </view>
      <!-- 减药步骤指引 -->
      <view class="section-card">
        <text class="section-title">📋 减药步骤指引</text>
        <view class="step-list">
          <view class="step-item" v-for="(step, idx) in taperSteps" :key="idx">
            <view class="step-num">{{ idx + 1 }}</view>
            <view class="step-content">
              <text class="step-title">{{ step.title }}</text>
              <text class="step-desc">{{ step.desc }}</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 撤药反应监测 -->
      <view class="section-card">
        <text class="section-title">🔍 撤药反应自我监测</text>
        <text class="section-subtitle">如果在减药过程中出现以下症状，请及时联系医生</text>
        <view class="symptom-list">
          <text v-for="sym in withdrawalSymptoms" :key="sym" class="symptom-tag">{{ sym }}</text>
        </view>
      </view>
      <!-- 减药日志 -->
      <view class="section-card">
        <text class="section-title">📝 减药日志</text>
        <textarea v-model="logContent" class="log-input" placeholder="记录今天的减药感受、症状变化等..." :maxlength="500" />
        <view class="log-btn" @tap="saveLog"><text>保存记录</text></view>
      </view>
      <!-- 紧急联系 -->
      <view class="contact-card">
        <text class="contact-text">如在减药过程中感到不适，请立即联系您的医生或拨打</text>
        <text class="contact-hotline" @tap="callDoctor">962525</text>
      </view>
    </scroll-view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const logContent = ref('')

const safetyNotices = [
  { icon: '👨‍⚕️', text: '必须在主治医生指导下减药，不要自行决定' },
  { icon: '🐢', text: '减药速度要慢，通常每2-4周减少一次剂量' },
  { icon: '📱', text: '每次调整后记录身体和情绪变化' },
  { icon: '❌', text: '不要同时减多种药物，一次只调整一种' },
  { icon: '⏰', text: '新剂量至少维持2周再考虑下一步' },
]

const taperSteps = [
  { title: '与医生充分沟通', desc: '告知医生你想减药的原因，讨论减药方案和预期时间线。' },
  { title: '确定减药计划', desc: '医生会根据你的情况制定逐步减药方案，明确每一步的剂量和时间。' },
  { title: '开始第一步减量', desc: '按照计划减少到新剂量，保持规律服药习惯。' },
  { title: '观察2-4周', desc: '密切观察身体和情绪变化，记录在减药日志中。' },
  { title: '评估与决策', desc: '与医生复诊，评估当前状态是否稳定，决定是否继续减量。' },
  { title: '逐步推进或回调', desc: '如果状态稳定，继续下一步；如果出现不适，可能需要回调剂量。' },
  { title: '完全停药后持续监测', desc: '停药后仍需定期复诊，持续监测至少3-6个月。' },
]

const withdrawalSymptoms = [
  '头晕', '恶心', '头痛', '焦虑加重', '情绪波动', '失眠',
  '嗜睡', '疲劳', '肌肉酸痛', '电击感', '烦躁', '情绪低落',
]

function saveLog() {
  if (!logContent.value.trim()) return
  uni.showToast({ title: '记录已保存', icon: 'success' })
  logContent.value = ''
}

function callDoctor() {
  uni.makePhoneCall({ phoneNumber: '962525' })
}
</script>
<style lang="scss" scoped>
.page { min-height: 100vh; background: #F8F6F2; }
.scroll-content { padding: 32rpx; padding-bottom: 60rpx; }
.header { margin-bottom: 32rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.warning-card { background: #FDECEC; border-radius: 20rpx; padding: 24rpx; margin-bottom: 32rpx; border-left: 6rpx solid #D46B6B; }
.warning-title { font-size: 28rpx; font-weight: 600; color: #D46B6B; display: block; margin-bottom: 8rpx; }
.warning-text { font-size: 26rpx; color: #8B4545; line-height: 1.6; }
.section-card { background: #FFFFFF; border-radius: 20rpx; padding: 32rpx; margin-bottom: 24rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.section-title { font-size: 32rpx; font-weight: 600; color: #2D2D2D; display: block; margin-bottom: 20rpx; }
.section-subtitle { font-size: 26rpx; color: #6B6B6B; margin-bottom: 16rpx; display: block; }
.notice-list { display: flex; flex-direction: column; gap: 16rpx; }
.notice-item { display: flex; gap: 12rpx; align-items: flex-start; }
.notice-icon { font-size: 28rpx; flex-shrink: 0; margin-top: 2rpx; }
.notice-text { font-size: 26rpx; color: #4A4A4A; line-height: 1.5; }
.step-list { display: flex; flex-direction: column; gap: 24rpx; }
.step-item { display: flex; gap: 16rpx; align-items: flex-start; }
.step-num { width: 48rpx; height: 48rpx; border-radius: 50%; background: #E8F1FB; color: #4A90D9; font-size: 24rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-content { flex: 1; }
.step-title { font-size: 28rpx; font-weight: 600; color: #2D2D2D; display: block; margin-bottom: 4rpx; }
.step-desc { font-size: 26rpx; color: #6B6B6B; line-height: 1.5; }
.symptom-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.symptom-tag { font-size: 24rpx; padding: 12rpx 20rpx; border-radius: 16rpx; background: #FFF0E0; color: #E8985E; }
.log-input { width: 100%; min-height: 160rpx; padding: 20rpx; background: #F8F6F2; border-radius: 16rpx; font-size: 28rpx; box-sizing: border-box; margin-bottom: 16rpx; }
.log-btn { background: #4A90D9; color: #fff; border-radius: 9999rpx; padding: 20rpx 0; text-align: center; font-size: 28rpx; font-weight: 600; }
.contact-card { background: #E8F1FB; border-radius: 20rpx; padding: 28rpx; text-align: center; }
.contact-text { font-size: 26rpx; color: #4A4A4A; display: block; margin-bottom: 8rpx; }
.contact-hotline { font-size: 36rpx; font-weight: 700; color: #4A90D9; }
</style>
