<template>
  <view class="resources-page">
    <!-- 头部 -->
    <view class="header">
      <text class="title">🏥 服务中心</text>
      <text class="subtitle">你并不孤单，这里有你需要的一切支持</text>
    </view>

    <!-- Tab 切换 -->
    <scroll-view scroll-x class="tab-scroll" :scroll-left="tabScrollLeft">
      <view class="tab-bar">
        <view v-for="(tab, idx) in tabs" :key="tab.key"
          :class="['tab-item', activeTab === tab.key ? 'tab-active' : '']"
          :style="{ borderColor: activeTab === tab.key ? tab.color : 'transparent' }"
          @tap="switchTab(tab.key, idx)">
          <text>{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Tab 内容 -->
    <scroll-view scroll-y class="content-scroll">

      <!-- ==================== 1. 医院Tab ==================== -->
      <view v-if="activeTab === 'hospitals'" class="tab-content">
        <!-- 区域筛选 -->
        <picker :range="areas" @change="onAreaChange" class="area-picker-wrap">
          <view class="area-picker">
            <text class="area-picker-text">📍 {{ selectedArea }}</text>
            <text class="area-picker-arrow">▼</text>
          </view>
        </picker>
        <!-- 医院列表 -->
        <view v-for="h in filteredHospitals" :key="h.id" class="info-card">
          <view class="card-header">
            <text class="card-icon">🏥</text>
            <view class="card-title-area">
              <text class="card-title">{{ h.name }}</text>
              <view class="card-meta">
                <text class="card-level" :class="h.level === '三甲' ? 'level-top' : 'level-second'">{{ h.level }}</text>
                <text v-if="h.hours" class="card-hours">{{ h.hours }}</text>
              </view>
            </view>
          </view>
          <view class="card-body">
            <text class="card-addr">📍 {{ h.address }}</text>
            <view v-if="h.tags && h.tags.length" class="card-tags">
              <text v-for="tag in h.tags" :key="tag" class="tag-item">{{ tag }}</text>
            </view>
            <text class="card-phone" @tap="callPhone(h.phone)">📞 {{ h.phone }}</text>
          </view>
        </view>
      </view>

      <!-- ==================== 2. 热线Tab ==================== -->
      <view v-else-if="activeTab === 'hotlines'" class="tab-content">
        <view v-for="h in hotlines" :key="h.id"
          :class="['info-card', h.featured ? 'featured-card' : '']">
          <view class="card-header">
            <text class="card-icon">{{ h.featured ? '🔴' : '📞' }}</text>
            <view class="card-title-area">
              <view class="card-title-row">
                <text class="card-title">{{ h.name }}</text>
                <text v-if="h.featured" class="featured-badge">免费</text>
              </view>
              <text class="card-sub">{{ h.hours }}</text>
            </view>
          </view>
          <view class="card-body">
            <text v-if="h.desc" class="card-desc">{{ h.desc }}</text>
            <text class="card-phone" @tap="callPhone(h.number)">📞 {{ h.number }}</text>
          </view>
        </view>
      </view>

      <!-- ==================== 3. 社区Tab ==================== -->
      <view v-else-if="activeTab === 'community'" class="tab-content">
        <view v-for="c in communityResources" :key="c.id" class="info-card">
          <view class="card-header">
            <text class="card-icon">🏘️</text>
            <view class="card-title-area">
              <text class="card-title">{{ c.name }}</text>
              <text class="card-sub">{{ c.area }}</text>
            </view>
          </view>
          <view class="card-body">
            <text class="card-addr">📍 {{ c.address }}</text>
            <view v-if="c.services && c.services.length" class="card-tags">
              <text v-for="s in c.services" :key="s" class="tag-item">{{ s }}</text>
            </view>
            <text v-if="c.phone" class="card-phone" @tap="callPhone(c.phone)">📞 {{ c.phone }}</text>
          </view>
        </view>
      </view>

      <!-- ==================== 4. 医保Tab ==================== -->
      <view v-else-if="activeTab === 'insurance'" class="tab-content">
        <view v-for="item in insurancePolicies" :key="item.id" class="info-card insurance-card">
          <view class="card-header">
            <text class="card-icon">💳</text>
            <text class="card-title">{{ item.title }}</text>
          </view>
          <view class="card-body">
            <text class="card-desc">{{ item.desc }}<text class="highlight-text">{{ item.highlight }}</text>。{{ item.detail }}</text>
          </view>
        </view>
      </view>

      <!-- ==================== 5. 家属Tab ==================== -->
      <view v-else-if="activeTab === 'family'" class="tab-content">

        <!-- 家属主列表 -->
        <view v-if="familyView === 'list'">

          <!-- 返回顶部导航（从子视图返回时） -->

          <!-- 家属教育课程 -->
          <view class="section-block">
            <text class="section-title">📖 家属教育课程</text>
            <view v-for="course in familyCourses" :key="course.id"
              class="info-card course-card" @tap="openCourse(course.id)">
              <view class="card-header">
                <text class="card-icon">{{ course.icon }}</text>
                <view class="card-title-area">
                  <view class="card-title-row">
                    <text class="card-title">{{ course.title }}</text>
                    <text v-if="isCourseCompleted(course.id)" class="completed-badge">✓</text>
                  </view>
                  <text class="card-sub">{{ course.desc }}</text>
                </view>
              </view>
              <!-- 进度条 -->
              <view class="progress-bar-wrap">
                <view class="progress-bar">
                  <view class="progress-fill" :style="{ width: getCourseProgress(course.id) + '%' }"></view>
                </view>
                <text class="progress-text">{{ getCourseProgress(course.id) }}%</text>
              </view>
            </view>
          </view>

          <!-- 家属行动指南 -->
          <view class="section-block">
            <text class="section-title">🎯 家属行动指南</text>
            <view v-for="(guide, idx) in familyActionGuide" :key="guide.level"
              class="info-card guide-level-card" :style="{ borderLeftColor: guide.color }">
              <view class="guide-level-header" @tap="toggleGuide(idx)">
                <view class="guide-level-left">
                  <text class="guide-level-icon">{{ guide.icon }}</text>
                  <text class="guide-level-label" :style="{ color: guide.color }">{{ guide.label }}</text>
                </view>
                <text class="guide-level-arrow">{{ expandedGuide === idx ? '▲' : '▼' }}</text>
              </view>
              <view v-if="expandedGuide === idx" class="guide-level-body">
                <text class="guide-desc">{{ guide.description }}</text>
                <view class="guide-list">
                  <text class="guide-heading">✅ 建议做</text>
                  <text v-for="item in guide.doList" :key="item" class="guide-item">{{ item }}</text>
                </view>
                <view class="guide-list">
                  <text class="guide-heading warning-text">❌ 避免做</text>
                  <text v-for="item in guide.dontList" :key="item" class="guide-item">{{ item }}</text>
                </view>
                <view class="guide-reminder" :style="{ backgroundColor: guide.bgColor }">
                  <text class="reminder-text">💡 {{ guide.keyReminder }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 照护者压力自评 -->
          <view class="section-block">
            <text class="section-title">💪 照护者压力自评</text>
            <view class="info-card assessment-entry" @tap="openAssessment">
              <view class="card-header">
                <text class="card-icon">📋</text>
                <view class="card-title-area">
                  <text class="card-title">压力自评问卷</text>
                  <text class="card-sub">8道题，了解你的压力水平</text>
                </view>
              </view>
              <view v-if="lastAssessmentScore !== null" class="last-score">
                <text class="last-score-label">上次得分：</text>
                <text class="last-score-value" :style="{ color: getScoreLevel(lastAssessmentScore).color }">
                  {{ lastAssessmentScore }}分 - {{ getScoreLevel(lastAssessmentScore).label }}
                </text>
              </view>
            </view>
          </view>

          <!-- 自我关怀清单 -->
          <view class="section-block">
            <view class="section-header-row">
              <text class="section-title">🌿 自我关怀清单</text>
              <text class="add-btn" @tap="addSelfCareItem">+ 添加</text>
            </view>
            <view v-for="(item, idx) in selfCareItems" :key="idx" class="info-card selfcare-card">
              <view class="selfcare-row">
                <text class="selfcare-text">{{ item }}</text>
                <view class="selfcare-actions">
                  <text class="edit-btn" @tap="editSelfCareItem(idx)">编辑</text>
                  <text class="delete-btn" @tap="deleteSelfCareItem(idx)">删除</text>
                </view>
              </view>
            </view>
            <view v-if="!selfCareItems.length" class="empty-hint">
              <text>还没有添加任何条目，点击上方"+ 添加"开始吧</text>
            </view>
          </view>
        </view>

        <!-- 课程详情视图 -->
        <view v-if="familyView === 'course'">
          <view class="sub-nav">
            <text class="back-btn" @tap="familyView = 'list'">← 返回</text>
            <text class="sub-nav-title">{{ currentCourseData?.title }}</text>
          </view>
          <!-- 步骤指示点 -->
          <view class="step-dots">
            <view v-for="(step, idx) in currentCourseData?.steps" :key="idx"
              :class="['step-dot', currentStep === idx ? 'step-dot-active' : '', isStepCompleted(currentCourseId, idx) ? 'step-dot-done' : '']">
            </view>
          </view>
          <!-- 步骤内容 -->
          <view v-if="currentCourseData && currentCourseData.steps[currentStep]" class="step-content">
            <view class="step-type-tag">{{ currentCourseData.steps[currentStep].type }}</view>
            <text class="step-title">{{ currentCourseData.steps[currentStep].title }}</text>
            <text class="step-body">{{ currentCourseData.steps[currentStep].body }}</text>
          </view>
          <!-- 导航按钮 -->
          <view class="step-nav">
            <view v-if="currentStep > 0" class="nav-btn nav-prev" @tap="currentStep--">
              <text>← 上一步</text>
            </view>
            <view v-if="currentStep < (currentCourseData?.steps.length || 0) - 1" class="nav-btn nav-next" @tap="currentStep++">
              <text>下一步 →</text>
            </view>
            <view v-else class="nav-btn nav-complete" @tap="completeCourse">
              <text>✓ 完成课程</text>
            </view>
          </view>
        </view>

        <!-- 自评问卷视图 -->
        <view v-if="familyView === 'assessment'">
          <view class="sub-nav">
            <text class="back-btn" @tap="familyView = 'list'">← 返回</text>
            <text class="sub-nav-title">照护者压力自评</text>
          </view>
          <view class="assessment-questions">
            <view v-for="(q, idx) in caregiverQuestions" :key="q.id" class="question-card">
              <text class="question-number">{{ idx + 1 }}/8</text>
              <text class="question-text">{{ q.text }}</text>
              <text class="question-dimension">{{ q.dimension }}</text>
              <view class="score-row">
                <view v-for="s in 5" :key="s"
                  :class="['score-btn', assessmentAnswers[q.id] === s ? 'score-btn-active' : '']"
                  @tap="assessmentAnswers[q.id] = s">
                  <text>{{ s }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="assessment-submit" @tap="submitAssessment">
            <text class="submit-btn-text">提交评估</text>
          </view>
        </view>

        <!-- 自评结果视图 -->
        <view v-if="familyView === 'result'">
          <view class="sub-nav">
            <text class="back-btn" @tap="familyView = 'list'">← 返回</text>
            <text class="sub-nav-title">评估结果</text>
          </view>
          <view class="result-card" :style="{ backgroundColor: currentScoreLevel.bgColor }">
            <text class="result-score" :style="{ color: currentScoreLevel.color }">{{ assessmentTotalScore }}</text>
            <text class="result-label" :style="{ color: currentScoreLevel.color }">{{ currentScoreLevel.label }}</text>
          </view>
          <view class="result-advice">
            <text class="result-advice-text">{{ currentScoreLevel.advice }}</text>
          </view>
          <view class="assessment-submit" @tap="familyView = 'list'" style="margin-top: 32rpx;">
            <text class="submit-btn-text">返回家属指南</text>
          </view>
        </view>
      </view>

      <!-- ==================== 6. 重建Tab ==================== -->
      <view v-else-if="activeTab === 'rebuild'" class="tab-content">

        <!-- 子导航 -->
        <view class="sub-tab-bar">
          <view :class="['sub-tab-item', rebuildSubTab === 'tasks' ? 'sub-tab-active' : '']"
            @tap="rebuildSubTab = 'tasks'">
            <text>📋 社交任务</text>
          </view>
          <view :class="['sub-tab-item', rebuildSubTab === 'stories' ? 'sub-tab-active' : '']"
            @tap="rebuildSubTab = 'stories'">
            <text>👥 同伴故事</text>
          </view>
        </view>

        <!-- 社交任务视图 -->
        <view v-if="rebuildSubTab === 'tasks' && rebuildView === 'tasks'">

          <!-- 统计面板 -->
          <view class="stats-panel">
            <view class="stat-item">
              <text class="stat-value">{{ completedTaskCount }}</text>
              <text class="stat-label">/ {{ totalTaskCount }} 已完成</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value">{{ weeklyActivityCount }}</text>
              <text class="stat-label">本周社交次数</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item stat-record" @tap="showActivityDialog = true">
              <text class="stat-value-sm">📝</text>
              <text class="stat-label">记录活动</text>
            </view>
          </view>

          <!-- 活动记录弹窗 -->
          <view v-if="showActivityDialog" class="dialog-overlay" @tap.self="showActivityDialog = false">
            <view class="dialog-box">
              <text class="dialog-title">记录社交活动</text>
              <input class="dialog-input" v-model="newActivityText" placeholder="今天做了什么社交活动？" />
              <view class="dialog-actions">
                <text class="dialog-cancel" @tap="showActivityDialog = false">取消</text>
                <text class="dialog-confirm" @tap="saveActivity">记录</text>
              </view>
            </view>
          </view>

          <!-- 感受记录弹窗 -->
          <view v-if="showFeelingDialog" class="dialog-overlay" @tap.self="showFeelingDialog = false">
            <view class="dialog-box">
              <text class="dialog-title">记录感受</text>
              <text class="dialog-sub">{{ feelingTaskTitle }}</text>
              <input class="dialog-input" v-model="feelingText" placeholder="完成任务后的感受..." />
              <view class="dialog-actions">
                <text class="dialog-cancel" @tap="showFeelingDialog = false">关闭</text>
                <text class="dialog-confirm" @tap="saveFeeling">保存</text>
              </view>
            </view>
          </view>

          <!-- 渐进式社交任务 -->
          <view v-for="stage in socialStages" :key="stage.id" class="stage-section">
            <view class="stage-header" @tap="toggleStage(stage.id)">
              <text class="stage-icon">{{ stage.icon }}</text>
              <text class="stage-title" :style="{ color: stage.color }">{{ stage.title }}</text>
              <text class="stage-count">{{ getStageCompletedCount(stage.id) }}/{{ stage.tasks.length }}</text>
              <text class="stage-arrow">{{ expandedStage === stage.id ? '▲' : '▼' }}</text>
            </view>
            <text v-if="stage.desc" class="stage-desc">{{ stage.desc }}</text>
            <view v-if="expandedStage === stage.id" class="stage-tasks">
              <view v-for="task in stage.tasks" :key="task.id"
                :class="['task-card', isTaskCompleted(task.id) ? 'task-done' : '']"
                @tap="toggleTask(task)">
                <view class="task-check">
                  <text>{{ isTaskCompleted(task.id) ? '✓' : '○' }}</text>
                </view>
                <view class="task-info">
                  <text class="task-title">{{ task.title }}</text>
                  <text class="task-desc">{{ task.desc }}</text>
                  <view class="task-meta">
                    <text class="task-duration">⏱ {{ task.duration }}</text>
                    <text v-if="task.tip" class="task-tip">💡 {{ task.tip }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 同伴故事视图 -->
        <view v-if="rebuildSubTab === 'stories' && rebuildView === 'stories'">
          <!-- 分类筛选 -->
          <scroll-view scroll-x class="category-scroll">
            <view class="category-bar">
              <view v-for="cat in storyCategories" :key="cat.key"
                :class="['category-item', selectedCategory === cat.key ? 'category-active' : '']"
                @tap="selectedCategory = cat.key">
                <text>{{ cat.label }}</text>
              </view>
            </view>
          </scroll-view>
          <!-- 故事列表 -->
          <view v-for="story in filteredStories" :key="story.id"
            class="info-card story-card" @tap="openStoryDetail(story)">
            <text class="story-title">{{ story.title }}</text>
            <text class="story-summary">{{ story.summary }}</text>
            <view class="card-tags">
              <text v-for="tag in story.tags" :key="tag" class="tag-item">{{ tag }}</text>
            </view>
          </view>
        </view>

        <!-- 故事详情视图 -->
        <view v-if="rebuildSubTab === 'stories' && rebuildView === 'storyDetail'">
          <view class="sub-nav">
            <text class="back-btn" @tap="rebuildView = 'stories'">← 返回</text>
            <text class="sub-nav-title">同伴故事</text>
          </view>
          <view v-if="currentStory" class="story-detail">
            <text class="story-detail-title">{{ currentStory.title }}</text>
            <view class="card-tags" style="margin-bottom: 24rpx;">
              <text v-for="tag in currentStory.tags" :key="tag" class="tag-item">{{ tag }}</text>
            </view>
            <text class="story-detail-body">{{ currentStory.body }}</text>
          </view>
        </view>
      </view>

    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { hospitals, areas } from '@/data/hospitals'
import { hotlines } from '@/data/hotlines'
import { communityResources } from '@/data/community'
import { insurancePolicies } from '@/data/insurance'
import { familyCourses } from '@/data/familyCourses'
import { familyActionGuide } from '@/data/familyGuide'
import { caregiverQuestions, getScoreLevel, defaultSelfCareItems } from '@/data/caregiverAssessment'
import { socialStages } from '@/data/socialTasks'
import { peerStories, storyCategories } from '@/data/peerStories'

// ==================== 通用Tab ====================
const tabs = [
  { key: 'hospitals', label: '🏥 医院', color: '#4A90D9' },
  { key: 'hotlines', label: '📞 热线', color: '#D46B6B' },
  { key: 'community', label: '🏘️ 社区', color: '#6BAF7A' },
  { key: 'insurance', label: '💳 医保', color: '#E8985E' },
  { key: 'family', label: '👨‍👩‍👧 家属', color: '#9B59B6' },
  { key: 'rebuild', label: '🌱 重建', color: '#5CB85C' },
]
const activeTab = ref('hospitals')
const tabScrollLeft = ref(0)

function switchTab(key: string, idx: number) {
  activeTab.value = key
  tabScrollLeft.value = idx > 3 ? (idx - 3) * 140 : 0
}

function callPhone(phone: string) {
  uni.makePhoneCall({ phoneNumber: phone })
}

// ==================== 1. 医院Tab ====================
const selectedArea = ref('全部区域')

function onAreaChange(e: any) {
  selectedArea.value = areas[e.detail.value]
}

const filteredHospitals = computed(() => {
  if (selectedArea.value === '全部区域') return hospitals
  return hospitals.filter((h: any) => h.area === selectedArea.value)
})

// ==================== 5. 家属Tab ====================
type FamilyView = 'list' | 'course' | 'assessment' | 'result'
const familyView = ref<FamilyView>('list')
const expandedGuide = ref<number | null>(null)

// 课程相关
const currentCourseId = ref('')
const currentStep = ref(0)
const familyProgress = ref<Record<string, number>>({})

function loadFamilyProgress() {
  try {
    const saved = uni.getStorageSync('sgt-family-progress')
    if (saved) familyProgress.value = JSON.parse(saved)
  } catch (e) {}
}

function saveFamilyProgress() {
  uni.setStorageSync('sgt-family-progress', JSON.stringify(familyProgress.value))
}

const currentCourseData = computed(() => {
  return familyCourses.find((c: any) => c.id === currentCourseId.value)
})

function isCourseCompleted(courseId: string): boolean {
  const course = familyCourses.find((c: any) => c.id === courseId)
  if (!course) return false
  return familyProgress.value[courseId] >= course.steps.length
}

function getCourseProgress(courseId: string): number {
  const course = familyCourses.find((c: any) => c.id === courseId)
  if (!course) return 0
  const completed = familyProgress.value[courseId] || 0
  return Math.round((completed / course.steps.length) * 100)
}

function isStepCompleted(courseId: string, stepIdx: number): boolean {
  return (familyProgress.value[courseId] || 0) > stepIdx
}

function openCourse(courseId: string) {
  currentCourseId.value = courseId
  currentStep.value = familyProgress.value[courseId] || 0
  familyView.value = 'course'
}

function completeCourse() {
  const course = familyCourses.find((c: any) => c.id === currentCourseId.value)
  if (!course) return
  familyProgress.value[currentCourseId.value] = course.steps.length
  saveFamilyProgress()
  uni.showToast({ title: '课程已完成！', icon: 'success' })
  familyView.value = 'list'
}

// 手风琴
function toggleGuide(idx: number) {
  expandedGuide.value = expandedGuide.value === idx ? null : idx
}

// 自评相关
const assessmentAnswers = ref<Record<number, number>>({})
const assessmentTotalScore = ref(0)
const lastAssessmentScore = ref<number | null>(null)
const currentScoreLevel = ref<any>({ color: '#4CAF50', bgColor: '#E8F5E9', label: '', advice: '' })
const savedAssessments = ref<any[]>([])

function loadAssessments() {
  try {
    const saved = uni.getStorageSync('sgt-caregiver-assessments')
    if (saved) {
      savedAssessments.value = JSON.parse(saved)
      if (savedAssessments.value.length > 0) {
        lastAssessmentScore.value = savedAssessments.value[savedAssessments.value.length - 1].score
      }
    }
  } catch (e) {}
}

function openAssessment() {
  assessmentAnswers.value = {}
  familyView.value = 'assessment'
}

function submitAssessment() {
  // 检查是否所有题目都已作答
  const allAnswered = caregiverQuestions.every((q: any) => assessmentAnswers.value[q.id] !== undefined && assessmentAnswers.value[q.id] > 0)
  if (!allAnswered) {
    uni.showToast({ title: '请完成所有题目', icon: 'none' })
    return
  }
  let total = 0
  caregiverQuestions.forEach((q: any) => {
    total += assessmentAnswers.value[q.id] || 0
  })
  assessmentTotalScore.value = total
  currentScoreLevel.value = getScoreLevel(total)

  // 保存记录
  const record = { score: total, date: new Date().toISOString(), level: currentScoreLevel.value.level }
  savedAssessments.value.push(record)
  if (savedAssessments.value.length > 30) {
    savedAssessments.value = savedAssessments.value.slice(-30)
  }
  uni.setStorageSync('sgt-caregiver-assessments', JSON.stringify(savedAssessments.value))
  lastAssessmentScore.value = total

  familyView.value = 'result'
}

// 自我关怀清单
const selfCareItems = ref<string[]>([])
const editingSelfCareIdx = ref<number | null>(null)

function loadSelfCareItems() {
  try {
    const saved = uni.getStorageSync('sgt-caregiver-selfcare')
    if (saved) {
      selfCareItems.value = JSON.parse(saved)
    } else {
      selfCareItems.value = [...defaultSelfCareItems]
    }
  } catch (e) {
    selfCareItems.value = [...defaultSelfCareItems]
  }
}

function saveSelfCareItems() {
  uni.setStorageSync('sgt-caregiver-selfcare', JSON.stringify(selfCareItems.value))
}

function addSelfCareItem() {
  uni.showModal({
    title: '添加关怀条目',
    editable: true,
    placeholderText: '例如：每周散步3次',
    success: (res) => {
      if (res.confirm && res.content) {
        selfCareItems.value.push(res.content)
        saveSelfCareItems()
      }
    }
  })
}

function editSelfCareItem(idx: number) {
  uni.showModal({
    title: '编辑条目',
    editable: true,
    placeholderText: selfCareItems.value[idx],
    success: (res) => {
      if (res.confirm && res.content) {
        selfCareItems.value[idx] = res.content
        saveSelfCareItems()
      }
    }
  })
}

function deleteSelfCareItem(idx: number) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    success: (res) => {
      if (res.confirm) {
        selfCareItems.value.splice(idx, 1)
        saveSelfCareItems()
      }
    }
  })
}

// ==================== 6. 重建Tab ====================
type RebuildSubTab = 'tasks' | 'stories'
type RebuildView = 'tasks' | 'stories' | 'storyDetail'
const rebuildSubTab = ref<RebuildSubTab>('tasks')
const rebuildView = ref<RebuildView>('tasks')
const expandedStage = ref<string | null>(null)
const showActivityDialog = ref(false)
const showFeelingDialog = ref(false)
const newActivityText = ref('')
const feelingText = ref('')
const feelingTaskTitle = ref('')
const currentStory = ref<any>(null)
const selectedCategory = ref('all')

// 社交任务持久化
const completedTasks = ref<Record<string, boolean>>({})
const socialActivities = ref<any[]>([])

function loadSocialTasks() {
  try {
    const saved = uni.getStorageSync('sgt-social-tasks')
    if (saved) completedTasks.value = JSON.parse(saved)
  } catch (e) {}
}

function saveSocialTasks() {
  uni.setStorageSync('sgt-social-tasks', JSON.stringify(completedTasks.value))
}

function loadSocialActivities() {
  try {
    const saved = uni.getStorageSync('sgt-social-activities')
    if (saved) socialActivities.value = JSON.parse(saved)
  } catch (e) {}
}

function saveSocialActivities() {
  if (socialActivities.value.length > 90) {
    socialActivities.value = socialActivities.value.slice(-90)
  }
  uni.setStorageSync('sgt-social-activities', JSON.stringify(socialActivities.value))
}

const totalTaskCount = computed(() => {
  return socialStages.reduce((sum: number, stage: any) => sum + stage.tasks.length, 0)
})

const completedTaskCount = computed(() => {
  return Object.values(completedTasks.value).filter(Boolean).length
})

const weeklyActivityCount = computed(() => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return socialActivities.value.filter((a: any) => new Date(a.date) >= weekStart).length
})

