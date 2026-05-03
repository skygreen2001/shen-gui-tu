# UI 组件修复与改造（合并文档）

> 本文档合并了 Toast 组件修复、ConfirmDialog 组件创建、开发环境重置按钮相关的全部技术方案。

---

## 一、Toast 提示组件修复

### 1.1 问题背景

Toast 组件存在两个布局问题：
1. **桌面端超出 APP 容器**：`#root` 容器最大宽度 1126px 居中，但 Toast 用 `left: 4vw; right: 4vw` 相对视口定位，桌面端会超出 APP 边界
2. **移动端长文本溢出**：使用 `white-space: nowrap` 导致长文本在手机屏幕上溢出

### 1.2 修复方案

**文件**：`src/components/Toast/Toast.module.css`

#### 桌面端居中修复

将 `left: 4vw; right: 4vw` 改为居中 + 限制最大宽度：
- `left: 50%; transform: translateX(-50%);` 居中
- `width: auto; max-width: min(92vw, 500px);`
- `.show` 中保留 `translateX(-50%)`

#### 移动端自适应修复

- 移除 `white-space: nowrap`
- 添加 `max-width: calc(100vw - 32px)` 限制最大宽度
- 添加 `text-align: center` 保持居中
- 添加 `word-break: break-word` 确保长单词也能换行

> 注：`max-width: 92vw` 已在代码中设置。如果手机上仍然看到溢出，请强制刷新浏览器或清除缓存。

### 1.3 验证

- `npx vite build` 构建通过
- 桌面端 Toast 不超出 APP 容器边界
- 移动端长文本正常换行

---

## 二、ConfirmDialog 确认弹窗组件

### 2.1 概述

将 Dashboard 的"重置所有数据"按钮从 `window.confirm`（原生 alert 风格）改为自定义确认弹窗组件，与应用整体 UI 风格一致。

### 2.2 实施步骤

#### 步骤 1：创建 ConfirmDialog 组件

**新建文件**：`src/components/ConfirmDialog/ConfirmDialog.jsx` + `ConfirmDialog.module.css`

轻量确认弹窗：
- Props：`open`, `title`, `message`, `onConfirm`, `onCancel`
- 遮罩层 + 居中卡片 + 标题 + 内容 + 两个按钮（取消/确认）
- 样式：圆角卡片、半透明遮罩、与应用设计语言一致
- 点击遮罩或取消按钮关闭

#### 步骤 2：修改 Dashboard 使用 ConfirmDialog

**文件**：`src/pages/Dashboard/Dashboard.jsx`

- 导入 ConfirmDialog
- 添加 `showResetConfirm` state
- 将 `window.confirm(...)` 替换为 `setShowResetConfirm(true)`
- 确认回调中执行清除逻辑 + 刷新

#### 步骤 3：构建验证

`npx vite build`

---

## 三、开发环境数据重置按钮

### 3.1 概述

在应用中添加一个"重置所有数据"按钮，仅在开发环境（`import.meta.env.DEV`）下显示，生产构建中完全排除。

### 3.2 实施方案

**文件**：`src/pages/Dashboard/Dashboard.jsx`

- 在页面底部（温馨提示之后）添加条件渲染的重置按钮
- 使用 `import.meta.env.DEV` 判断环境（Vite 内置变量，开发时为 `true`，`vite build` 后为 `false`）
- 点击后弹出 ConfirmDialog 二次确认（已从 `window.confirm` 改造）
- 确认后清除所有 `sgt-` 前缀的 localStorage 键

需要清除的 localStorage 键（共 11 个）：
```
sgt-medications, sgt-side-effects, sgt-cbt-progress,
sgt-social-tasks, sgt-social-activities, sgt-family-progress,
sgt-caregiver-assessments, sgt-caregiver-selfcare, sgt-taper-plans,
sgt-checkins, sgt-wrap-sections
```

### 3.3 核心代码逻辑

```jsx
{import.meta.env.DEV && (
  <>
    <button onClick={() => setShowResetConfirm(true)}>
      🗑️ 重置所有数据（仅开发环境）
    </button>
    <ConfirmDialog
      open={showResetConfirm}
      title="重置数据"
      message="确定要重置所有用户数据吗？此操作不可撤销。"
      onConfirm={() => {
        Object.keys(localStorage)
          .filter(k => k.startsWith('sgt-'))
          .forEach(k => localStorage.removeItem(k))
        window.location.reload()
      }}
      onCancel={() => setShowResetConfirm(false)}
    />
  </>
)}
```

### 3.4 验证

- `npx vite build` 后确认按钮不存在于产物中（`import.meta.env.DEV` 会被 Vite 在构建时替换为 `false`，dead code elimination 会移除整个分支）
- `npx vite` 开发模式下确认按钮可见且功能正常

---

## 四、涉及文件清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/components/Toast/Toast.module.css` | 桌面端居中 + 移动端自适应 |
| 新建 | `src/components/ConfirmDialog/ConfirmDialog.jsx` | 自定义确认弹窗组件 |
| 新建 | `src/components/ConfirmDialog/ConfirmDialog.module.css` | 弹窗样式 |
| 修改 | `src/pages/Dashboard/Dashboard.jsx` | 使用 ConfirmDialog 替换 window.confirm + 重置按钮 |
