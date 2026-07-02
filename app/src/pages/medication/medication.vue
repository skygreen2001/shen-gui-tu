<template>
  <view class="medication-page">
    <view class="header">
      <text class="title">用药管理 💊</text>
      <text class="subtitle">坚持用药是康复的重要保障</text>
    </view>
    <view class="content">
      <!-- 依从率圆形仪表盘（与 Web 版一致） -->
      <view class="adherence">
        <view class="adherence-circle" :style="{ background: adherenceColor }">
          <text class="adherence-pct">{{ adherenceRate }}%</text>
        </view>
        <text class="adherence-label">本月用药依从率</text>
      </view>
      <!-- 连续服药卡片 -->
      <view v-if="streakDays > 0" class="streak-card">
        <text class="streak-icon">🔥</text>
        <text class="streak-text">连续服药 <text class="streak-num">{{ streakDays }}</text> 天</text>
      </view>
      <!-- 今日药物列表（与 Web 版一致：卡片纵向布局 + 📖 按钮 + emoji 按钮） -->
      <view v-for="med in medications" :key="med.id" class="med-card">
        <view class="med-card-top">
          <view class="med-card-info">
            <text class="med-name">{{ med.name }}</text>
            <text class="med-dose">{{ med.dose }} · {{ med.frequency }}</text>
            <text class="med-time">{{ med.time }}</text>
          </view>
          <view class="info-btn" @tap="openKnowledge(med.name)">
            <text>📖</text>
          </view>
        </view>
        <view class="med-actions">
          <view v-if="med.status === 'taken'" class="take-btn taken" @tap="takeMed(med.id)">
            <text>✅ 已服用</text>
          </view>
          <view v-else class="take-btn" @tap="takeMed(med.id)">
            <text>💊 服药</text>
          </view>
          <view v-if="med.status === 'skipped'" class="skip-btn skipped" @tap="skipMed(med.id)">
            <text>⏭️ 已跳过</text>
          </view>
          <view v-else class="skip-btn" @tap="skipMed(med.id)">
            <text>⏭️ 跳过</text>
          </view>
        </view>
      </view>
      <!-- 添加药物（折叠式，与 Web 版一致） -->
      <view class="add-btn" @tap="showAdd = !showAdd">
        <text>{{ showAdd ? '取消' : '+ 添加药物' }}</text>
      </view>
      <view v-if="showAdd" class="add-form">
        <input v-model="newMed.name" class="form-input" placeholder="药物名称" />
        <input v-model="newMed.dose" class="form-input" placeholder="剂量（如 10mg）" />
        <view class="confirm-btn" @tap="addMed"><text>确认添加</text></view>
      </view>
      <!-- 辅助功能入口（与 Web 版一致的 auxEntry 列表） -->
      <view class="aux-entry" @tap="goTool('side-effect-tracker')">
        <text class="aux-icon">📋</text>
        <view class="aux-text">
          <text class="aux-title">副作用周报</text>
          <text class="aux-desc">每周记录药物副作用，追踪身体变化</text>
        </view>
        <text class="aux-arrow">→</text>
      </view>
      <view class="aux-entry" @tap="goTool('mood-correlation')">
        <text class="aux-icon">📈</text>
        <view class="aux-text">
          <text class="aux-title">药物-情绪联动</text>
          <text class="aux-desc">查看用药与情绪的关联趋势</text>
        </view>
        <text class="aux-arrow">→</text>
      </view>
      <view class="aux-entry" @tap="goTool('taper-navigator')">
        <text class="aux-icon">🎯</text>
        <view class="aux-text">
          <text class="aux-title">减药导航</text>
          <text class="aux-desc">在医生指导下安全渐进减药</text>
        </view>
        <text class="aux-arrow">→</text>
      </view>
      <!-- 温馨提示 -->
      <view class="tip">
        <text>💡 温馨提示：即使感觉好转，也请遵医嘱继续服药。突然停药可能导致不适。如有疑问，请咨询您的主治医生。</text>
      </view>
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
  { id: '1', name: '草酸艾司西酞普兰', dose: '10mg', frequency: '每日一次', time: '早餐后 ⏰', status: 'pending' as const },
  { id: '2', name: '喹硫平', dose: '25mg', frequency: '每晚一次', time: '睡前 🌙', status: 'pending' as const },
])

const newMed = reactive({ name: '', dose: '' })
const showAdd = ref(false)

function takeMed(id: string) {
  const med = medications.find(m => m.id === id)
  if (med) med.status = 'taken'
  store.dispatch('medication/recordDose', { name: med?.name, taken: true })
  uni.showToast({ title: '🎉 太棒了！坚持就是胜利', icon: 'none' })
}