function getStageCompletedCount(stageId: string): number {
  const stage = socialStages.find((s: any) => s.id === stageId)
  if (!stage) return 0
  return stage.tasks.filter((t: any) => completedTasks.value[t.id]).length
}

function isTaskCompleted(taskId: string): boolean {
  return !!completedTasks.value[taskId]
}

function toggleStage(stageId: string) {
  expandedStage.value = expandedStage.value === stageId ? null : stageId
}

function toggleTask(task: any) {
  if (completedTasks.value[task.id]) {
    // 已完成，取消
    completedTasks.value[task.id] = false
    saveSocialTasks()
  } else {
    // 完成任务，弹出感受记录
    feelingTaskTitle.value = task.title
    feelingText.value = ''
    showFeelingDialog.value = true
  }
}

function saveFeeling() {
  // 找到当前感受对应的任务并标记完成
  const allTasks = socialStages.flatMap((s: any) => s.tasks)
  const task = allTasks.find((t: any) => t.title === feelingTaskTitle.value)
  if (task) {
    completedTasks.value[task.id] = true
    saveSocialTasks()
  }
  // 记录活动
  if (feelingText.value.trim()) {
    socialActivities.value.push({
      text: feelingText.value.trim(),
      task: feelingTaskTitle.value,
      date: new Date().toISOString()
    })
    saveSocialActivities()
  }
  showFeelingDialog.value = false
  uni.showToast({ title: '太棒了！继续保持', icon: 'success' })
}

