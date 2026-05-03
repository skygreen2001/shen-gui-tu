# 「申归途」Favicon 实施计划

## 概述

基于用户上传的品牌 logo（3D 风格房子+道路图标），为「申归途」Web 应用生成完整的 favicon 图标集，并在 `index.html` 中正确引用，替换现有的 Vite 默认紫色闪电图标。

## 当前状态分析

| 项目 | 详情 |
|------|------|
| 项目路径 | `shen-gui-tu/`（Vite + React） |
| 现有 favicon | `public/favicon.svg`（Vite 默认紫色闪电，与品牌无关） |
| index.html | `<head>` 中**无**任何 `<link rel="icon">` 标签 |
| 品牌 logo | `logo.png`，2048×2048 RGBA PNG |
| PWA 配置 | 无（无 manifest.json） |
| 可用工具 | ImageMagick、Python Pillow 均已安装 |

## 实施步骤

### 步骤 1：生成各尺寸 PNG 文件

使用 ImageMagick 从 `logo.png` 缩放生成：

```bash
SOURCE="/sessions/69f69a1b48cfac243c9a3b95/workspace/logo.png"
DEST="/sessions/69f69a1b48cfac243c9a3b95/workspace/shen-gui-tu/public"

convert "$SOURCE" -resize 16x16 "$DEST/favicon-16x16.png"
convert "$SOURCE" -resize 32x32 "$DEST/favicon-32x32.png"
convert "$SOURCE" -resize 48x48 "$DEST/favicon-48x48.png"
convert "$SOURCE" -resize 180x180 "$DEST/apple-touch-icon.png"
convert "$SOURCE" -resize 192x192 "$DEST/android-chrome-192x192.png"
convert "$SOURCE" -resize 512x512 "$DEST/android-chrome-512x512.png"
```

### 步骤 2：生成多尺寸 favicon.ico

```bash
DEST="/sessions/69f69a1b48cfac243c9a3b95/workspace/shen-gui-tu/public"
convert "$DEST/favicon-16x16.png" "$DEST/favicon-32x32.png" "$DEST/favicon-48x48.png" "$DEST/favicon.ico"
```

### 步骤 3：替换 SVG favicon

用品牌色（Orange `#d97757`、Blue `#6a9bcc`、Green `#788c5d`）创建简化的 SVG favicon，覆盖现有 `public/favicon.svg`。由于原始 logo 是 3D 位图，SVG 版本为简化几何风格，保留核心视觉元素（房子+道路）。

### 步骤 4：清理中间文件

删除仅用于 ICO 打包的 `favicon-48x48.png`。

### 步骤 5：修改 index.html

在 `<head>` 的 `<title>` 后添加：

```html
<link rel="icon" type="image/svg+xml" href="./favicon.svg" />
<link rel="icon" type="image/x-icon" sizes="48x48" href="./favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
```

### 步骤 6：验证

- 启动 `npm run dev`，检查浏览器标签页图标
- `npm run build && npm run preview` 确认构建产物正确
- 清除缓存后强制刷新验证

## 文件变更汇总

| 操作 | 文件 |
|------|------|
| 覆盖 | `public/favicon.svg` |
| 新增 | `public/favicon.ico` |
| 新增 | `public/favicon-32x32.png` |
| 新增 | `public/favicon-16x16.png` |
| 新增 | `public/apple-touch-icon.png` |
| 新增 | `public/android-chrome-192x192.png`（预留） |
| 新增 | `public/android-chrome-512x512.png`（预留） |
| 修改 | `index.html` |

## 注意事项

1. **小尺寸清晰度**：3D logo 缩放到 16×16 时细节会丢失，生成后需目视检查
2. **浏览器缓存**：favicon 更新后需强制刷新（Ctrl+Shift+R）
3. **Vite 行为**：`public/` 下文件会原样复制到 `dist/`，无需额外配置
4. **PWA 预留**：已生成 Android Chrome 尺寸图标，为未来 PWA 做准备
