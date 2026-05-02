# TTS 无声音问题 — 根因分析与修复

## 根本原因

**`useEffect` 的 cleanup 函数在每次重渲染时都会执行 `tts.cancel()`，杀死了刚启动的语音。**

### Bug 链条

```
用户点击 "开始引导"
→ handlePlay() 执行
→ setPlaying(true)        ← 触发状态更新
→ runSegment(0) 执行
→ tts.speak(seg.text)     ← 语音开始
→ React 重渲染（因为 playing 状态变了）
→ useEffect([tts]) 的 cleanup 执行
→ tts.cancel()            ← speechSynthesis.cancel() 杀死语音！
→ 用户听不到声音
```

### 为什么 cleanup 会执行？

`useEffect` 的依赖数组是 `[tts]`。`tts` 是 `useTTS()` 返回的对象：

```js
const tts = useTTS()
// tts = { speak, cancel, pause, resume, status, supported }
```

虽然 `speak`/`cancel` 等是 `useCallback` 包裹的稳定引用，但 `status` 是 `useState` 的值——**当 `speak()` 被调用后，`onstart` 回调会 `setStatus('speaking')`，这又触发 `useTTS` 重渲染，返回新的 `tts` 对象**。新对象 !== 旧对象 → `useEffect` 认为 deps 变了 → 先执行 cleanup → `tts.cancel()` → 语音被杀。

## 修复方案

### 方案：移除 useEffect 的 tts 依赖，改用 ref 跟踪

**修改** `src/components/GuidedPlayer/GuidedPlayer.jsx`：

1. 用 `ttsRef = useRef(tts)` 保存 tts 引用
2. `useEffect` cleanup 中使用 `ttsRef.current.cancel()` 而非 `tts.cancel()`
3. `useEffect` 依赖数组改为空 `[]`（只在组件卸载时 cleanup）

这样 cleanup 不会因为 tts 对象引用变化而重复执行。

## 文件清单

| 操作 | 文件 |
|------|------|
| 修改 | `src/components/GuidedPlayer/GuidedPlayer.jsx` |