function saveActivity() {
  if (!newActivityText.value.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  socialActivities.value.push({
    text: newActivityText.value.trim(),
    task: '自由记录',
    date: new Date().toISOString()
  })
  saveSocialActivities()
  newActivityText.value = ''
  showActivityDialog.value = false
  uni.showToast({ title: '已记录', icon: 'success' })
}

// 同伴故事
const filteredStories = computed(() => {
  if (selectedCategory.value === 'all') return peerStories
  return peerStories.filter((s: any) => s.category === selectedCategory.value)
})

function openStoryDetail(story: any) {
  currentStory.value = story
  rebuildView.value = 'storyDetail'
}

// 监听重建子Tab切换，同步视图
watch(rebuildSubTab, (val) => {
  if (val === 'tasks') rebuildView.value = 'tasks'
  else rebuildView.value = 'stories'
})

// ==================== 初始化 ====================
onMounted(() => {
  loadFamilyProgress()
  loadAssessments()
  loadSelfCareItems()
  loadSocialTasks()
  loadSocialActivities()
})
</script>

<style lang="scss" scoped>
.resources-page {
  min-height: 100vh;
  background: #F8F6F2;
}

.header {
  padding: 32rpx 32rpx 16rpx;
}
.title {
  font-size: 44rpx;
  font-weight: 700;
  display: block;
}
.subtitle {
  font-size: 28rpx;
  color: #6B6B6B;
  margin-top: 8rpx;
  display: block;
}

/* Tab栏 */
.tab-scroll {
  white-space: nowrap;
}
.tab-bar {
  display: flex;
  padding: 16rpx 32rpx;
  gap: 16rpx;
}
.tab-item {
  display: inline-block;
  padding: 16rpx 28rpx;
  border-radius: 9999rpx;
  font-size: 26rpx;
  background: #FFFFFF;
  border-bottom: 4rpx solid transparent;
  white-space: nowrap;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.04);
}
.tab-active {
  font-weight: 600;
}
.content-scroll {
  padding: 0 32rpx 60rpx;
  height: calc(100vh - 240rpx);
}
.tab-content {
  padding-top: 16rpx;
}

