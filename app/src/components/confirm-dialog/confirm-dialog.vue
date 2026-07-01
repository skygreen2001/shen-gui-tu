<template>
  <view v-if="visible" class="dialog-mask" @tap="handleCancel">
    <view class="dialog-box" @tap.stop>
      <view class="dialog-title">{{ title }}</view>
      <view class="dialog-message">{{ message }}</view>
      <view class="dialog-actions">
        <view class="dialog-btn cancel" @tap="handleCancel"><text>取消</text></view>
        <view class="dialog-btn confirm" @tap="handleConfirm"><text>确定</text></view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const visible = ref(false)
const title = ref('提示')
const message = ref('')
let resolveRef: ((v: boolean) => void) | null = null
function show(options: { title?: string; message: string }) {
  title.value = options.title || '提示'
  message.value = options.message
  visible.value = true
  return new Promise<boolean>(resolve => { resolveRef = resolve })
}
function handleConfirm() { visible.value = false; if (resolveRef) resolveRef(true) }
function handleCancel() { visible.value = false; if (resolveRef) resolveRef(false) }
defineExpose({ show })
</script>
<style lang="scss" scoped>
.dialog-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 9998; display: flex; align-items: center; justify-content: center; }
.dialog-box { width: 560rpx; background: #fff; border-radius: 32rpx; padding: 64rpx 32rpx; }
.dialog-title { font-size: 32rpx; font-weight: 600; text-align: center; margin-bottom: 24rpx; }
.dialog-message { font-size: 30rpx; color: #6B6B6B; text-align: center; margin-bottom: 48rpx; line-height: 1.6; }
.dialog-actions { display: flex; gap: 24rpx; }
.dialog-btn { flex: 1; text-align: center; padding: 24rpx 0; border-radius: 20rpx; font-size: 32rpx; font-weight: 600; }
.cancel { background: #F0EDE7; color: #6B6B6B; }
.confirm { background: #4A90D9; color: #fff; }
</style>
