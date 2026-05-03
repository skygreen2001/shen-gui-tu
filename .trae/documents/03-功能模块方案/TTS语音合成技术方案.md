# TTS 语音合成技术方案（合并文档）

> 本文档合并了 TTS 相关的全部技术方案，记录了从问题排查到最终方案的完整演进过程。

---

## 一、问题起源：TTS 无声音 Bug

### 1.1 根因分析

经过多轮排查，问题有多个层面：

#### 层面一：useEffect cleanup 杀死语音（直接原因）

`useEffect` 的 cleanup 函数在每次重渲染时执行 `tts.cancel()`，杀死了刚启动的语音。

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

**原因**：`useEffect` 依赖数组是 `[tts]`。`tts` 是 `useTTS()` 返回的对象，其中 `status` 是 `useState` 的值——当 `speak()` 被调用后，`onstart` 回调会 `setStatus('speaking')`，触发 `useTTS` 重渲染，返回新的 `tts` 对象。新对象 !== 旧对象 → `useEffect` 认为 deps 变了 → 先执行 cleanup → `tts.cancel()` → 语音被杀。

#### 层面二：架构过度复杂（深层原因）

`useEdgeTTS` Hook 试图同时管理 Edge TTS WebSocket + Web Speech API fallback + 状态切换，逻辑复杂导致多个 bug 叠加：
- `cancel()` 在 `speak()` 内部同步调用，可能与后续 `speechSynthesis.speak()` 冲突
- `edgeSucceededRef` 状态竞争
- Edge TTS WebSocket 连接/超时/降级时序问题

#### 层面三：测试环境限制

MCP 浏览器工具使用 Chromium WebView，可能：
- 无中文语音包 → `speechSynthesis` 静默失败
- 无音频输出设备 → `AudioContext` 无声
- Edge TTS WebSocket 被网络策略阻止

### 1.2 临时修复方案（已实施）

**修改** `src/components/GuidedPlayer/GuidedPlayer.jsx`：
1. 用 `ttsRef = useRef(tts)` 保存 tts 引用
2. `useEffect` cleanup 中使用 `ttsRef.current.cancel()` 而非 `tts.cancel()`
3. `useEffect` 依赖数组改为空 `[]`（只在组件卸载时 cleanup）

### 1.3 简化修复方案（已实施）

彻底简化：移除 Edge TTS，直接使用 Web Speech API。

**新建** `src/hooks/useTTS.js`（替代 `useEdgeTTS.js`），功能极简化：
- `speak(text)` — 调用 `speechSynthesis.speak()`
- `cancel()` — 调用 `speechSynthesis.cancel()`
- `pause()` / `resume()`
- `supported` — 是否支持 TTS
- `status` — 'idle' | 'speaking' | 'paused'

不尝试 Edge TTS，不做降级，不做竞速。就是纯粹的 Web Speech API 封装。

---

## 二、方案调研：Edge TTS WebSocket

### 2.1 Edge TTS vs Web Speech API 对比

| 维度 | Web Speech API（当前） | Edge TTS（目标） |
|------|----------------------|-----------------|
| 音质 | 系统引擎，僵硬机械 | 神经网络语音，接近真人 |
| 中文语音 | 依赖系统安装的语音 | 20+ 种高质量中文语音（晓晓、云希等） |
| 语速控制 | 支持 | 支持，更精细 |
| 网络要求 | 离线可用 | 需要联网 |
| API Key | 不需要 | 不需要 |
| 浏览器兼容 | 主流浏览器 | 通过 WebSocket 直接连接 |
| 稳定性 | 微软可能随时降级 | 免费服务，非官方API，存在不稳定风险 |

### 2.2 Edge TTS 技术原理

```
浏览器 → WebSocket → wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=xxx&ConnectionId=xxx
→ 发送 SSML 配置消息
→ 发送文本消息
← 接收音频流（MP3 分片）
→ AudioContext 解码播放
```

### 2.3 关键技术细节

1. **TrustedClientToken**：固定值 `6A5AA1D4EAFF4E9FB37E23D68491D6F4`（来自 Edge 浏览器逆向）
2. **ConnectionId**：随机 UUID
3. **语音选择**：`zh-CN-XiaoxiaoNeural`（女声，温柔，适合冥想引导）
4. **SSML 格式**：`<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'><voice name='zh-CN-XiaoxiaoNeural'><prosody rate='+0%' pitch='+0Hz'>文本</prosody></voice></speak>`
5. **音频格式**：返回 MP3 分片（二进制），需用 AudioContext 解码

### 2.4 风险评估

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| 微软封禁非 Edge 浏览器请求 | 低 | 高 | 降级到 Web Speech API |
| Token 过期 | 低 | 中 | 可从 Edge 浏览器更新 |
| CORS 限制 | 中 | 高 | WebSocket 不受 CORS 限制 |
| 服务不稳定 | 低 | 中 | 降级到 Web Speech API |

> **关键发现**：WebSocket 连接不受 CORS 限制，因此纯前端可以直接连接微软 TTS 服务。

### 2.5 Edge TTS 方案实施（已废弃）

曾创建 `useEdgeTTS` Hook 封装 Edge TTS WebSocket 协议，但因浏览器中不稳定，最终废弃。

---

## 三、最终方案：预生成 MP3 + Audio 播放

### 3.1 方案对比结论