/* 通用卡片 */
.info-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}
.card-icon {
  font-size: 36rpx;
}
.card-title-area {
  flex: 1;
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
}
.card-sub {
  font-size: 24rpx;
  color: #9B9B9B;
  margin-top: 4rpx;
  display: block;
}
.card-body {
  padding-left: 52rpx;
}
.card-addr {
  font-size: 26rpx;
  color: #6B6B6B;
  display: block;
  margin-bottom: 8rpx;
}
.card-phone {
  font-size: 28rpx;
  color: #4A90D9;
  font-weight: 500;
  display: block;
  margin-top: 8rpx;
}
.card-desc {
  font-size: 26rpx;
  color: #6B6B6B;
  margin-top: 8rpx;
  display: block;
  line-height: 1.5;
}

/* 标签 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}
.tag-item {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #F0F0F0;
  color: #6B6B6B;
}

/* ====== 医院Tab ====== */
.area-picker-wrap {
  margin-bottom: 16rpx;
}
.area-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: #FFFFFF;
  border-radius: 9999rpx;
  padding: 16rpx 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.area-picker-text {
  font-size: 28rpx;
  color: #4A90D9;
  font-weight: 500;
}
.area-picker-arrow {
  font-size: 20rpx;
  color: #4A90D9;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 4rpx;
}
.card-level {
  font-size: 22rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: 600;
}
.level-top {
  background: #FFF3E0;
  color: #E65100;
}
.level-second {
  background: #E3F2FD;
  color: #1565C0;
}
.card-hours {
  font-size: 22rpx;
  color: #9B9B9B;
}

