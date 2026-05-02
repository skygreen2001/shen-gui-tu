# 重置按钮确认弹窗改造

## 概述

将 Dashboard 的"重置所有数据"按钮从 `window.confirm`（原生 alert 风格）改为自定义确认弹窗组件，与应用整体 UI 风格一致。

## 实施步骤

### 步骤 1：创建 ConfirmDialog 组件

**新建文件**：`src/components/ConfirmDialog/ConfirmDialog.jsx` + `ConfirmDialog.module.css`

轻量确认弹窗：
- Props：`open`, `title`, `message`, `onConfirm`, `onCancel`
- 遮罩层 + 居中卡片 + 标题 + 内容 + 两个按钮（取消/确认）
- 样式：圆角卡片、半透明遮罩、与应用设计语言一致
- 点击遮罩或取消按钮关闭

### 步骤 2：修改 Dashboard 使用 ConfirmDialog

**文件**：`src/pages/Dashboard/Dashboard.jsx`

- 导入 ConfirmDialog
- 添加 `showResetConfirm` state
- 将 `window.confirm(...)` 替换为 `setShowResetConfirm(true)`
- 确认回调中执行清除逻辑 + 刷新

### 步骤 3：构建验证

`npx vite build`

## 涉及文件

| 操作 | 文件 |
|------|------|
| 新建 | `src/components/ConfirmDialog/ConfirmDialog.jsx` |
| 新建 | `src/components/ConfirmDialog/ConfirmDialog.module.css` |
| 修改 | `src/pages/Dashboard/Dashboard.jsx` |
