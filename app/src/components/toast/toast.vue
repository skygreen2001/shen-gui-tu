<template>
  <view v-if="visible" class="toast-mask">
    <view class="toast-content">{{ message }}</view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const visible = ref(false)
const message = ref('')
let timer: any = null
function show(msg: string, duration = 2000) {
  message.value = msg
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { visible.value = false }, duration)
}
defineExpose({ show })
</script>
<style lang="scss" scoped>
.toast-mask { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; pointer-events: none; }
.toast-content { background-color: rgba(0,0,0,0.75); color: #fff; padding: 20rpx 40rpx; border-radius: 20rpx; font-size: 28rpx; max-width: 500rpx; text-align: center; }
</style>
