# TTS 语音合成方案升级：预生成 MP3 替代 Web Speech API

## 概述

将 GuidedPlayer 的语音播放从浏览器 Web Speech API（音质僵硬）升级为预生成 MP3 方案。使用 Python `edge-tts` 库生成高质量神经网络语音（`zh-CN-XiaoxiaoNeural`），前端用 `new Audio(url).play()` 播放。

## 当前状态

- `scripts/generate-tts.py` 已创建（76行），`edge-tts` v7.2.8 已安装
- `public/audio/` 目录尚未创建，MP3 文件尚未生成
- `GuidedPlayer.jsx` 当前使用 `useTTS` hook（Web Speech API）
- `cbtContent.js` 中有 4 个课程包含 guided 练习（课程 4/5/6/9），共 28 个语音段落

## 方案对比结论

| 方案 | 自然度 | 可靠性 | 成本 | 离线 | 复杂度 |
|------|:---:|:---:|:---:|:---:|:---:|
| **预生成 MP3（推荐）** | 9/10 | 10/10 | 免费 | 完全支持 | 极低 |
| Edge TTS WebSocket | 9/10 | 4/10 | 免费 | 不支持 | 高 |
| Web Speech API（当前） | 3/10 | 7/10 | 免费 | 部分支持 | 低 |
| Azure 云服务 | 9.5/10 | 9/10 | 免费/低价 | 不支持 | 中 |

**选择预生成 MP3 的理由**：引导冥想文本固定（28段），天然适合预生成模式；音质优秀（与 Azure 同引擎）；零延迟播放；完全离线可用；实现最简单。

## 实施步骤

### 步骤 1：运行脚本生成 MP3 文件

```bash
cd /sessions/69f1935cddc02792ee45ea27/workspace/shen-gui-tu
python scripts/generate-tts.py
```

- 生成 28 个 MP3 文件到 `public/audio/`
- 文件命名格式：`{courseId}_{stepIdx}_{segIdx}.mp3`
- 语音：`zh-CN-XiaoxiaoNeural`，语速 `-10%`
- 已有文件自动跳过

### 步骤 2：修改 cbtContent.js 添加 audio 路径

为每个 guided segment 添加 `audio` 字段，指向对应的 MP3 文件路径。

**课程 4（身体扫描，step index 1）**：
- 10 个 segment，audio 路径为 `/audio/4_1_0.mp3` 到 `/audio/4_1_9.mp3`

**课程 5（三分钟呼吸空间，step index 1）**：
- 3 个 segment，audio 路径为 `/audio/5_1_0.mp3` 到 `/audio/5_1_2.mp3`

**课程 6（与低落情绪共处，step index 2）**：
- 7 个 segment，audio 路径为 `/audio/6_2_0.mp3` 到 `/audio/6_2_6.mp3`

**课程 9（正念自我关怀，step index 2）**：
- 8 个 segment，audio 路径为 `/audio/9_3_0.mp3` 到 `/audio/9_3_7.mp3`

### 步骤 3：修改 GuidedPlayer.jsx 使用 Audio 播放

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

### 步骤 4：构建验证

```bash
npx vite build
```

确认构建成功，MP3 文件被正确包含。

## 涉及文件

| 操作 | 文件 |
|------|------|
| 执行 | `scripts/generate-tts.py` |
| 修改 | `src/data/cbtContent.js` |
| 修改 | `src/components/GuidedPlayer/GuidedPlayer.jsx` |
| 保留 | `src/hooks/useTTS.js`（不删除，备用） |
| 保留 | `src/hooks/useEdgeTTS.js`（不删除，备用） |

## 假设与决策

1. 使用 `zh-CN-XiaoxiaoNeural` 女声语音（温柔、适合冥想引导场景）
2. 语速设为 `-10%`（比正常语速稍慢，适合放松引导）
3. 不集成到构建流程（手动运行即可，文本不频繁变更）
4. 不删除旧的 TTS hooks（保留作为参考和降级方案）
