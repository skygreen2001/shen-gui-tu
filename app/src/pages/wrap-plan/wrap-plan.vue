<template>
  <view class="wrap-page">
    <view class="header">
      <text class="title">WRAP计划 📝</text>
      <text class="subtitle">个人康复行动计划</text>
    </view>
    <!-- 进度概览 -->
    <view class="progress-bar-area">
      <view class="progress-info">
        <text class="progress-text">计划完成度</text>
        <text class="progress-pct">{{ completionPct }}%</text>
      </view>
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: completionPct + '%' }"></view>
      </view>
    </view>
    <!-- 手风琴面板 -->
    <view class="sections">
      <view v-for="section in sections" :key="section.id" class="section-card">
        <!-- 面板标题 -->
        <view class="section-header" @tap="toggleSection(section.id)">
          <text class="section-title">{{ section.title }}</text>
          <view class="section-meta">
            <text class="item-count">{{ getSectionItems(section.id).length }} 项</text>
            <text class="toggle-arrow">{{ expandedSections[section.id] ? '▲' : '▼' }}</text>
          </view>
        </view>
        <view v-if="expandedSections[section.id]" class="section-body">
          <text class="section-hint">{{ section.hint }}</text>
          <!-- 条目列表 -->
          <view v-for="(item, idx) in getSectionItems(section.id)" :key="idx" class="item-row">
            <view class="item-content">
              <text v-if="editingIdx !== `${section.id}-${idx}`" class="item-text">{{ item }}</text>
              <input v-else v-model="editingText" class="item-input" :focus="true" @confirm="saveEdit(section.id, idx)" />
            </view>
            <view class="item-actions">
              <text class="action-edit" @tap="startEdit(section.id, idx, item)">✏️</text>
              <text class="action-delete" @tap="deleteItem(section.id, idx)">🗑️</text>
            </view>
          </view>
          <!-- 添加条目 -->
          <view class="add-item-area">
            <input v-model="newItemTexts[section.id]" class="add-input" placeholder="添加新条目..." @confirm="addItem(section.id)" />
            <view class="add-btn" @tap="addItem(section.id)"><text>+ 添加</text></view>
          </view>
        </view>
      </view>
    </view>
    <!-- WRAP来源说明 -->
    <view class="source-note">
      <text>WRAP（Wellness Recovery Action Plan）由 Mary Ellen Copeland 博士创建，是全球广泛使用的个人康复计划工具。</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { wrapSections as defaultSections } from '@/data/wrapTemplate'

const store = useStore()

// 从 Vuex 加载或使用默认数据
const userItems = computed(() => store.state.wrap?.items || {})

// 合并默认模板与用户自定义
const sections = defaultSections.map(s => ({ ...s }))

const expandedSections = reactive<Record<string, boolean>>({})
const newItemTexts = reactive<Record<string, string>>({})
const editingIdx = ref('')
const editingText = ref('')

// 初始化默认展开第一项
expandedSections[sections[0]?.id] = true

function getSectionItems(sectionId: string): string[] {
  return (userItems.value as Record<string, string[]>)[sectionId] || defaultSections.find(s => s.id === sectionId)?.items || []
}

function toggleSection(sectionId: string) {
  expandedSections[sectionId] = !expandedSections[sectionId]
}

function addItem(sectionId: string) {
  const text = newItemTexts[sectionId]?.trim()
  if (!text) return
  const items = [...getSectionItems(sectionId), text]
  saveSectionItems(sectionId, items)
  newItemTexts[sectionId] = ''
  uni.showToast({ title: '已添加', icon: 'success' })
}

function deleteItem(sectionId: string, idx: number) {
  const items = getSectionItems(sectionId).filter((_, i) => i !== idx)
  saveSectionItems(sectionId, items)
}

function startEdit(sectionId: string, idx: number, item: string) {
  editingIdx.value = `${sectionId}-${idx}`
  editingText.value = item
}

function saveEdit(sectionId: string, idx: number) {
  if (!editingText.value.trim()) return
  const items = getSectionItems(sectionId).map((item, i) => i === idx ? editingText.value.trim() : item)
  saveSectionItems(sectionId, items)
  editingIdx.value = ''
  editingText.value = ''
}

function saveSectionItems(sectionId: string, items: string[]) {
  store.dispatch('wrap/saveSection', { sectionId, items })
}

const completionPct = computed(() => {
  const totalSections = sections.length
  let filledSections = 0
  sections.forEach(s => {
    if (getSectionItems(s.id).length > 0) filledSections++
  })
  return totalSections > 0 ? Math.round(filledSections / totalSections * 100) : 0
})
</script>
<style lang="scss" scoped>
.wrap-page { min-height: 100vh; background: #F8F6F2; padding: 32rpx; padding-bottom: 60rpx; }
.header { margin-bottom: 32rpx; }
.title { font-size: 44rpx; font-weight: 700; display: block; }
.subtitle { font-size: 28rpx; color: #6B6B6B; margin-top: 8rpx; display: block; }
.progress-bar-area { background: #FFFFFF; border-radius: 20rpx; padding: 24rpx; margin-bottom: 32rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.progress-info { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.progress-text { font-size: 28rpx; color: #4A4A4A; }
.progress-pct { font-size: 28rpx; font-weight: 700; color: #4A90D9; }
.progress-track { height: 12rpx; background: #F0EDE7; border-radius: 9999rpx; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #4A90D9, #6BAF7A); border-radius: 9999rpx; transition: width 0.3s ease; }
.sections { display: flex; flex-direction: column; gap: 16rpx; margin-bottom: 32rpx; }
.section-card { background: #FFFFFF; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.section-header { padding: 28rpx 32rpx; display: flex; justify-content: space-between; align-items: center; }
.section-title { font-size: 30rpx; font-weight: 600; flex: 1; }
.section-meta { display: flex; align-items: center; gap: 12rpx; }
.item-count { font-size: 22rpx; color: #9B9B9B; }
.toggle-arrow { font-size: 24rpx; color: #9B9B9B; }
.section-body { padding: 0 32rpx 24rpx; border-top: 1rpx solid #F0EDE7; }
.section-hint { font-size: 26rpx; color: #9B9B9B; margin: 16rpx 0; display: block; }
.item-row { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #F0EDE7; }
.item-row:last-of-type { border-bottom: none; }
.item-content { flex: 1; }
.item-text { font-size: 28rpx; color: #4A4A4A; line-height: 1.5; }
.item-input { font-size: 28rpx; padding: 8rpx 16rpx; background: #F8F6F2; border-radius: 12rpx; }
.item-actions { display: flex; gap: 12rpx; flex-shrink: 0; margin-left: 12rpx; }
.action-edit { font-size: 28rpx; padding: 8rpx; }
.action-delete { font-size: 28rpx; padding: 8rpx; }
.add-item-area { display: flex; gap: 12rpx; margin-top: 16rpx; }
.add-input { flex: 1; background: #F8F6F2; border-radius: 12rpx; padding: 16rpx 20rpx; font-size: 28rpx; }
.add-btn { background: #4A90D9; color: #fff; border-radius: 12rpx; padding: 16rpx 24rpx; font-size: 26rpx; font-weight: 600; display: flex; align-items: center; flex-shrink: 0; }
.source-note { text-align: center; font-size: 22rpx; color: #9B9B9B; padding: 32rpx; margin-top: 32rpx; border-top: 1rpx solid #E5E2DC; line-height: 1.6; }
</style>