/* ====== 热线Tab ====== */
.featured-card {
  border-left: 6rpx solid #D32F2F;
}
.featured-badge {
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  background: #FFEBEE;
  color: #D32F2F;
  font-weight: 600;
  margin-left: 8rpx;
}
.card-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* ====== 医保Tab ====== */
.insurance-card .card-body {
  padding-left: 52rpx;
}
.highlight-text {
  color: #D32F2F;
  font-weight: 700;
  font-size: 30rpx;
}

/* ====== 家属Tab ====== */
.section-block {
  margin-bottom: 24rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
  color: #333;
}
.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.add-btn {
  font-size: 26rpx;
  color: #4A90D9;
  font-weight: 500;
  padding: 8rpx 16rpx;
  background: #E3F2FD;
  border-radius: 12rpx;
}

/* 课程卡片 */
.course-card {
  cursor: pointer;
}
.completed-badge {
  font-size: 22rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  background: #E8F5E9;
  color: #4CAF50;
  font-weight: 700;
  margin-left: 8rpx;
}
.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
  padding-left: 52rpx;
}
.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #EEEEEE;
  border-radius: 4rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #4CAF50;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 22rpx;
  color: #9B9B9B;
  min-width: 60rpx;
  text-align: right;
}

/* 行动指南手风琴 */
.guide-level-card {
  border-left: 6rpx solid #CCC;
}
.guide-level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.guide-level-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.guide-level-icon {
  font-size: 32rpx;
}
.guide-level-label {
  font-size: 30rpx;
  font-weight: 600;
}
.guide-level-arrow {
  font-size: 24rpx;
  color: #9B9B9B;
}
.guide-level-body {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #EEEEEE;
}
.guide-desc {
  font-size: 26rpx;
  color: #6B6B6B;
  line-height: 1.6;
  display: block;
  margin-bottom: 16rpx;
}
.guide-list {
  margin-bottom: 16rpx;
}
.guide-heading {
  font-size: 26rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
  color: #333;
}
.guide-item {
  font-size: 24rpx;
  color: #4A4A4A;
  line-height: 1.6;
  display: block;
  margin-bottom: 4rpx;
  padding-left: 8rpx;
}
.warning-text {
  color: #D32F2F;
}
.guide-reminder {
  border-radius: 12rpx;
  padding: 16rpx;
  margin-top: 12rpx;
}
.reminder-text {
  font-size: 24rpx;
  color: #4A4A4A;
  line-height: 1.6;
}

