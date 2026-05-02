# TTS 音质优化方案 — 预生成 MP3 + Audio 播放

## 概要

Web Speech API 音质僵硬，Edge TTS WebSocket 在浏览器中不稳定。**最佳方案**：用 Python `edge-tts` 库在构建时预生成所有引导词的 MP3 文件，前端用 `<audio>` 标签播放。音质接近真人，零运行时依赖，100% 可靠。

---

## 一、方案对比

| 方案 | 音质 | 可靠性 | 复杂度 | 离线 |
|------|------|--------|--------|------|
| Web Speech API（当前） | ❌ 僵硬 | ✅ | 低 | ✅ |
| Edge TTS WebSocket（已废弃） | ✅ 自然 | ❌ 不稳定 | 高 | ❌ |
| **预生成 MP3 + Audio** | ✅ 自然 | ✅ 100% | 低 | ✅ |

## 二、实施步骤

### Step 1：安装 edge-tts 并生成 MP3

在项目根目录执行 Python 脚本，为 4 个引导练习的所有段落生成 MP3 文件：

```bash
pip install edge-tts
python scripts/generate-tts.py
```

生成文件保存到 `public/audio/` 目录，命名规则：`{courseId}_{stepIdx}_{segIdx}.mp3`

共约 30 个 MP3 文件，每个 5-15 秒，总体积约 2-3 MB。

### Step 2：创建生成脚本

**新建** `scripts/generate-tts.py`

遍历 `cbtContent.js` 中所有 `guided` 段落，调用 `edge-tts` 生成 MP3：
- 语音：`zh-CN-XiaoxiaoNeural`（温柔女声）
- 语速：`-10%`
- 输出：`public/audio/` 目录

### Step 3：扩展 guided 数据结构

**修改** `src/data/cbtContent.js`

为每个 segment 添加 `audio` 字段，指向预生成的 MP3 路径：
```js
{ text: '注意呼吸3次', duration: 5000, audio: '/audio/4_1_0.mp3' }
```

### Step 4：修改 GuidedPlayer 使用 Audio 播放

**修改** `src/components/GuidedPlayer/GuidedPlayer.jsx`

- 移除 `useTTS` Hook 依赖
- 使用 `new Audio(url).play()` 播放 MP3
- 暂停/恢复使用 `audio.pause()` / `audio.play()`
- 停止使用 `audio.pause(); audio.currentTime = 0`
- 如果 MP3 文件不存在，静默降级（只显示文字+动画）

### Step 5：构建验证

`npx vite build` 确认 0 错误。

---

## 三、文件清单

| 操作 | 文件 |
|------|------|
| 新建 | `scripts/generate-tts.py`（MP3 生成脚本） |
| 新建 | `public/audio/*.mp3`（约 30 个预生成音频文件） |
| 修改 | `src/data/cbtContent.js`（guided segments 添加 audio 路径） |
| 修改 | `src/components/GuidedPlayer/GuidedPlayer.jsx`（Audio 播放替代 TTS） |
| 保留 | `src/hooks/useTTS.js`（不再使用，不删除） |
| 保留 | `src/hooks/useEdgeTTS.js`（不再使用，不删除） |

---

## 四、优势

1. **音质最佳**：微软神经网络语音，接近真人
2. **100% 可靠**：MP3 文件本地托管，无网络依赖
3. **零运行时复杂度**：`new Audio(url).play()` 一行代码
4. **可离线使用**：MP3 随应用打包
5. **构建时生成**：开发者运行一次脚本即可，后续无需重复

---

## 五、验证

- `npx vite build` 0 错误
- 浏览器打开课程 → 播放引导 → 听到自然流畅的语音
- 暂停/恢复/跳过功能正常
