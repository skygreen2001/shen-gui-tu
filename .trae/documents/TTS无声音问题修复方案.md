# TTS 无声音问题调查与修复方案

## 根因分析

经过多轮排查，问题有多个层面：

### 1. 架构过度复杂（主因）
当前 `useEdgeTTS` Hook 试图同时管理 Edge TTS WebSocket + Web Speech API fallback + 状态切换，逻辑复杂导致多个 bug 叠加：
- `cancel()` 在 `speak()` 内部同步调用，可能与后续 `speechSynthesis.speak()` 冲突
- `edgeSucceededRef` 状态竞争
- Edge TTS WebSocket 连接/超时/降级时序问题

### 2. 测试环境限制
MCP 浏览器工具使用 Chromium WebView，可能：
- 无中文语音包 → `speechSynthesis` 静默失败
- 无音频输出设备 → `AudioContext` 无声
- Edge TTS WebSocket 被网络策略阻止

### 3. 无法在当前环境验证
由于无法在 MCP WebView 中听到声音，每次修改都是"盲改"，无法确认修复效果。

## 解决方案

**彻底简化**：移除 Edge TTS，直接使用 Web Speech API，添加状态反馈让用户知道发生了什么。

### Step 1：简化 useEdgeTTS → useTTS

**重写** `src/hooks/useEdgeTTS.js` → 重命名为 `src/hooks/useTTS.js`

功能极简化：
- `speak(text)` — 调用 `speechSynthesis.speak()`
- `cancel()` — 调用 `speechSynthesis.cancel()`
- `pause()` / `resume()`
- `supported` — 是否支持 TTS
- `status` — 'idle' | 'speaking' | 'paused'

不尝试 Edge TTS，不做降级，不做竞速。就是纯粹的 Web Speech API 封装。

### Step 2：修改 GuidedPlayer 使用简化版

**修改** `src/components/GuidedPlayer/GuidedPlayer.jsx`
- 导入 `useTTS` 替换 `useEdgeTTS`
- 显示 TTS 状态：不支持时显示提示
- 保留所有动画和定时器逻辑不变

### Step 3：构建验证

`npx vite build` 确认 0 错误。

## 文件清单

| 操作 | 文件 |
|------|------|
| 新建 | `src/hooks/useTTS.js`（替代 useEdgeTTS.js） |
| 修改 | `src/components/GuidedPlayer/GuidedPlayer.jsx` |
| 保留 | `src/hooks/useEdgeTTS.js`（不删除，但不再使用） |
