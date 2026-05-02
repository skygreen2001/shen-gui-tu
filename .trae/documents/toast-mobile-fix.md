# Toast 提示信息手机屏幕自适应

## 概述

Toast 组件使用 `white-space: nowrap` 导致长文本在手机屏幕上溢出。需要让 Toast 自适应屏幕宽度，支持多行文本换行。

## 修改

**文件**：`src/components/Toast/Toast.module.css`

将 `.toast` 的样式调整：
- 移除 `white-space: nowrap`
- 添加 `max-width: calc(100vw - 32px)` 限制最大宽度
- 添加 `text-align: center` 保持居中
- 添加 `word-break: break-word` 确保长单词也能换行

## 验证

- `npx vite build` 构建通过