/* 自评入口 */
.assessment-entry {
  cursor: pointer;
}
.last-score {
  margin-top: 12rpx;
  padding: 12rpx;
  background: #F8F6F2;
  border-radius: 12rpx;
  padding-left: 52rpx;
}
.last-score-label {
  font-size: 24rpx;
  color: #9B9B9B;
}
.last-score-value {
  font-size: 26rpx;
  font-weight: 600;
}

/* 自我关怀 */
.selfcare-card {
  padding: 16rpx 24rpx;
}
.selfcare-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.selfcare-text {
  font-size: 26rpx;
  color: #4A4A4A;
  flex: 1;
}
.selfcare-actions {
  display: flex;
  gap: 16rpx;
}
.edit-btn {
  font-size: 24rpx;
  color: #4A90D9;
}
.delete-btn {
  font-size: 24rpx;
  color: #D32F2F;
}
.empty-hint {
  text-align: center;
  padding: 40rpx;
  color: #9B9B9B;
  font-size: 26rpx;
}

/* 子导航 */
.sub-nav {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.back-btn {
  font-size: 28rpx;
  color: #4A90D9;
  font-weight: 500;
}
.sub-nav-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

/* 课程详情 - 步骤 */
.step-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
}
.step-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #DDDDDD;
}
.step-dot-active {
  background: #4A90D9;
  transform: scale(1.3);
}
.step-dot-done {
  background: #4CAF50;
}
.step-content {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.step-type-tag {
  display: inline-block;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  background: #E8F0FE;
  color: #4A90D9;
  font-weight: 500;
  margin-bottom: 16rpx;
}
.step-title {
  font-size: 34rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 16rpx;
  color: #333;
}
.step-body {
  font-size: 28rpx;
  color: #4A4A4A;
  line-height: 1.8;
  white-space: pre-wrap;
  display: block;
}
.step-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
  gap: 16rpx;
}
.nav-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
}
.nav-prev {
  background: #F0F0F0;
  color: #666;
}
.nav-next {
  background: #4A90D9;
  color: #FFFFFF;
}
.nav-complete {
  background: #4CAF50;
  color: #FFFFFF;
}

