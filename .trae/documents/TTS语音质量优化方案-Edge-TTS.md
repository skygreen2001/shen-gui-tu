# TTS 语音质量优化方案 — Edge TTS 替换 Web Speech API

## 概要

当前使用 Web Speech API（`speechSynthesis`）实现 TTS，音质僵硬、语调不自然。调研发现 **Edge TTS**（微软 Edge 浏览器在线语音服务）可通过 WebSocket 直接从浏览器调用，音质接近真人，免费无需 API Key，支持 20+ 种中文高质量神经网络语音。

**核心方案**：用 Edge TTS WebSocket 协议替换 Web Speech API，纯前端实现，无需后端服务器。

---

## 一、技术调研结论

### Edge TTS vs Web Speech API 对比

| 维度 | Web Speech API（当前） | Edge TTS（目标） |
|------|----------------------|-----------------|
| 音质 | 系统引擎，僵硬机械 | 神经网络语音，接近真人 |
| 中文语音 | 依赖系统安装的语音 | 20+ 种高质量中文语音（晓晓、云希等） |
| 语速控制 | 支持 | 支持，更精细 |
| 网络要求 | 离线可用 | 需要联网 |
| API Key | 不需要 | 不需要 |
| 浏览器兼容 | 主流浏览器 | 通过 WebSocket 直接连接 |
| 稳定性 | 微软可能随时降级 | 免费服务，非官方API，存在不稳定风险 |

### Edge TTS 技术原理

```
浏览器 → WebSocket → wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=xxx&ConnectionId=xxx
→ 发送 SSML 配置消息
→ 发送文本消息
← 接收音频流（MP3 分片）
→ AudioContext 解码播放
```

### 关键技术细节

1. **TrustedClientToken**：固定值 `6A5AA1D4EAFF4E9FB37E23D68491D6F4`（来自 Edge 浏览器逆向）
2. **ConnectionId**：随机 UUID
3. **语音选择**：`zh-CN-XiaoxiaoNeural`（女声，温柔，适合冥想引导）
4. **SSML 格式**：`<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'><voice name='zh-CN-XiaoxiaoNeural'><prosody rate='+0%' pitch='+0Hz'>文本</prosody></voice></speak>`
5. **音频格式**：返回 MP3 分片（二进制），需用 AudioContext 解码

### 风险评估

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| 微软封禁非 Edge 浏览器请求 | 低 | 高 | 降级到 Web Speech API |
| Token 过期 | 低 | 中 | 可从 Edge 浏览器更新 |
| CORS 限制 | 中 | 高 | WebSocket 不受 CORS 限制 |
| 服务不稳定 | 低 | 中 | 降级到 Web Speech API |

> **关键发现**：WebSocket 连接不受 CORS 限制，因此纯前端可以直接连接微软 TTS 服务。

---

## 二、实施方案

### 方案概述

创建 `useEdgeTTS` 自定义 Hook，封装 Edge TTS WebSocket 协议，提供与 `speechSynthesis` 相同的接口。在 GuidedPlayer 中优先使用 Edge TTS，失败时降级到 Web Speech API。

### Step 1：创建 useEdgeTTS Hook

**新建文件**：`src/hooks/useEdgeTTS.js`

功能：
- `speak(text, options)` — 朗读文本，返回 Promise
- `pause()` / `resume()` / `cancel()` — 控制播放
- `speaking` 状态
- 自动降级：Edge TTS 失败时回退到 Web Speech API

核心实现逻辑：
```js
// 1. 生成 ConnectionId (UUID)
// 2. 建立 WebSocket 连接
// 3. 发送配置消息（SSML 格式 + 语音参数）
// 4. 发送文本消息
// 5. 接收音频二进制分片
// 6. 用 AudioContext 解码 MP3 → AudioBufferSourceNode 播放
// 7. 播放结束 resolve Promise
```

### Step 2：修改 GuidedPlayer 使用 useEdgeTTS

**修改文件**：`src/components/GuidedPlayer/GuidedPlayer.jsx`

改动：
- 导入 `useEdgeTTS` 替换 `speechSynthesis`
- 播放时调用 `edgeTTS.speak(text)` 
- 暂停/停止调用 `edgeTTS.pause()` / `edgeTTS.cancel()`
- 降级逻辑由 Hook 内部处理，组件无需感知

### Step 3：构建验证

`npx vite build` 确认 0 错误。

---

## 三、文件清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `src/hooks/useEdgeTTS.js` | Edge TTS WebSocket Hook（含降级逻辑） |
| 修改 | `src/components/GuidedPlayer/GuidedPlayer.jsx` | 替换 speechSynthesis 为 useEdgeTTS |

---

## 四、推荐语音

| 语音 ID | 特点 | 适用场景 |
|---------|------|---------|
| `zh-CN-XiaoxiaoNeural` | 女声，温柔亲切 | 冥想引导（首选） |
| `zh-CN-YunxiNeural` | 男声，自然流畅 | 备选 |
| `zh-CN-XiaoyiNeural` | 女声，活泼 | 备选 |

语速建议：`rate='-10%'`（略慢，适合冥想引导）

---

## 五、降级策略

```
Edge TTS 尝试连接
  ├─ 成功 → 使用 Edge TTS 播放
  └─ 失败（超时/网络错误/服务不可用）
       └─ 自动降级到 Web Speech API
            └─ 仍然失败 → 仅显示文字 + 动画（静音模式）
```

降级对用户透明，组件接口不变。

---

## 六、验证

- `npx vite build` 0 错误
- 浏览器打开 CBT 课程 → 身体扫描入门 → 第2步 → 点击播放
- 确认听到自然流畅的中文语音（非机械声）
- 断网后确认降级到 Web Speech API
- 暂停/恢复/停止功能正常