function skipMed(id: string) {
  const med = medications.find(m => m.id === id)
  if (med) med.status = 'skipped'
  store.dispatch('medication/recordDose', { name: med?.name, taken: false })
  uni.showToast({ title: '💛 偶尔忘记很正常，明天继续', icon: 'none' })
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
    frequency: '每日一次',
    time: '自行安排',
    status: 'pending',
  })
  newMed.name = ''
  newMed.dose = ''
  showAdd.value = false
  uni.showToast({ title: '药物已添加', icon: 'success' })
}

function openKnowledge(name: string) {
  uni.navigateTo({ url: `/pages/medication/med-knowledge?name=${encodeURIComponent(name)}` })
}

function goTool(name: string) {
  uni.navigateTo({ url: `/pages/medication/${name}` })
}
</script>
<style lang="scss" scoped>
/* 与 Web 版 Medication.module.css 一一对应 */
.medication-page { padding-bottom: 180rpx; background: #F8F6F2; min-height: 100vh; }
.header { padding: 32rpx 32rpx 16rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.content { padding: 0 32rpx; }

/* ── 依从率圆形仪表盘 ── */
.adherence { text-align: center; padding: 40rpx 0; }
.adherence-circle {
  width: 240rpx; height: 240rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24rpx;
}
.adherence-pct { font-size: 56rpx; font-weight: 700; color: #FFFFFF; }
.adherence-label { font-size: 26rpx; color: #6B6B6B; }

/* ── 连续服药 ── */
.streak-card {
  display: flex; align-items: center; justify-content: center; gap: 16rpx;
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  border-radius: 20rpx; padding: 16rpx 32rpx; margin-bottom: 32rpx;
}
.streak-icon { font-size: 40rpx; }
.streak-text { font-size: 28rpx; color: #E65100; }
.streak-num { font-weight: 700; }

/* ── 药物卡片 ── */
.med-card {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 28rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); margin-bottom: 24rpx;
}
.med-card-top {
  display: flex; align-items: flex-start; justify-content: space-between;
}
.med-card-info { flex: 1; }
.med-name { font-size: 30rpx; font-weight: 600; display: block; }
.med-dose { font-size: 24rpx; color: #6B6B6B; margin-top: 4rpx; display: block; }
.med-time { font-size: 24rpx; color: #9B9B9B; margin-top: 8rpx; display: block; }
.info-btn {
  background: none; font-size: 40rpx; padding: 0;
  display: flex; align-items: center;
}
.med-actions { display: flex; gap: 16rpx; margin-top: 20rpx; }

/* ── 按钮（与 Web 版一致：方形圆角 + emoji） ── */
.take-btn {
  flex: 1; padding: 16rpx 20rpx; background: #4A90D9; color: white;
  border: none; border-radius: 16rpx; font-size: 26rpx; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.take-btn.taken { background: #6BAF7A; }
.skip-btn {
  flex: 1; padding: 16rpx 20rpx; background: transparent; color: #4A90D9;
  border: 3rpx solid #4A90D9; border-radius: 16rpx; font-size: 26rpx; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.skip-btn.skipped { background: #E8985E; color: white; border-color: #E8985E; }

/* ── 添加药物（折叠式，与 Web 版一致） ── */
.add-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 24rpx; background: transparent;
  color: #4A90D9; border: 3rpx dashed #A8CCE8;
  border-radius: 20rpx; font-size: 28rpx; font-weight: 500;
  margin-bottom: 24rpx;
}
.add-form {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 24rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  margin-bottom: 24rpx; display: flex; flex-direction: column; gap: 16rpx;
}
.form-input {
  width: 100%; padding: 20rpx 24rpx;
  border: 3rpx solid #E5E2DC; border-radius: 16rpx;
  font-size: 28rpx; background: #FFFFFF;
}
.confirm-btn {
  padding: 20rpx; background: #4A90D9; color: white;
  border: none; border-radius: 16rpx; font-size: 28rpx; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}

/* ── 辅助功能入口（与 Web 版 auxEntry 一致） ── */
.aux-entry {
  display: flex; align-items: center; gap: 20rpx;
  background: #FFFFFF; border-radius: 20rpx;
  padding: 24rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  margin-bottom: 16rpx;
}
.aux-icon { font-size: 48rpx; }
.aux-text { flex: 1; }
.aux-title { font-size: 30rpx; font-weight: 600; display: block; }
.aux-desc { font-size: 24rpx; color: #6B6B6B; margin-top: 4rpx; display: block; }
.aux-arrow { font-size: 32rpx; color: #9B9B9B; }

/* ── 温馨提示 ── */
.tip {
  background: #EBF3FB; border-radius: 20rpx;
  padding: 24rpx; font-size: 26rpx; color: #3A7BBF;
  line-height: 1.6; margin-top: 24rpx;
}
</style>