/* 自评问卷 */
.question-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.question-number {
  font-size: 22rpx;
  color: #9B9B9B;
  display: block;
  margin-bottom: 8rpx;
}
.question-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.5;
}
.question-dimension {
  font-size: 22rpx;
  color: #9B9B9B;
  display: block;
  margin-bottom: 16rpx;
}
.score-row {
  display: flex;
  gap: 12rpx;
}
.score-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
}
.score-btn-active {
  background: #4A90D9;
  color: #FFFFFF;
  font-weight: 600;
}
.assessment-submit {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #4A90D9;
  text-align: center;
}
.submit-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 评估结果 */
.result-card {
  border-radius: 20rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.result-score {
  font-size: 80rpx;
  font-weight: 700;
  display: block;
}
.result-label {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
  margin-top: 8rpx;
}
.result-advice {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-top: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.result-advice-text {
  font-size: 28rpx;
  color: #4A4A4A;
  line-height: 1.6;
}

/* ====== 重建Tab ====== */
.sub-tab-bar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.sub-tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #FFFFFF;
  font-size: 28rpx;
  color: #666;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.04);
}
.sub-tab-active {
  background: #4A90D9;
  color: #FFFFFF;
  font-weight: 600;
}

/* 统计面板 */
.stats-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.stat-item {
  flex: 1;
  text-align: center;
}
.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #4A90D9;
  display: block;
}
.stat-label {
  font-size: 22rpx;
  color: #9B9B9B;
  display: block;
  margin-top: 4rpx;
}
.stat-value-sm {
  font-size: 32rpx;
}
.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #EEEEEE;
}
.stat-record {
  cursor: pointer;
}

