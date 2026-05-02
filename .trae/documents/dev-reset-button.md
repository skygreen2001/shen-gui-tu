# 开发环境数据重置按钮

## 概述

在应用中添加一个"重置所有数据"按钮，仅在开发环境（`import.meta.env.DEV`）下显示，生产构建中完全排除。

## 实施方案

### 步骤 1：在 Dashboard 底部添加重置按钮

**文件**：`src/pages/Dashboard/Dashboard.jsx`

- 在页面底部（温馨提示之后）添加条件渲染的重置按钮
- 使用 `import.meta.env.DEV` 判断环境（Vite 内置变量，开发时为 `true`，`vite build` 后为 `false`）
- 点击后弹出 `window.confirm` 二次确认
- 确认后清除所有 `sgt-` 前缀的 localStorage 键

需要清除的 localStorage 键（共 13 个）：
```
sgt-medications, sgt-side-effects, sgt-cbt-progress,
sgt-social-tasks, sgt-social-activities, sgt-family-progress,
sgt-caregiver-assessments, sgt-caregiver-selfcare, sgt-taper-plans,
sgt-checkins, sgt-wrap-sections
```

### 核心代码逻辑

```jsx
{import.meta.env.DEV && (
  <button onClick={() => {
    if (window.confirm('确定要重置所有用户数据吗？此操作不可撤销。')) {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sgt-'))
        .forEach(k => localStorage.removeItem(k))
      window.location.reload()
    }
  }}>
    🗑️ 重置所有数据（仅开发环境）
  </button>
)}
```

## 涉及文件

| 操作 | 文件 |
|------|------|
| 修改 | `src/pages/Dashboard/Dashboard.jsx` |

## 验证

- `npx vite build` 后确认按钮不存在于产物中（`import.meta.env.DEV` 会被 Vite 在构建时替换为 `false`，dead code elimination 会移除整个分支）
- `npx vite` 开发模式下确认按钮可见且功能正常
