<template>
  <view class="cbt-page">
    <!-- 列表视图 -->
    <view v-if="view === 'list'" class="list-view">
      <view class="header">
        <text class="title">心理干预课程 📖</text>
        <text class="subtitle">CBT · MBCT · WRAP · ACT 循证课程体系</text>
      </view>
      <view class="content">
        <view v-for="group in groupedCourses" :key="group.tier" class="tier-group">
          <view class="tier-header" @tap="toggleTier(group.tier)">
            <view class="tier-indicator" :style="{ background: group.color }" />
            <view class="tier-info">
              <text class="tier-title">{{ group.title }}</text>
              <text class="tier-desc">{{ group.desc }}</text>
            </view>
            <text class="tier-count">{{ getGroupCompletedCount(group) }}/{{ group.courses.length }}</text>
            <text :class="['tier-arrow', collapsedTiers[group.tier] ? 'tier-arrow-collapsed' : '']">▾</text>
          </view>
          <template v-if="!collapsedTiers[group.tier]">
            <view v-for="course in group.courses" :key="course.id"
              :class="['course-card', isCourseLocked(course) ? 'locked' : '']"
              @tap="openCourse(course)">
              <view class="card-header">
                <text class="card-icon">{{ isCourseLocked(course) ? '🔒' : course.icon }}</text>
                <view class="card-info">
                  <text class="card-title">{{ course.title }}</text>
                  <text class="card-tag" :style="{ background: group.color + '20', color: group.color }">{{ course.tag }}</text>
                </view>
              </view>
              <text class="card-desc">{{ isCourseLocked(course) ? '完成前置课程后解锁' : course.desc }}</text>
              <text v-if="isCourseCompleted(course)" class="completed-badge">✅ 已完成</text>
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: isCourseCompleted(course) ? '100%' : '0%', background: group.color }" />
              </view>
            </view>
          </template>
        </view>
      </view>
    </view>

    <!-- 学习视图 -->
    <view v-else class="learn-view">
      <view class="learn-header">
        <text class="back-btn" @tap="backToList">← 返回</text>
        <text class="learn-title">{{ currentCourse?.title }}</text>
      </view>
      <view class="learn-content">
        <view class="step-dots">
          <view v-for="(_, i) in currentCourse?.steps" :key="i"
            :class="['dot', i === currentStep ? 'dot-active' : '', i < currentStep ? 'dot-done' : '']" />
        </view>
        <view class="step-content">
          <text class="step-type">{{ currentStepData?.type }}</text>
          <text class="step-title">{{ currentStepData?.title }}</text>
          <GuidedPlayer v-if="currentStepData?.guided" :guided="currentStepData.guided" />
          <view v-else class="step-body">
            <text v-for="(line, i) in bodyLines" :key="i" class="body-line">{{ line }}</text>
          </view>
        </view>
        <view class="step-nav">
          <view :class="['nav-btn', 'prev-btn']" @tap="prevStep" :style="{ opacity: currentStep === 0 ? 0.3 : 1 }">
            <text>← 上一步</text>
          </view>
          <view class="nav-btn next-btn" @tap="nextStep">
            <text>{{ currentStep === (currentCourse?.steps.length || 0) - 1 ? '✅ 完成课程' : '下一步 →' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { cbtCourses, tierInfo } from '@/data/cbtContent'
import GuidedPlayer from '@/components/guided-player/guided-player.vue'

const store = useStore()
const progress = computed(() => store.state.cbt?.progress || {})
const collapsedTiers = reactive<Record<number, boolean>>({})
const view = ref<'list' | 'learn'>('list')
const currentCourseIdx = ref<number | null>(null)
const currentStep = ref(0)

const groupedCourses = computed(() => {
  return tierInfo.map(tier => ({
    ...tier,
    courses: cbtCourses.filter((c: any) => c.tier === tier.tier)
  }))
})

const currentCourse = computed(() => currentCourseIdx.value !== null ? cbtCourses[currentCourseIdx.value] : null)
const currentStepData = computed(() => currentCourse.value?.steps[currentStep.value])
const bodyLines = computed(() => currentStepData.value?.body?.split('\n') || [])

function toggleTier(tier: number) {
  collapsedTiers[tier] = !collapsedTiers[tier]
}

function isCourseCompleted(course: any): boolean {
  return !!progress.value[course.id]
}

function isCourseLocked(course: any): boolean {
  if (!course.prerequisites?.length) return false
  return course.prerequisites.some((preId: number) => !progress.value[preId])
}

function getGroupCompletedCount(group: any): number {
  return group.courses.filter((c: any) => progress.value[c.id]).length
}

function openCourse(course: any) {
  if (isCourseLocked(course)) {
    uni.showToast({ title: '🔒 请先完成前面的课程', icon: 'none' })
    return
  }
  const idx = cbtCourses.findIndex((c: any) => c.id === course.id)
  if (idx === -1) return
  currentCourseIdx.value = idx
  currentStep.value = 0
  view.value = 'learn'
}

function backToList() {
  view.value = 'list'
  currentCourseIdx.value = null
  currentStep.value = 0
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function nextStep() {
  if (!currentCourse.value) return
  if (currentStep.value < currentCourse.value.steps.length - 1) {
    currentStep.value++
  } else {
    store.commit('cbt/COMPLETE_COURSE', currentCourse.value.id)
    uni.showToast({ title: '🎉 恭喜完成课程！', icon: 'success' })
    setTimeout(() => backToList(), 1500)
  }
}
</script>

<style lang="scss" scoped>
.cbt-page { min-height: 100vh; background: #F8F6F2; }

/* ── 列表视图 ── */
.list-view .header { padding: 48rpx 32rpx 32rpx; }
.title { font-size: 48rpx; font-weight: 700; display: block; }
.subtitle { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.content { padding: 0 32rpx; }

/* tier 分组 */
.tier-group { margin-bottom: 48rpx; }
.tier-header {
  display: flex; align-items: center; gap: 16rpx;
  margin-bottom: 16rpx; padding: 0 4rpx;
}
.tier-indicator { width: 8rpx; height: 64rpx; border-radius: 4rpx; flex-shrink: 0; }
.tier-info { flex: 1; }
.tier-title { font-size: 32rpx; font-weight: 700; display: block; }
.tier-desc { font-size: 24rpx; color: #6B6B6B; margin-top: 4rpx; display: block; }
.tier-count { margin-left: auto; font-size: 24rpx; color: #9B9B9B; font-weight: 600; flex-shrink: 0; }
.tier-arrow { font-size: 36rpx; color: #6B6B6B; transition: transform 0.2s; flex-shrink: 0; margin-left: 8rpx; }
.tier-arrow-collapsed { transform: rotate(-90deg); }

/* 课程卡片 */
.course-card {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 24rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
  margin-bottom: 16rpx;
}
.course-card:active { box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08); }
.locked { opacity: 0.5; }
.card-header { display: flex; align-items: center; gap: 16rpx; }
.card-icon { font-size: 48rpx; flex-shrink: 0; }
.card-info { display: flex; align-items: center; gap: 16rpx; flex: 1; min-width: 0; }
.card-title { font-size: 30rpx; font-weight: 600; }
.card-tag {
  font-size: 20rpx; font-weight: 700; padding: 4rpx 12rpx;
  border-radius: 8rpx; flex-shrink: 0;
}
.card-desc { font-size: 24rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.completed-badge { font-size: 24rpx; color: #6BAF7A; margin-top: 8rpx; display: block; font-weight: 500; }
.progress-bar { height: 8rpx; background: #E5E2DC; border-radius: 4rpx; margin-top: 16rpx; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 4rpx; transition: width 0.5s ease; }

/* ── 学习视图 ── */
.learn-view { min-height: 100vh; }
.learn-header { padding: 32rpx; }
.back-btn { background: none; color: #4A90D9; font-size: 28rpx; font-weight: 500; display: block; margin-bottom: 16rpx; padding: 0; }
.learn-title { font-size: 48rpx; font-weight: 700; display: block; }
.learn-content { padding: 0 32rpx; padding-bottom: 120rpx; }

/* 步骤指示点 */
.step-dots { display: flex; justify-content: center; gap: 16rpx; margin: 24rpx 0; }
.dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: #E5E2DC; transition: all 0.3s; }
.dot-active { background: #4A90D9; transform: scale(1.3); }
.dot-done { background: #6BAF7A; }

/* 步骤内容 */
.step-content {
  background: #FFFFFF; border-radius: 20rpx;
  padding: 48rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); min-height: 300rpx;
}
.step-type { font-size: 22rpx; font-weight: 600; text-transform: uppercase; color: #9B9B9B; margin-bottom: 16rpx; display: block; }
.step-title { font-size: 36rpx; font-weight: 700; margin-bottom: 24rpx; display: block; }
.step-body { font-size: 28rpx; color: #6B6B6B; line-height: 1.7; }
.body-line { margin-bottom: 16rpx; display: block; }

/* 步骤导航 */
.step-nav { display: flex; justify-content: space-between; margin-top: 48rpx; }
.nav-btn { padding: 20rpx 40rpx; border-radius: 16rpx; font-size: 26rpx; font-weight: 600; display: flex; align-items: center; }
.prev-btn { background: transparent; color: #4A90D9; border: 3rpx solid #4A90D9; }
.next-btn { background: #4A90D9; color: #FFFFFF; border: none; }
</style>