| 方案 | 自然度 | 可靠性 | 成本 | 离线 | 复杂度 |
|------|:---:|:---:|:---:|:---:|:---:|
| **预生成 MP3（✅ 最终选择）** | 9/10 | 10/10 | 免费 | 完全支持 | 极低 |
| Edge TTS WebSocket（已废弃） | 9/10 | 4/10 | 免费 | 不支持 | 高 |
| Web Speech API（已替换） | 3/10 | 7/10 | 免费 | 部分支持 | 低 |
| Azure 云服务（未采用） | 9.5/10 | 9/10 | 免费/低价 | 不支持 | 中 |

**选择预生成 MP3 的理由**：引导冥想文本固定（28段），天然适合预生成模式；音质优秀（与 Azure 同引擎）；零延迟播放；完全离线可用；实现最简单。

### 3.2 语音配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 语音 | `zh-CN-XiaoxiaoNeural` | 女声，温柔亲切，适合冥想引导 |
| 语速 | `-10%` | 比正常语速稍慢，适合放松引导 |
| 备选语音 | `zh-CN-YunxiNeural` | 男声，自然流畅 |
| 备选语音 | `zh-CN-XiaoyiNeural` | 女声，活泼 |

### 3.3 实施步骤

#### 步骤 1：运行脚本生成 MP3 文件

```bash
pip install edge-tts
python scripts/generate-tts.py
```

- 生成 28 个 MP3 文件到 `public/audio/`
- 文件命名格式：`{courseId}_{stepIdx}_{segIdx}.mp3`
- 已有文件自动跳过
- 共约 28 个 MP3 文件，每个 5-15 秒，总体积约 2-3 MB

#### 步骤 2：修改 cbtContent.js 添加 audio 路径

为每个 guided segment 添加 `audio` 字段，指向对应的 MP3 文件路径。

| 课程 | 名称 | Step Index | 段落数 | Audio 路径 |
|------|------|-----------|--------|-----------|
| 课程 4 | 身体扫描入门 | 1 | 10 | `/audio/4_1_0.mp3` ~ `/audio/4_1_9.mp3` |
| 课程 5 | 三分钟呼吸空间 | 1 | 3 | `/audio/5_1_0.mp3` ~ `/audio/5_1_2.mp3` |
| 课程 6 | 与低落情绪共处 | 2 | 7 | `/audio/6_2_0.mp3` ~ `/audio/6_2_6.mp3` |
| 课程 9 | 正念自我关怀 | 2 | 8 | `/audio/9_3_0.mp3` ~ `/audio/9_3_7.mp3` |

数据结构示例：
```js
{ text: '注意呼吸3次', duration: 5000, audio: '/audio/4_1_0.mp3' }
```

#### 步骤 3：修改 GuidedPlayer.jsx 使用 Audio 播放

核心改动：
1. 移除 `import useTTS` 和 `tts` 相关逻辑
2. 使用 `new Audio(seg.audio)` 播放 MP3
3. 用 `audioRef` 管理 Audio 对象生命周期
4. 利用 Audio API 原生的 `pause()`/`play()`/`onended` 实现暂停/恢复/段落切换
5. 保留降级逻辑：如果 `audio` 字段不存在，显示文字引导（静默降级）

关键实现要点：
- `handlePlay`：在用户点击回调中创建 Audio 并 play()（满足移动端自动播放策略）
- `handlePause`：`audioRef.current.pause()`
- `handleStop`：`audioRef.current.pause(); audioRef.current.currentTime = 0`
- `skipToNext`：停止当前 Audio，播放下一段
- `useEffect` cleanup：`audioRef.current?.pause()`
- 预加载下一段：当前段播放时预创建下一段 Audio 对象

#### 步骤 4：构建验证

```bash
npx vite build
```

确认构建成功，MP3 文件被正确包含。

### 3.4 方案优势

1. **音质最佳**：微软神经网络语音，接近真人
2. **100% 可靠**：MP3 文件本地托管，无网络依赖
3. **零运行时复杂度**：`new Audio(url).play()` 一行代码
4. **可离线使用**：MP3 随应用打包
5. **构建时生成**：开发者运行一次脚本即可，后续无需重复

### 3.5 降级策略

```
用户点击播放
  ├─ audio 字段存在 → new Audio(url).play() 播放 MP3
  └─ audio 字段不存在
       └─ 静默降级：仅显示文字引导 + 动画（无声音）
```

---

## 四、涉及文件清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 执行 | `scripts/generate-tts.py` | MP3 生成脚本（76行，edge-tts v7.2.8） |
| 生成 | `public/audio/*.mp3` | 28 个预生成音频文件 |
| 修改 | `src/data/cbtContent.js` | guided segments 添加 audio 路径 |
| 修改 | `src/components/GuidedPlayer/GuidedPlayer.jsx` | Audio 播放替代 TTS |
| 保留 | `src/hooks/useTTS.js` | 不再使用，备用 |
| 保留 | `src/hooks/useEdgeTTS.js` | 不再使用，备用 |

---

## 五、验证清单

- [ ] `npx vite build` 0 错误
- [ ] 浏览器打开课程 → 播放引导 → 听到自然流畅的语音
- [ ] 暂停/恢复/跳过功能正常
- [ ] MP3 文件不存在时静默降级（只显示文字+动画）
- [ ] 移动端自动播放策略兼容（用户点击触发）

---

## 六、假设与决策

1. 使用 `zh-CN-XiaoxiaoNeural` 女声语音（温柔、适合冥想引导场景）
2. 语速设为 `-10%`（比正常语速稍慢，适合放松引导）
3. 不集成到构建流程（手动运行即可，文本不频繁变更）
4. 不删除旧的 TTS hooks（保留作为参考和降级方案）
