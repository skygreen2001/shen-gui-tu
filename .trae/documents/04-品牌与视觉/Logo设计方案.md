# 「申归途」新 Logo 设计计划

## 概述

为「申归途」抑郁症复发预防应用创作一个更简洁的新 logo，以「申」字为核心主体，融合 S 曲线、十字结构、守护光环等元素，使用品牌三色（Orange/Blue/Green）均衡配色，柔和圆润风格。

## 设计方向确认

| 维度 | 用户选择 |
|------|---------|
| 核心方向 | 字形融合，以「申」字为主体 |
| 辅助元素 | S 曲线、十字结构、守护光环融入「申」字 |
| 视觉风格 | 柔和圆润（有粗细变化和轻微立体感，比当前 3D 更克制） |
| 色彩方案 | 三色均衡 — Orange `#d97757` + Blue `#6a9bcc` + Green `#788c5d` |
| 背景 | Light `#faf9f5`（品牌浅色） |

## 三个设计方案

### 方案一：「归途之光」

- **图形**：圆润「申」字 + 外围 270° 守护光环弧线
- **构成**：圆角矩形外框(Orange) + S 曲线竖笔(Blue) + 两条横线(Green) + 渐变光环弧线(Blue→Green)
- **象征**：外框=守护之屋，S 竖笔=归途之路，十字交叉=希望之锚，光环=持续陪伴
- **风格**：纯线条结构，无填充，最简洁
- **小尺寸**：最优（线条结构简单，16px 也可辨识）

### 方案二：「申之盾」

- **图形**：「申」字融入柔和盾形轮廓
- **构成**：盾形外廓(Orange 浅填充+描边) + S 曲线竖笔(Blue) + 两条横线(Green) + 中心发光点(白色)
- **象征**：盾形=安全堡垒，申字=上海的守护，十字=坚定锚点，发光点=希望不灭
- **风格**：轻微立体感（盾形浅填充），稳重安全感
- **小尺寸**：良好（盾形轮廓独特）

### 方案三：「申途」

- **图形**：「申」字竖笔演化为 S 道路，横笔演化为十字路口
- **构成**：圆角矩形外框(Orange) + S 道路(Blue 粗线+边线) + 横线(Green) + 路口节点 + 起点标记 + 终点箭头
- **象征**：S 道路=归途，十字路口=选择与方向，外框=上海的窗口，起终点=旅程感
- **风格**：轻微立体感（微妙投影），现代叙事感
- **小尺寸**：良好（需简化节点和箭头）

## 实施步骤

### 步骤 1：用户选定方案

通过 AskUserQuestion 让用户从三个方案中选择。

### 步骤 2：SVG 精细实现

基于选定方案的 SVG 框架，精细调整：
- 曲线弧度、粗细比例、间距微调
- 确保在 512×512 viewBox 下各元素比例协调
- 使用 `stroke-linecap="round"` 保证圆润感

### 步骤 3：生成预览图

用 ImageMagick 将 SVG 转换为 512×512 PNG 预览：
```bash
convert favicon.svg -resize 512x512 preview.png
```

### 步骤 4：生成多尺寸 PNG

```bash
SOURCE="public/favicon.svg"
convert "$SOURCE" -resize 16x16 public/favicon-16x16.png
convert "$SOURCE" -resize 32x32 public/favicon-32x32.png
convert "$SOURCE" -resize 48x48 public/favicon-48x48.png
convert "$SOURCE" -resize 180x180 public/apple-touch-icon.png
convert "$SOURCE" -resize 192x192 public/android-chrome-192x192.png
convert "$SOURCE" -resize 512x512 public/android-chrome-512x512.png
```

### 步骤 5：生成 favicon.ico

```bash
convert public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/favicon.ico
```

### 步骤 6：清理中间文件

删除 `public/favicon-48x48.png`。

### 步骤 7：验证

- `npm run build` 确认构建成功
- 检查 `dist/` 中所有 favicon 文件正确
- 目视检查各尺寸 PNG 清晰度

## 文件变更汇总

| 操作 | 文件 |
|------|------|
| 覆盖 | `public/favicon.svg`（新品牌 logo） |
| 覆盖 | `public/favicon.ico` |
| 覆盖 | `public/favicon-32x32.png` |
| 覆盖 | `public/favicon-16x16.png` |
| 覆盖 | `public/apple-touch-icon.png` |
| 覆盖 | `public/android-chrome-192x192.png` |
| 覆盖 | `public/android-chrome-512x512.png` |
| 新增 | `logo.png`（workspace 根目录，新 logo 512px） |

> 注：`index.html` 已在上次 favicon 任务中添加了完整的 `<link>` 标签，无需修改。
