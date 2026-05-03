# Dashboard 统计卡片导航修复计划

## 概述

Dashboard 首页的3个统计卡片（打卡天数、用药率、本周记录）目前是纯展示的 `<div>`，无法点击跳转到对应功能页面。BottomNav 也缺少"用药"Tab 入口。需要添加导航能力。

## 当前状态分析

### 问题清单

| 问题 | 位置 | 说明 |
|------|------|------|
| 用药率卡片不可点击 | `Dashboard.jsx:53-56` | `<div className={styles.statCard}>` 无导航 |
| 打卡天数卡片不可点击 | `Dashboard.jsx:49-52` | 同上，应跳转到签到页 |
| 本周记录卡片不可点击 | `Dashboard.jsx:57-60` | 同上，可跳转到仪表盘详情（暂无） |
| BottomNav 缺少用药入口 | `BottomNav.jsx:4-10` | 5个Tab中无用药管理 |

### 已有的导航路径

- `/checkin` — 签到页 ✅ 路由已注册
- `/medication` — 用药管理页 ✅ 路由已注册
- `/dashboard` — 当前页（本周记录卡片无需跳转）

## 修改方案

### 修改 1：Dashboard 统计卡片添加导航

**文件**：`src/pages/Dashboard/Dashboard.jsx`

- 引入 `useNavigate` from `react-router-dom`
- 将"打卡天数"卡片包裹 `<div onClick={() => navigate('/checkin')}>` 并添加 `cursor: pointer`
- 将"用药率"卡片包裹 `<div onClick={() => navigate('/medication')}>` 并添加 `cursor: pointer`
- "本周记录"卡片保持不跳转（当前已在仪表盘）

### 修改 2：Dashboard 卡片样式添加可点击反馈

**文件**：`src/pages/Dashboard/Dashboard.module.css`

- 为 `.statCard` 添加 `cursor: pointer` 和 `transition: transform 0.2s`
- 添加 `.statCard:active { transform: scale(0.96); }` 触摸反馈

### 修改 3：BottomNav 添加"用药"Tab（可选）

**文件**：`src/components/BottomNav/BottomNav.jsx`

- 在"签到"和"资源"之间插入 `{ to: '/medication', icon: '💊', label: '用药' }`
- 注意：5个Tab变为6个Tab，需确认空间是否足够

**文件**：`src/components/BottomNav/BottomNav.module.css`

- 可能需要微调 Tab 间距

## 验证步骤

1. 点击 Dashboard "用药率"卡片 → 跳转到 `/medication` 用药管理页
2. 点击 Dashboard "打卡天数"卡片 → 跳转到 `/checkin` 签到页
3. BottomNav 新增"用药"Tab 可正常切换
4. `npx vite build` 构建无错误
