# Toast 桌面端超出 APP 容器修复

## 概述

`#root` 容器最大宽度 1126px 居中，但 Toast 用 `left: 4vw; right: 4vw` 相对视口定位，桌面端会超出 APP 边界。

## 修复

**文件**：`src/components/Toast/Toast.module.css`

将 `left: 4vw; right: 4vw` 改为居中 + `max-width: 92%`，并限制最大宽度不超过 500px：
- `left: 50%; transform: translateX(-50%);` 居中
- `width: auto; max-width: min(92vw, 500px);`
- `.show` 中保留 `translateX(-50%)`

## 验证

`npx vite build`