/* 弹窗 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.dialog-box {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
}
.dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
  color: #333;
}
.dialog-sub {
  font-size: 26rpx;
  color: #6B6B6B;
  display: block;
  margin-bottom: 16rpx;
}
.dialog-input {
  width: 100%;
  padding: 16rpx;
  border: 1rpx solid #DDDDDD;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
}
.dialog-cancel {
  font-size: 28rpx;
  color: #9B9B9B;
}
.dialog-confirm {
  font-size: 28rpx;
  color: #4A90D9;
  font-weight: 600;
}

/* 社交阶段 */
.stage-section {
  margin-bottom: 16rpx;
}
.stage-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.stage-icon {
  font-size: 32rpx;
}
.stage-title {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
}
.stage-count {
  font-size: 24rpx;
  color: #9B9B9B;
  margin-right: 8rpx;
}
.stage-arrow {
  font-size: 22rpx;
  color: #9B9B9B;
}
.stage-desc {
  font-size: 24rpx;
  color: #9B9B9B;
  padding: 0 24rpx;
  margin-top: 8rpx;
  margin-bottom: 8rpx;
  display: block;
}

/* 任务卡片 */
.stage-tasks {
  padding: 0 8rpx;
}
.task-card {
  display: flex;
  gap: 16rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-top: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.task-done {
  opacity: 0.6;
}
.task-check {
  font-size: 32rpx;
  color: #4CAF50;
  padding-top: 4rpx;
}
.task-info {
  flex: 1;
}
.task-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}
.task-done .task-title {
  text-decoration: line-through;
  color: #9B9B9B;
}
.task-desc {
  font-size: 24rpx;
  color: #6B6B6B;
  line-height: 1.5;
  display: block;
  margin-bottom: 8rpx;
}
.task-meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.task-duration {
  font-size: 22rpx;
  color: #9B9B9B;
}
.task-tip {
  font-size: 22rpx;
  color: #FF9800;
  font-style: italic;
}

/* 故事分类 */
.category-scroll {
  white-space: nowrap;
  margin-bottom: 16rpx;
}
.category-bar {
  display: flex;
  gap: 12rpx;
}
.category-item {
  display: inline-block;
  padding: 10rpx 24rpx;
  border-radius: 9999rpx;
  font-size: 24rpx;
  background: #FFFFFF;
  color: #666;
  white-space: nowrap;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.04);
}
.category-active {
  background: #9B59B6;
  color: #FFFFFF;
  font-weight: 500;
}

/* 故事卡片 */
.story-card {
  cursor: pointer;
}
.story-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}
.story-summary {
  font-size: 26rpx;
  color: #6B6B6B;
  line-height: 1.5;
  display: block;
  margin-bottom: 12rpx;
}

/* 故事详情 */
.story-detail {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.story-detail-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}
.story-detail-body {
  font-size: 28rpx;
  color: #4A4A4A;
  line-height: 1.8;
  white-space: pre-wrap;
  display: block;
}
</style>
