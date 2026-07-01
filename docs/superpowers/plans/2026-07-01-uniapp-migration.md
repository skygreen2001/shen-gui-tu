# 「申归途」UniApp 移动端实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将「申归途」抑郁症复发预防支持工具从 React Web 应用完整移植为 UniApp 跨平台移动应用（iOS + Android），功能与 Web 版 100% 一致。

**Architecture:** 基于 UniApp (Vue 3 + Composition API) 框架，采用 uni-ui + uView Plus 组件库，使用 Vuex 进行全局状态管理，uni.setStorageSync / uni.getStorageSync 替代 localStorage，原生内建组件替代 Web DOM 元素。项目放置在根路径 `app/` 目录下。

**Tech Stack:** UniApp (Vue 3 Composition API) + uni-ui + uView Plus + Vuex 4 + uni-app 内置 API

---

## 一、Web 与 UniApp 技术栈对照

| 类别 | Web 版（React） | UniApp 版（Vue 3） |
|------|------|------|
| 框架 | React 19 | Vue 3 (Composition API) |
| 路由 | React Router DOM (HashRouter) | UniApp 内置 pages.json 路由 |
| 样式 | CSS Modules | SCSS + rpx 响应式单位 |
| 状态管理 | React Hooks + LocalStorage | Vuex 4 + uni.setStorageSync |
| 语音合成 | Edge TTS (WebSocket) + Web Speech API | uni.createInnerAudioContext() 播放预录 MP3 |
| 拨号 | `<a href="tel:xxx">` | uni.makePhoneCall() |
| SVG 图表 | SVG circle strokeDasharray | Canvas 绘制 或 使用 uCharts 图表库 |
| 动画 | CSS @keyframes | CSS @keyframes + Vue transition |
| 滚动 | div overflow | scroll-view / swiper |
| 存储读写的同步性 | localStorage（同步） | uni.setStorageSync（同步） |
| 构建工具 | Vite 8 | HBuilderX / CLI |
| 测试 | Vitest + RTL | 暂无标准方案（手动测试为主） |

---

## 二、项目目录结构

```
app/                                  # UniApp 项目根目录
├── pages.json                        # 页面路由 & tabBar 配置
├── manifest.json                     # 应用配置（名称、图标、权限等）
├── App.vue                           # 应用入口（全局生命周期、Vuex 初始化）
├── main.js                           # Vue 入口
├── uni.scss                          # 全局 SCSS 变量（设计 Token）
├── index.html                        # HTML 模板
├── package.json
├── pages/                            # 页面目录
│   ├── welcome/
│   │   └── welcome.vue               # 欢迎页
│   ├── dashboard/
│   │   └── dashboard.vue             # 仪表盘首页
│   ├── checkin/
│   │   └── checkin.vue               # 每日签到
│   ├── medication/
│   │   ├── medication.vue           # 用药管理主页
│   │   ├── med-knowledge.vue         # 药物知识
│   │   ├── side-effect-tracker.vue   # 副作用追踪
│   │   ├── mood-correlation.vue     # 情绪关联分析
│   │   └── taper-navigator.vue      # 减药导航
│   ├── resources/
│   │   ├── resources.vue             # 资源服务主页
│   │   ├── family-tab.vue            # 家属支持 Tab
│   │   └── rebuild-tab.vue           # 社会重建 Tab
│   ├── crisis/
│   │   └── crisis.vue               # 危机干预
│   ├── cbt-course/
│   │   └── cbt-course.vue           # CBT 课程
│   └── wrap-plan/
│       └── wrap-plan.vue             # WRAP 计划
├── components/                       # 公共组件
│   ├── risk-gauge/
│   │   └── risk-gauge.vue           # 风险仪表盘（Canvas 实现）
│   ├── crisis-button/
│   │   └── crisis-button.vue         # 危机浮动按钮
│   ├── confirm-dialog/
│   │   └── confirm-dialog.vue       # 确认弹窗
│   ├── guided-player/
│   │   └── guided-player.vue         # 引导式练习播放器
│   ├── toast/
│   │   └── toast.vue                 # 轻提示
│   └── trend-chart/
│       └── trend-chart.vue           # 七日趋势柱状图
├── store/                            # Vuex 状态管理
│   └── index.js                      # Vuex Store（签到、用药、WRAP、课程等模块）
├── utils/                            # 工具函数（100% 可复用）
│   ├── risk-calculator.js            # 风险计算引擎（直接迁移）
│   └── date-utils.js                 # 日期工具（直接迁移）
├── data/                             # 静态数据（100% 直接复用，.js 格式）
│   ├── caregiver-assessment.js       # 照护者评估数据
│   ├── cbt-content.js               # CBT 课程内容
│   ├── community.js                  # 社区资源数据
│   ├── family-courses.js            # 家庭课程数据
│   ├── family-guide.js              # 家庭指南数据
│   ├── hospitals.js                  # 医院信息数据
│   ├── hotlines.js                   # 热线电话数据
│   ├── insurance.js                  # 医保信息数据
│   ├── medication-knowledge.js      # 药物知识数据
│   ├── peer-stories.js               # 同伴故事数据
│   ├── social-tasks.js              # 社会任务数据
│   └── wrap-template.js             # WRAP 模板数据
├── static/                           # 静态资源
│   ├── audio/                        # 预录 MP3 音频文件
│   ├── images/                       # Logo、图标、占位图
│   └── fonts/                       # 自定义字体（如需）
└── unpackage/                        # 编译输出目录（自动生成）
```

---

## 三、导航架构（pages.json）

```json
{
  "pages": [
    { "path": "pages/welcome/welcome", "style": { "navigationBarTitleText": "申归途", "navigationStyle": "custom" } },
    { "path": "pages/dashboard/dashboard", "style": { "navigationBarTitleText": "首页" } },
    { "path": "pages/checkin/checkin", "style": { "navigationBarTitleText": "每日签到" } },
    { "path": "pages/medication/medication", "style": { "navigationBarTitleText": "用药管理" } },
    { "path": "pages/medication/med-knowledge", "style": { "navigationBarTitleText": "药物知识" } },
    { "path": "pages/medication/side-effect-tracker", "style": { "navigationBarTitleText": "副作用追踪" } },
    { "path": "pages/medication/mood-correlation", "style": { "navigationBarTitleText": "情绪关联" } },
    { "path": "pages/medication/taper-navigator", "style": { "navigationBarTitleText": "减药导航" } },
    { "path": "pages/resources/resources", "style": { "navigationBarTitleText": "服务中心" } },
    { "path": "pages/crisis/crisis", "style": { "navigationBarTitleText": "危机干预", "navigationStyle": "custom" } },
    { "path": "pages/cbt-course/cbt-course", "style": { "navigationBarTitleText": "CBT 课程" } },
    { "path": "pages/wrap-plan/wrap-plan", "style": { "navigationBarTitleText": "WRAP 计划" } }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#F8F6F2",
    "backgroundColor": "#F8F6F2",
    "app-plus": { "titleNView": { "titleColor": "#2D2D2D" } }
  },
  "tabBar": {
    "color": "#9B9B9B",
    "selectedColor": "#4A90D9",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      { "pagePath": "pages/dashboard/dashboard", "text": "首页", "iconPath": "static/tab/home.png", "selectedIconPath": "static/tab/home-active.png" },
      { "pagePath": "pages/cbt-course/cbt-course", "text": "疗愈", "iconPath": "static/tab/heal.png", "selectedIconPath": "static/tab/heal-active.png" },
      { "pagePath": "pages/resources/resources", "text": "服务", "iconPath": "static/tab/service.png", "selectedIconPath": "static/tab/service-active.png" },
      { "pagePath": "pages/medication/medication", "text": "成长", "iconPath": "static/tab/grow.png", "selectedIconPath": "static/tab/grow-active.png" }
    ]
  }
}
```

**说明：**
- Welcome 页为独立页面（无 tabBar），通过 `uni.reLaunch` 跳转
- Dashboard / CBTCourse / Resources / Medication 作为 tabBar 四个主入口
- Crisis 页面通过浮动按钮从任何页面进入，不在 tabBar 中
- Medication 的子页面（药物知识、副作用追踪等）通过 `uni.navigateTo` 堆栈跳转
- Welcome 页使用自定义导航栏（`navigationStyle: "custom"`），实现品牌展示效果

---

## 四、数据存储迁移策略

### Web 版 localStorage → UniApp Storage

Web 版使用 `useLocalStorage` Hook 封装 localStorage（同步读写），UniApp 提供 `uni.setStorageSync` / `uni.getStorageSync`（也是同步），API 非常接近。

| Web 存储键 | 数据类型 | 说明 |
|-----------|---------|------|
| `checkinRecords` | Array | 每日签到记录（日期+6维度评分+备注） |
| `medications` | Array | 药物列表（名称、剂量、频率等） |
| `medRecords` | Array | 服药记录（日期+药物ID+状态） |
| `sideEffectRecords` | Array | 副作用追踪记录 |
| `wrapContent` | Object | WRAP 计划各板块内容 |
| `cbtProgress` | Object | CBT 课程完成进度 |
| `socialRecords` | Array | 社交活动记录 |
| `caregiverScore` | Object | 照护者压力自评结果 |

**迁移方案：** 使用 Vuex 的 `modules` 管理各业务域的状态，在 `mutation` 中同时更新 Vuex state 和 `uni.setStorageSync`，实现状态持久化。`App.vue` 的 `onLaunch` 中从 Storage 恢复状态到 Vuex。

---

## 五、关键组件迁移映射

| Web 组件/功能 | UniApp 实现方案 | 迁移难度 | 备注 |
|------|------|------|------|
| div / span / p | view / text | 低 | 直接替换 |
| button / a | button / navigator | 低 | 直接替换 |
| input / textarea | input / textarea | 低 | UniApp 原生组件 |
| CSS Modules | SCSS + BEM 命名 | 中 | 手动转换样式语法 |
| React Router | pages.json + uni.navigateTo | 中 | 路由配置重写 |
| localStorage | uni.setStorageSync | 低 | API 几乎一致 |
| SVG 圆环 (RiskGauge) | Canvas 2D 绘制 | 中 | 需重写绘制逻辑 |
| CSS 柱状图 | view + flex 布局 | 低 | 用 flex 模拟柱状图 |
| `<a href="tel:">` | uni.makePhoneCall() | 低 | UniApp 原生 API |
| HTML Audio | uni.createInnerAudioContext() | 中 | API 类似但事件名不同 |
| CSS @keyframes | CSS @keyframes | 低 | UniApp 支持 CSS 动画 |
| HashRouter 路由 | pages.json 配置 | 中 | 声明式 vs 编程式差异 |
| Emoji 图标 | 直接复用 | 无 | 跨平台兼容 |
| scroll 容器 | scroll-view | 低 | UniApp 原生组件 |
| Modal/Dialog | uni.showModal / 自定义弹窗 | 低 | 原生 API + 自定义组件 |
| React NavLink | tabBar + 自定义高亮 | 低 | UniApp tabBar 自动高亮 |
| Outlet (嵌套路由) | 页面独立，非嵌套 | 中 | UniApp 每个页面独立 |

---

## 六、分阶段实施计划

### 阶段 1：项目初始化与基础架构（Task 1-3）

### 阶段 2：数据层与工具函数迁移（Task 4-6）

### 阶段 3：公共组件开发（Task 7-12）

### 阶段 4：核心页面开发（Task 13-23）

### 阶段 5：原生能力集成与收尾（Task 24-25）

---

### Task 1: 创建 UniApp 项目脚手架

**Files:**
- Create: `app/` （整个项目目录）

- [ ] **Step 1: 使用 HBuilderX 或 CLI 创建 UniApp 项目**

在根目录创建 `app/` 文件夹。使用 Vue 3 + Composition API 模板。若使用 CLI：
```bash
npx degit dcloudio/uni-preset-vue#vite-ts app
```
或使用 HBuilderX 新建项目后移动到 `app/` 目录。

**验证：** `app/` 目录下有 `pages.json`、`manifest.json`、`App.vue`、`main.js`。

- [ ] **Step 2: 配置 package.json 依赖**

```json
{
  "dependencies": {
    "@dcloudio/uni-app": "latest",
    "@dcloudio/uni-app-plus": "latest",
    "@dcloudio/uni-components": "latest",
    "@dcloudio/uni-h5": "latest",
    "vue": "^3.4",
    "vuex": "^4.1",
    "uview-plus": "^3.2"
  },
  "devDependencies": {
    "@dcloudio/vite-plugin-uni": "latest",
    "vite": "^5.0",
    "sass": "^1.77"
  }
}
```

- [ ] **Step 3: 验证项目可运行**

```bash
cd app && npm install
cd app && npx uni -p mp-weixin  # 或用 HBuilderX 运行
```

Expected: 项目成功启动，无报错。

- [ ] **Step 4: 配置 pages.json 基础路由**

配置所有 12 个页面路由和 4 个 tabBar（参见第三节的完整 pages.json 配置）。

- [ ] **Step 5: 提交**

```bash
git add app/
git commit -m "feat: 初始化 UniApp 项目脚手架"
```

---

### Task 2: 建立设计系统与全局样式

**Files:**
- Create: `app/uni.scss`
- Create: `app/App.vue`
- Create: `app/common/styles/variables.scss`

- [ ] **Step 1: 创建 SCSS 变量文件**

将 Web 版 CSS 变量转换为 SCSS 变量，保持一致的色彩、字体、间距、圆角、阴影体系：

```scss
// app/common/styles/variables.scss

// === 语义色板 ===
$color-primary: #4A90D9;
$color-primary-dark: #3A7BC8;
$color-primary-light: #E8F1FB;
$color-accent: #E8985E;
$color-accent-dark: #D4854A;
$color-success: #6BAF7A;
$color-warning: #E8C95A;
$color-danger: #D46B6B;
$color-danger-dark: #C05555;

// === 中性色板 ===
$color-bg: #F8F6F2;
$color-bg-elevated: #FFFFFF;
$color-bg-subtle: #F0EDE7;
$color-text-primary: #2D2D2D;
$color-text-secondary: #6B6B6B;
$color-text-tertiary: #9B9B9B;
$color-text-inverse: #FFFFFF;
$color-border: #E5E2DC;
$color-border-light: #F0EDE7;

// === 风险等级色 ===
$risk-green: #6BAF7A;
$risk-yellow: #E8C95A;
$risk-orange: #E8985E;
$risk-red: #D46B6B;
$risk-green-bg: #EDF5EF;
$risk-yellow-bg: #FDF8E8;
$risk-orange-bg: #FDF0E5;
$risk-red-bg: #FDECEC;

// === 字号 ===
$text-hero: 56rpx;
$text-h1: 44rpx;
$text-h2: 36rpx;
$text-h3: 32rpx;
$text-body: 30rpx;
$text-body-sm: 28rpx;
$text-caption: 24rpx;
$text-button: 32rpx;

// === 间距（8px 基准，rpx = px × 2） ===
$space-xs: 8rpx;
$space-sm: 16rpx;
$space-md: 24rpx;
$space-base: 32rpx;
$space-lg: 48rpx;
$space-xl: 64rpx;
$space-2xl: 96rpx;

// === 圆角 ===
$radius-sm: 12rpx;
$radius-md: 20rpx;
$radius-lg: 32rpx;
$radius-xl: 48rpx;
$radius-full: 9999rpx;

// === 阴影 ===
$shadow-sm: 0 2rpx 6rpx rgba(0,0,0,0.06);
$shadow-md: 0 4rpx 16rpx rgba(0,0,0,0.08);
$shadow-lg: 0 8rpx 32rpx rgba(0,0,0,0.10);
$shadow-crisis: 0 8rpx 40rpx rgba(212,107,107,0.3);
```

- [ ] **Step 2: 配置 uni.scss 引入全局变量**

```scss
// app/uni.scss
@import './common/styles/variables.scss';
```

- [ ] **Step 3: 配置 App.vue 全局样式**

```vue
<!-- app/App.vue -->
<script>
export default {
  onLaunch() {
    console.log('App Launch')
  }
}
</script>

<style lang="scss">
@import './common/styles/variables.scss';

/* 全局基础样式 */
page {
  background-color: $color-bg;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif;
  font-size: $text-body;
  color: $color-text-primary;
  line-height: 1.6;
}

/* 全局滚动容器 */
.page-container {
  min-height: 100vh;
  padding: $space-base;
}
</style>
```

- [ ] **Step 4: 验证**

Expected: H5 预览中页面背景为 `#F8F6F2`，SCSS 变量可用。

- [ ] **Step 5: 提交**

```bash
git add app/uni.scss app/App.vue app/common/
git commit -m "feat: 建立设计系统与全局样式变量"
```

---

### Task 3: 迁移静态数据文件与工具函数

**Files:**
- Create: `app/data/*.js`（13 个文件）
- Create: `app/utils/*.js`（2 个文件）

- [ ] **Step 1: 复制并转换 data 目录下所有静态数据文件**

从 `shen-gui-tu/src/data/` 复制所有 13 个 JS 文件到 `app/data/`。
将文件名从 camelCase 转换为 kebab-case（UniApp 约定）：
- `caregiverAssessment.js` → `caregiver-assessment.js`
- `cbtContent.js` → `cbt-content.js`
- `community.js` → `community.js`（不变）
- `familyCourses.js` → `family-courses.js`
- `familyGuide.js` → `family-guide.js`
- `hospitals.js` → `hospitals.js`（不变）
- `hotlines.js` → `hotlines.js`（不变）
- `insurance.js` → `insurance.js`（不变）
- `medicationKnowledge.js` → `medication-knowledge.js`
- `peerStories.js` → `peer-stories.js`
- `socialTasks.js` → `social-tasks.js`
- `wrapTemplate.js` → `wrap-template.js`

**每个文件只需修改 export 语句**（确保使用 ES Module export default），数据内容完全不变。

示例 - `app/utils/risk-calculator.js`：
```javascript
// 直接从 shen-gui-tu/src/utils/riskCalculator.js 复制
// export 语句保持不变，纯函数无需任何修改
export function calculateRiskScore(recentRecords) {
  // ... 完整逻辑保持不变
}

export function getRiskLevel(score) {
  // ... 完整逻辑保持不变
}
```

- [ ] **Step 2: 复制工具函数**

从 `shen-gui-tu/src/utils/` 复制：
- `riskCalculator.js` → `app/utils/risk-calculator.js`（100% 直接复用，零修改）
- `dateUtils.js` → `app/utils/date-utils.js`（100% 直接复用，零修改）

- [ ] **Step 3: 验证**

在 `app/utils/risk-calculator.js` 中手动测试：
```javascript
import { calculateRiskScore, getRiskLevel } from './risk-calculator'
const mockRecords = [
  { date: '2026-06-30', scores: { sleep: 4, mood: 4, body: 4, drive: 4, cognition: 4, social: 4 }, note: '' }
]
const result = calculateRiskScore(mockRecords)
console.log(result) // { score: 80, level: 'green', color: '#6BAF7A', label: '状态良好' }
```

Expected: 计算结果正确。

- [ ] **Step 4: 复制静态资源**

- 从 `shen-gui-tu/public/` 复制所有音频文件到 `app/static/audio/`
- 从 `shen-gui-tu/src/assets/` 复制图片到 `app/static/images/`
- 需要制作 tabBar 图标（4个 tab × 2种状态 = 8 个 PNG 图标），尺寸 81×81px

- [ ] **Step 5: 提交**

```bash
git add app/data/ app/utils/ app/static/
git commit -m "feat: 迁移静态数据文件、工具函数和静态资源"
```

---

### Task 4: 创建 Vuex Store 与存储管理

**Files:**
- Create: `app/store/index.js`
- Create: `app/store/modules/checkin.js`
- Create: `app/store/modules/medication.js`
- Create: `app/store/modules/wrap.js`
- Create: `app/store/modules/cbt.js`
- Create: `app/store/modules/social.js`

- [ ] **Step 1: 创建 Storage 工具函数**

```javascript
// app/store/storage.js
/**
 * 同步读写 uni.storage 的工具函数
 * API 与 Web 版 useLocalStorage 对齐，但为同步方式
 */
export function loadData(key, defaultValue) {
  try {
    const raw = uni.getStorageSync(key)
    return raw !== '' && raw !== undefined ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

export function saveData(key, value) {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.warn('存储写入失败:', key, e)
  }
}
```

- [ ] **Step 2: 创建 checkin 模块**

```javascript
// app/store/modules/checkin.js
import { loadData, saveData } from '../storage'

const STORAGE_KEY = 'checkinRecords'

export default {
  namespaced: true,
  state: () => ({
    records: loadData(STORAGE_KEY, [])
  }),
  mutations: {
    ADD_RECORD(state, record) {
      state.records.push(record)
      saveData(STORAGE_KEY, state.records)
    },
    UPDATE_RECORD(state, { date, scores, note }) {
      const idx = state.records.findIndex(r => r.date === date)
      if (idx !== -1) {
        state.records[idx] = { ...state.records[idx], scores, note }
        saveData(STORAGE_KEY, state.records)
      }
    },
    CLEAR_RECORDS(state) {
      state.records = []
      saveData(STORAGE_KEY, [])
    }
  },
  getters: {
    recentRecords: (state) => (days = 7) => {
      const now = new Date()
      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - days)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      return state.records
        .filter(r => r.date >= cutoffStr)
        .sort((a, b) => a.date.localeCompare(b.date))
    },
    todayRecord: (state) => {
      const today = new Date().toISOString().slice(0, 10)
      return state.records.find(r => r.date === today) || null
    },
    streakDays: (state) => {
      if (state.records.length === 0) return 0
      const sorted = [...state.records].sort((a, b) => b.date.localeCompare(a.date))
      let streak = 0
      let checkDate = new Date()
      // 如果今天没签到，从昨天开始算
      const today = checkDate.toISOString().slice(0, 10)
      if (sorted[0].date !== today) {
        checkDate.setDate(checkDate.getDate() - 1)
      }
      for (const record of sorted) {
        const dateStr = checkDate.toISOString().slice(0, 10)
        if (record.date === dateStr) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
      return streak
    }
  }
}
```

- [ ] **Step 3: 创建 medication 模块**

```javascript
// app/store/modules/medication.js
import { loadData, saveData } from '../storage'

const MED_KEY = 'medications'
const MED_REC_KEY = 'medRecords'
const SIDE_EFFECT_KEY = 'sideEffectRecords'

export default {
  namespaced: true,
  state: () => ({
    medications: loadData(MED_KEY, []),
    records: loadData(MED_REC_KEY, []),
    sideEffectRecords: loadData(SIDE_EFFECT_KEY, [])
  }),
  mutations: {
    SET_MEDICATIONS(state, list) {
      state.medications = list
      saveData(MED_KEY, list)
    },
    ADD_MEDICATION(state, med) {
      state.medications.push(med)
      saveData(MED_KEY, state.medications)
    },
    REMOVE_MEDICATION(state, id) {
      state.medications = state.medications.filter(m => m.id !== id)
      saveData(MED_KEY, state.medications)
    },
    ADD_RECORD(state, record) {
      state.records.push(record)
      saveData(MED_REC_KEY, state.records)
    },
    ADD_SIDE_EFFECT(state, record) {
      state.sideEffectRecords.push(record)
      saveData(SIDE_EFFECT_KEY, state.sideEffectRecords)
    },
    CLEAR_ALL(state) {
      state.medications = []
      state.records = []
      state.sideEffectRecords = []
      saveData(MED_KEY, [])
      saveData(MED_REC_KEY, [])
      saveData(SIDE_EFFECT_KEY, [])
    }
  },
  getters: {
    // 同 Web 版 useMedication 中的计算逻辑
    adherenceRate: (state) => {
      if (state.records.length === 0) return 0
      const taken = state.records.filter(r => r.status === 'taken').length
      return Math.round((taken / state.records.length) * 100)
    },
    consecutiveDays: (state) => {
      if (state.records.length === 0) return 0
      const sorted = [...state.records].sort((a, b) => b.date.localeCompare(a.date))
      let streak = 0
      // 按日期去重后检查连续性
      const uniqueDates = [...new Set(sorted.map(r => r.date))]
      let checkDate = new Date()
      for (const dateStr of uniqueDates) {
        const checkStr = checkDate.toISOString().slice(0, 10)
        if (dateStr === checkStr) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (dateStr < checkStr) {
          break
        }
      }
      return streak
    },
    todayRecords: (state) => {
      const today = new Date().toISOString().slice(0, 10)
      return state.records.filter(r => r.date === today)
    }
  }
}
```

- [ ] **Step 4: 创建 wrap、cbt、social 模块**

```javascript
// app/store/modules/wrap.js
import { loadData, saveData } from '../storage'
const WRAP_KEY = 'wrapContent'

export default {
  namespaced: true,
  state: () => ({ content: loadData(WRAP_KEY, {}) }),
  mutations: {
    UPDATE_SECTION(state, { sectionId, items }) {
      state.content = { ...state.content, [sectionId]: items }
      saveData(WRAP_KEY, state.content)
    }
  }
}

// app/store/modules/cbt.js
import { loadData, saveData } from '../storage'
const CBT_KEY = 'cbtProgress'

export default {
  namespaced: true,
  state: () => ({ progress: loadData(CBT_KEY, {}) }),
  mutations: {
    COMPLETE_STEP(state, { courseId, stepIdx }) {
      if (!state.progress[courseId]) state.progress[courseId] = {}
      state.progress[courseId][stepIdx] = true
      saveData(CBT_KEY, state.progress)
    }
  },
  getters: {
    isStepComplete: (state) => (courseId, stepIdx) => {
      return state.progress[courseId]?.[stepIdx] || false
    }
  }
}

// app/store/modules/social.js
import { loadData, saveData } from '../storage'
const SOCIAL_KEY = 'socialRecords'

export default {
  namespaced: true,
  state: () => ({ records: loadData(SOCIAL_KEY, []) }),
  mutations: {
    ADD_RECORD(state, record) {
      state.records.push(record)
      saveData(SOCIAL_KEY, state.records)
    }
  }
}
```

- [ ] **Step 5: 创建 Vuex Store 入口**

```javascript
// app/store/index.js
import { createStore } from 'vuex'
import checkin from './modules/checkin'
import medication from './modules/medication'
import wrap from './modules/wrap'
import cbt from './modules/cbt'
import social from './modules/social'

export default createStore({
  modules: {
    checkin,
    medication,
    wrap,
    cbt,
    social
  }
})
```

- [ ] **Step 6: 在 main.js 中挂载 Vuex**

```javascript
// app/main.js
import { createSSRApp } from 'vue'
import App from './App.vue'
import store from './store'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  return { app }
}
```

- [ ] **Step 7: 提交**

```bash
git add app/store/ app/main.js
git commit -m "feat: 创建 Vuex Store 与数据持久化管理"
```

---

### Task 5: 创建风险计算组合式函数

**Files:**
- Create: `app/composables/use-risk-level.js`
- Create: `app/composables/use-checkin.js`

- [ ] **Step 1: 创建 useRiskLevel 组合式函数**

```javascript
// app/composables/use-risk-level.js
import { computed } from 'vue'
import { useStore } from 'vuex'
import { calculateRiskScore } from '../utils/risk-calculator'

export function useRiskLevel() {
  const store = useStore()

  const recentRecords = computed(() => store.getters['checkin/recentRecords'](7))

  const riskInfo = computed(() => {
    if (recentRecords.value.length === 0) {
      return { score: 0, level: 'green', color: '#6BAF7A', label: '暂无数据' }
    }
    return calculateRiskScore(recentRecords.value)
  })

  return {
    riskInfo,
    recentRecords
  }
}
```

- [ ] **Step 2: 创建 useCheckIn 组合式函数**

```javascript
// app/composables/use-checkin.js
import { computed } from 'vue'
import { useStore } from 'vuex'

export function useCheckIn() {
  const store = useStore()

  const todayRecord = computed(() => store.getters['checkin/todayRecord'])
  const streakDays = computed(() => store.getters['checkin/streakDays'])
  const hasCheckedToday = computed(() => !!todayRecord.value)

  function submitCheckIn(scores, note) {
    const today = new Date().toISOString().slice(0, 10)
    if (hasCheckedToday.value) {
      store.commit('checkin/UPDATE_RECORD', { date: today, scores, note })
    } else {
      store.commit('checkin/ADD_RECORD', { date: today, scores, note })
    }
  }

  return {
    todayRecord,
    streakDays,
    hasCheckedToday,
    submitCheckIn
  }
}
```

- [ ] **Step 3: 验证**

在任意页面中引入 `useRiskLevel()`，确认 computed 返回正确的风险计算结果。

- [ ] **Step 4: 提交**

```bash
git add app/composables/
git commit -m "feat: 创建风险计算和签到组合式函数"
```

---

### Task 6: 开发公共 Toast 组件

**Files:**
- Create: `app/components/toast/toast.vue`

- [ ] **Step 1: 创建 Toast 组件**

```vue
<!-- app/components/toast/toast.vue -->
<template>
  <view v-if="visible" class="toast-mask">
    <view class="toast-content">{{ message }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
let timer = null

function show(msg, duration = 2000) {
  message.value = msg
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { visible.value = false }, duration)
}

defineExpose({ show })
</script>

<style lang="scss" scoped>
.toast-mask {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;
}
.toast-content {
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: $radius-md;
  font-size: $text-body-sm;
  max-width: 500rpx;
  text-align: center;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add app/components/toast/
git commit -m "feat: 开发 Toast 轻提示组件"
```

---

### Task 7: 开发 ConfirmDialog 确认弹窗组件

**Files:**
- Create: `app/components/confirm-dialog/confirm-dialog.vue`

- [ ] **Step 1: 创建确认弹窗组件**

```vue
<!-- app/components/confirm-dialog/confirm-dialog.vue -->
<template>
  <view v-if="visible" class="dialog-mask" @tap="handleCancel">
    <view class="dialog-box" @tap.stop>
      <view class="dialog-title">{{ title }}</view>
      <view class="dialog-message">{{ message }}</view>
      <view class="dialog-actions">
        <view class="dialog-btn cancel-btn" @tap="handleCancel">取消</view>
        <view class="dialog-btn confirm-btn" @tap="handleConfirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const title = ref('提示')
const message = ref('')
const resolveRef = ref(null)

function show(options) {
  title.value = options.title || '提示'
  message.value = options.message || ''
  visible.value = true
  return new Promise(resolve => { resolveRef.value = resolve })
}

function handleConfirm() {
  visible.value = false
  if (resolveRef.value) resolveRef.value(true)
}

function handleCancel() {
  visible.value = false
  if (resolveRef.value) resolveRef.value(false)
}

defineExpose({ show })
</script>

<style lang="scss" scoped>
.dialog-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5); z-index: 9998;
  display: flex; align-items: center; justify-content: center;
}
.dialog-box {
  width: 560rpx; background: #fff; border-radius: $radius-lg;
  padding: $space-xl $space-base; overflow: hidden;
}
.dialog-title {
  font-size: $text-h3; font-weight: 600; text-align: center;
  margin-bottom: $space-md;
}
.dialog-message {
  font-size: $text-body; color: $color-text-secondary;
  text-align: center; margin-bottom: $space-lg; line-height: 1.6;
}
.dialog-actions {
  display: flex; gap: $space-md;
}
.dialog-btn {
  flex: 1; text-align: center; padding: $space-md 0;
  border-radius: $radius-md; font-size: $text-button; font-weight: 600;
}
.cancel-btn { background: $color-bg-subtle; color: $color-text-secondary; }
.confirm-btn { background: $color-primary; color: $color-text-inverse; }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add app/components/confirm-dialog/
git commit -m "feat: 开发确认弹窗组件"
```

---

### Task 8: 开发 RiskGauge 风险仪表盘组件（Canvas 版）

**Files:**
- Create: `app/components/risk-gauge/risk-gauge.vue`

- [ ] **Step 1: 创建 Canvas 版风险仪表盘**

Web 版使用 SVG circle strokeDasharray/dashoffset 实现圆环进度条。UniApp 中使用 Canvas 2D API 绘制：

```vue
<!-- app/components/risk-gauge/risk-gauge.vue -->
<template>
  <view class="gauge-container">
    <canvas canvas-id="riskGauge" :style="{ width: '220rpx', height: '220rpx' }" id="riskGauge" />
    <view class="gauge-center">
      <text class="gauge-score">{{ displayScore }}</text>
      <text class="gauge-label">{{ label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  score: { type: Number, default: 0 },
  level: { type: String, default: 'green' },
  label: { type: String, default: '暂无数据' }
})

const displayScore = ref(0)

const levelColors = {
  green: '#6BAF7A',
  yellow: '#E8C95A',
  orange: '#E8985E',
  red: '#D46B6B'
}

function drawGauge(score) {
  const ctx = uni.createCanvasContext('riskGauge')
  const size = 110 // 中心点
  const radius = 85
  const lineWidth = 10
  const bgColor = '#F0EDE7'
  const fgColor = levelColors[props.level] || levelColors.green
  const progress = Math.min(score, 100) / 100

  // 背景圆环
  ctx.beginPath()
  ctx.arc(size, size, radius, 0, 2 * Math.PI)
  ctx.setStrokeStyle(bgColor)
  ctx.setLineWidth(lineWidth)
  ctx.setLineCap('round')
  ctx.stroke()

  // 进度圆环（从顶部开始，顺时针）
  if (progress > 0) {
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + 2 * Math.PI * progress
    ctx.beginPath()
    ctx.arc(size, size, radius, startAngle, endAngle)
    ctx.setStrokeStyle(fgColor)
    ctx.setLineWidth(lineWidth)
    ctx.setLineCap('round')
    ctx.stroke()
  }

  ctx.draw()
}

// 数字递增动画
function animateScore(target) {
  const step = Math.max(1, Math.ceil(target / 30))
  const interval = setInterval(() => {
    displayScore.value = Math.min(displayScore.value + step, target)
    if (displayScore.value >= target) clearInterval(interval)
  }, 30)
}

onMounted(() => {
  setTimeout(() => drawGauge(props.score), 100)
  animateScore(props.score)
})

watch(() => props.score, (newVal) => {
  displayScore.value = 0
  setTimeout(() => drawGauge(newVal), 100)
  animateScore(newVal)
})
</script>

<style lang="scss" scoped>
.gauge-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: $space-base auto;
}
.gauge-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gauge-score {
  font-size: 56rpx;
  font-weight: 700;
  color: $color-text-primary;
}
.gauge-label {
  font-size: $text-caption;
  color: $color-text-secondary;
  margin-top: 4rpx;
}
</style>
```

- [ ] **Step 2: 验证**

在 Dashboard 页面临时引入，传入不同 score/level 值，确认圆环绘制和颜色正确。

- [ ] **Step 3: 提交**

```bash
git add app/components/risk-gauge/
git commit -m "feat: 开发 Canvas 风险仪表盘组件"
```

---

### Task 9: 开发 CrisisButton 危机浮动按钮

**Files:**
- Create: `app/components/crisis-button/crisis-button.vue`

- [ ] **Step 1: 创建危机浮动按钮**

Web 版使用 `position: fixed` + CSS pulse 动画。UniApp 中使用固定定位：

```vue
<!-- app/components/crisis-button/crisis-button.vue -->
<template>
  <view v-if="visible" class="crisis-btn" @tap="goToCrisis" hover-class="crisis-btn-hover">
    <text class="crisis-icon">🆘</text>
  </view>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: true }
})

function goToCrisis() {
  uni.navigateTo({ url: '/pages/crisis/crisis' })
}
</script>

<style lang="scss" scoped>
.crisis-btn {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx; /* tabBar 高度之上 */
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: $color-danger;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-crisis;
  z-index: 100;
  animation: crisisPulse 2s ease-in-out infinite;
}
.crisis-icon { font-size: 48rpx; }
.crisis-btn-hover { transform: scale(0.9); opacity: 0.9; }

@keyframes crisisPulse {
  0%, 100% { box-shadow: 0 4rpx 20rpx rgba(212,107,107,0.3); }
  50% { box-shadow: 0 4rpx 40rpx rgba(212,107,107,0.6); }
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add app/components/crisis-button/
git commit -m "feat: 开发危机浮动按钮组件"
```

---

### Task 10: 开发 GuidedPlayer 引导式练习播放器

**Files:**
- Create: `app/components/guided-player/guided-player.vue`

- [ ] **Step 1: 创建引导式练习播放器**

Web 版使用 HTML Audio + setTimeout/setInterval。UniApp 中使用 `uni.createInnerAudioContext()`：

```vue
<!-- app/components/guided-player/guided-player.vue -->
<template>
  <view class="player">
    <!-- 动画区域 -->
    <view class="animation-area">
      <view v-if="type === 'breathing'" class="breath-container">
        <view :class="['breath-circle', { 'breath-active': playing }]" />
        <text class="breath-label">{{ breathLabel }}</text>
      </view>
      <view v-else-if="type === 'bodyScan'" class="body-scan-container">
        <view class="body-outline">
          <view v-for="(part, i) in bodyParts" :key="part"
            :class="['body-part', { 'body-part-active': i <= currentIdx && playing }]">
            {{ part }}
          </view>
        </view>
      </view>
      <view v-else-if="type === 'meditation'" class="meditation-container">
        <view :class="['meditation-circle', { 'meditation-pulse': playing }]" />
        <text class="meditation-label">
          {{ finished ? '练习结束 🌱' : (playing ? '正在引导...' : '准备开始') }}
        </text>
      </view>
    </view>

    <!-- 进度条 -->
    <view class="progress-track">
      <view class="progress-fill" :style="{ width: progress + '%' }" />
    </view>

    <!-- 当前段落文字 -->
    <text class="segment-text">{{ finished ? '练习结束。你做得很棒！' : (currentSeg?.text || '') }}</text>

    <!-- 段落指示点 -->
    <view class="segment-dots">
      <view v-for="(_, i) in segments" :key="i"
        :class="['seg-dot', { 'seg-dot-active': i === currentIdx && playing, 'seg-dot-done': i < currentIdx || finished }]"
        @tap="jumpTo(i)" />
    </view>

    <!-- 计时器 -->
    <view class="timer-row">
      <text>{{ formatTime(elapsed) }}</text>
      <text>{{ formatTime(totalDuration) }}</text>
    </view>

    <!-- 控制按钮 -->
    <view class="controls">
      <view v-if="!playing && !paused" class="play-btn" @tap="handlePlay">
        <text>▶ {{ finished ? '重新播放' : '开始引导' }}</text>
      </view>
      <template v-if="playing">
        <view class="skip-btn" @tap="skipToNext"><text>⏭ 跳过</text></view>
        <view class="pause-btn" @tap="handlePause"><text>⏸ 暂停</text></view>
      </template>
      <view v-if="paused" class="play-btn" @tap="handlePlay"><text>▶ 继续</text></view>
      <view v-if="playing || paused" class="stop-btn" @tap="handleStop"><text>⏹ 结束</text></view>
    </view>

    <!-- 无音频提示 -->
    <view v-if="!hasAudio" class="notice">
      <text>音频文件暂未生成，请跟随文字自行练习</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  guided: { type: Object, required: true }
})

const { type, segments } = props.guided
const playing = ref(false)
const paused = ref(false)
const finished = ref(false)
const currentIdx = ref(0)
const countdown = ref(0)

let timerRef = null
let countdownRef = null
let innerAudio = null

const currentSeg = computed(() => segments[currentIdx.value])
const totalDuration = computed(() => segments.reduce((sum, s) => sum + s.duration, 0))
const elapsed = computed(() => {
  const past = segments.slice(0, currentIdx.value).reduce((sum, s) => sum + s.duration, 0)
  return past + (currentSeg.value ? currentSeg.value.duration - countdown.value * 1000 : 0)
})
const progress = computed(() => totalDuration.value > 0 ? Math.min(100, (elapsed.value / totalDuration.value) * 100) : 0)
const hasAudio = computed(() => segments.some(s => s.audio))
const bodyParts = computed(() => segments.filter(s => s.part).map(s => s.part))
const breathLabel = computed(() => {
  if (!playing.value && !finished.value) return '准备开始'
  const phase = currentSeg.value?.phase
  if (phase === 'observe') return '觉察当下'
  if (phase === 'breathe') return '聚焦呼吸'
  if (phase === 'expand') return '扩展觉察'
  return ''
})

function stopTimers() {
  clearTimeout(timerRef)
  clearInterval(countdownRef)
  timerRef = null
  countdownRef = null
}

function stopAudio() {
  if (innerAudio) {
    innerAudio.stop()
    innerAudio.destroy()
    innerAudio = null
  }
}

function playSegmentAudio(seg) {
  stopAudio()
  if (!seg.audio) return
  innerAudio = uni.createInnerAudioContext()
  innerAudio.src = seg.audio
  innerAudio.onError(() => { console.warn('音频播放失败:', seg.audio) })
  innerAudio.play()
}

function runSegment(idx) {
  if (idx >= segments.length) {
    finished.value = true
    playing.value = false
    stopAudio()
    return
  }
  currentIdx.value = idx
  finished.value = false
  const seg = segments[idx]
  countdown.value = Math.ceil(seg.duration / 1000)
  playSegmentAudio(seg)

  let remaining = Math.ceil(seg.duration / 1000)
  countdownRef = setInterval(() => {
    remaining--
    if (remaining <= 0) clearInterval(countdownRef)
    countdown.value = Math.max(0, remaining)
  }, 1000)

  timerRef = setTimeout(() => {
    clearInterval(countdownRef)
    runSegment(idx + 1)
  }, seg.duration)
}

function handlePlay() {
  stopTimers()
  if (finished.value) {
    finished.value = false; currentIdx.value = 0; playing.value = true; paused.value = false
    runSegment(0)
    return
  }
  if (paused.value) {
    paused.value = false; playing.value = true
    const seg = segments[currentIdx.value]
    const remaining = countdown.value * 1000
    let r2 = Math.ceil(remaining / 1000)
    countdownRef = setInterval(() => {
      r2--
      if (r2 <= 0) clearInterval(countdownRef)
      countdown.value = Math.max(0, r2)
    }, 1000)
    timerRef = setTimeout(() => { clearInterval(countdownRef); runSegment(currentIdx.value + 1) }, remaining)
    return
  }
  playing.value = true; paused.value = false
  runSegment(0)
}

function handlePause() {
  stopTimers(); stopAudio()
  paused.value = true; playing.value = false
}

function handleStop() {
  stopTimers(); stopAudio()
  playing.value = false; paused.value = false; finished.value = false
  currentIdx.value = 0; countdown.value = 0
}

function skipToNext() {
  stopTimers(); stopAudio()
  runSegment(currentIdx.value + 1)
}

function jumpTo(idx) {
  stopTimers(); stopAudio()
  playing.value = true; paused.value = false
  runSegment(idx)
}

function formatTime(ms) {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

onUnmounted(() => { stopTimers(); stopAudio() })
</script>

<style lang="scss" scoped>
.player { padding: $space-base; }
.animation-area { height: 300rpx; display: flex; align-items: center; justify-content: center; margin-bottom: $space-lg; }
/* 呼吸练习圆圈 */
.breath-circle {
  width: 200rpx; height: 200rpx; border-radius: 50%;
  background: rgba(74, 144, 217, 0.2); border: 4rpx solid $color-primary;
  transition: transform 0.5s ease;
}
.breath-active { animation: breathPulse 4s ease-in-out infinite; }
@keyframes breathPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
.breath-label { margin-top: $space-md; font-size: $text-h3; color: $color-text-secondary; text-align: center; }
.breath-container, .meditation-container { display: flex; flex-direction: column; align-items: center; }
.meditation-circle {
  width: 200rpx; height: 200rpx; border-radius: 50%;
  background: linear-gradient(135deg, rgba(107, 175, 122, 0.3), rgba(74, 144, 217, 0.3));
}
.meditation-pulse { animation: medPulse 3s ease-in-out infinite; }
@keyframes medPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(107,175,122,0.3); }
  50% { box-shadow: 0 0 40rpx 20rpx rgba(107,175,122,0.15); }
}
.meditation-label { margin-top: $space-md; font-size: $text-h3; color: $color-text-secondary; }
/* 进度条 */
.progress-track { height: 8rpx; background: $color-bg-subtle; border-radius: 4rpx; overflow: hidden; margin-bottom: $space-md; }
.progress-fill { height: 100%; background: $color-primary; border-radius: 4rpx; transition: width 0.3s ease; }
.segment-text { font-size: $text-body; color: $color-text-primary; text-align: center; margin-bottom: $space-md; line-height: 1.6; }
/* 段落指示点 */
.segment-dots { display: flex; justify-content: center; gap: 12rpx; margin-bottom: $space-base; }
.seg-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: $color-bg-subtle; }
.seg-dot-active { background: $color-primary; }
.seg-dot-done { background: $color-success; }
/* 计时器 */
.timer-row { display: flex; justify-content: space-between; font-size: $text-caption; color: $color-text-tertiary; margin-bottom: $space-lg; }
/* 控制按钮 */
.controls { display: flex; gap: $space-md; justify-content: center; flex-wrap: wrap; }
.play-btn, .pause-btn, .skip-btn, .stop-btn {
  padding: $space-md $space-xl; border-radius: $radius-full; font-size: $text-button; font-weight: 600;
}
.play-btn { background: $color-primary; color: #fff; }
.pause-btn { background: $color-accent; color: #fff; }
.skip-btn { background: $color-bg-subtle; color: $color-text-secondary; }
.stop-btn { background: $color-bg-subtle; color: $color-text-secondary; }
.notice { margin-top: $space-lg; text-align: center; font-size: $text-caption; color: $color-text-tertiary; }
/* 身体扫描 */
.body-outline { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.body-part { padding: 8rpx 20rpx; font-size: $text-body-sm; color: $color-text-tertiary; border-radius: $radius-sm; }
.body-part-active { color: $color-primary; background: $color-primary-light; font-weight: 600; }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add app/components/guided-player/
git commit -m "feat: 开发引导式练习播放器组件"
```

---

### Task 11: 开发 TrendChart 七日趋势柱状图组件

**Files:**
- Create: `app/components/trend-chart/trend-chart.vue`

- [ ] **Step 1: 创建柱状图组件**

Web 版使用 CSS flex + div 模拟柱状图。UniApp 中使用相同的 view + flex 方案：

```vue
<!-- app/components/trend-chart/trend-chart.vue -->
<template>
  <view class="chart-container">
    <view class="chart-title">近 7 天趋势</view>
    <view class="chart-legend">
      <text v-for="dim in dimensions" :key="dim.key" class="legend-item">
        {{ dim.icon }} {{ dim.label }}
      </text>
    </view>
    <scroll-view scroll-x class="chart-scroll">
      <view class="chart-body">
        <!-- Y 轴标签 -->
        <view class="y-axis">
          <text v-for="v in [5,4,3,2,1]" :key="v" class="y-label">{{ v }}</text>
        </view>
        <!-- 柱状图区域 -->
        <view class="bars-area">
          <view v-for="day in chartData" :key="day.date" class="bar-group">
            <view class="bars">
              <view v-for="dim in dimensions" :key="dim.key"
                class="bar"
                :style="{
                  height: (day.scores[dim.key] || 0) * barHeight + 'rpx',
                  backgroundColor: dim.color
                }" />
            </view>
            <text class="date-label">{{ formatDate(day.date) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  records: { type: Array, default: () => [] }
})

const barHeight = 32 // 每分对应高度(rpx)

const dimensions = [
  { key: 'sleep', label: '睡眠', icon: '😴', color: '#4A90D9' },
  { key: 'mood', label: '情绪', icon: '😊', color: '#E8985E' },
  { key: 'body', label: '身体', icon: '💪', color: '#6BAF7A' },
  { key: 'drive', label: '动力', icon: '🔥', color: '#D46B6B' },
  { key: 'cognition', label: '思维', icon: '🧠', color: '#9B8EC4' },
  { key: 'social', label: '社交', icon: '🤝', color: '#E8C95A' }
]

const chartData = computed(() => {
  const today = new Date()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const record = props.records.find(r => r.date === dateStr)
    days.push({
      date: dateStr,
      scores: record?.scores || {}
    })
  }
  return days
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style lang="scss" scoped>
.chart-container { margin: $space-base 0; }
.chart-title { font-size: $text-h3; font-weight: 600; margin-bottom: $space-sm; }
.chart-legend { display: flex; flex-wrap: wrap; gap: $space-sm; margin-bottom: $space-md; }
.legend-item { font-size: $text-caption; color: $color-text-secondary; }
.chart-scroll { white-space: nowrap; }
.chart-body { display: flex; min-width: 100%; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between;
  height: 160rpx; padding-right: $space-sm; margin-right: $space-xs; }
.y-label { font-size: 20rpx; color: $color-text-tertiary; text-align: right; }
.bars-area { flex: 1; display: flex; justify-content: space-around; }
.bar-group { display: flex; flex-direction: column; align-items: center; min-width: 60rpx; }
.bars { display: flex; align-items: flex-end; gap: 4rpx; height: 160rpx; }
.bar { width: 12rpx; border-radius: 6rpx; transition: height 0.5s ease; }
.date-label { font-size: 20rpx; color: $color-text-tertiary; margin-top: 8rpx; white-space: nowrap; }
</style>
```

- [ ] **Step 2: 提交**

```bash
git add app/components/trend-chart/
git commit -m "feat: 开发七日趋势柱状图组件"
```

---

### Task 12: 创建全局布局包装（CrisisButton 集成）

**Files:**
- Modify: 各 tabBar 页面

- [ ] **Step 1: 创建全局 mixin 或 composable 管理危机按钮显隐**

由于 UniApp 每个页面独立（非嵌套路由），CrisisButton 需在每个 tabBar 页面中引入。创建一个 composable：

```javascript
// app/composables/use-crisis-button.js
import { ref } from 'vue'

export function useCrisisButton() {
  const showCrisis = ref(true)
  return { showCrisis }
}
```

- [ ] **Step 2: 在每个 tabBar 页面引入 CrisisButton**

在 Dashboard、CBTCourse、Resources、Medication 四个 tabBar 页面的 template 底部添加：
```vue
<CrisisButton :visible="showCrisis" />
```

Crisis 页面不显示（因为本身就是危机页）。

- [ ] **Step 3: 提交**

```bash
git add app/composables/use-crisis-button.js
git commit -m "feat: 创建危机按钮全局管理 composable"
```

---

### Task 13: 开发 Welcome 欢迎页

**Files:**
- Create: `app/pages/welcome/welcome.vue`

- [ ] **Step 1: 创建欢迎页**

Web 版 Welcome 展示品牌信息、复发率数据（50% 复发率、2 年高发期、85% 可预防），引导用户进入 Dashboard。

```vue
<!-- app/pages/welcome/welcome.vue -->
<template>
  <view class="welcome-page">
    <view class="hero">
      <image class="hero-img" src="/static/images/hero.png" mode="aspectFit" />
    </view>
    <view class="brand">
      <text class="brand-name">申归途</text>
      <text class="brand-sub">抑郁症复发预防支持工具</text>
    </view>
    <view class="stats">
      <view class="stat-card">
        <text class="stat-num">50%</text>
        <text class="stat-label">复发率</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">2年</text>
        <text class="stat-label">高发期</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">85%</text>
        <text class="stat-label">可预防</text>
      </view>
    </view>
    <view class="cta" @tap="enterApp">
      <text class="cta-text">开始使用</text>
    </view>
    <text class="footer-note">本工具仅供参考，不替代专业医疗建议</text>
  </view>
</template>

<script setup>
function enterApp() {
  uni.switchTab({ url: '/pages/dashboard/dashboard' })
}
</script>

<style lang="scss" scoped>
.welcome-page {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: $space-xl; background: linear-gradient(180deg, #E8F1FB 0%, $color-bg 100%);
}
.hero { margin-bottom: $space-xl; }
.hero-img { width: 300rpx; height: 300rpx; }
.brand { text-align: center; margin-bottom: $space-2xl; }
.brand-name { font-size: 72rpx; font-weight: 700; color: $color-primary; display: block; }
.brand-sub { font-size: $text-h3; color: $color-text-secondary; margin-top: $space-sm; display: block; }
.stats { display: flex; gap: $space-lg; margin-bottom: $space-2xl; }
.stat-card {
  background: $color-bg-elevated; border-radius: $radius-lg;
  padding: $space-lg $space-xl; text-align: center;
  box-shadow: $shadow-sm; min-width: 160rpx;
}
.stat-num { font-size: $text-hero; font-weight: 700; color: $color-primary; display: block; }
.stat-label { font-size: $text-caption; color: $color-text-secondary; margin-top: 4rpx; display: block; }
.cta {
  background: $color-primary; color: #fff; border-radius: $radius-full;
  padding: $space-md 0; width: 400rpx; text-align: center;
  margin-bottom: $space-xl;
  box-shadow: $shadow-md;
}
.cta:active { opacity: 0.9; transform: scale(0.98); }
.cta-text { font-size: $text-button; font-weight: 600; color: #fff; }
.footer-note { font-size: $text-caption; color: $color-text-tertiary; }
</style>
```

- [ ] **Step 2: 验证**

点击"开始使用"后能跳转到 Dashboard（tabBar 页面）。

- [ ] **Step 3: 提交**

```bash
git add app/pages/welcome/
git commit -m "feat: 开发 Welcome 欢迎页"
```

---

### Task 14: 开发 Dashboard 仪表盘页面

**Files:**
- Create: `app/pages/dashboard/dashboard.vue`

- [ ] **Step 1: 创建仪表盘页面**

核心功能：风险仪表盘、今日签到入口、打卡天数/用药率/本周记录统计、七日趋势图、风险警告横幅、WRAP 入口。

```vue
<!-- app/pages/dashboard/dashboard.vue -->
<template>
  <view class="dashboard">
    <!-- 页面头部 -->
    <view class="header">
      <text class="title">申归途</text>
      <text class="subtitle">今天感觉怎么样？</text>
    </view>

    <!-- 风险警告横幅 -->
    <view v-if="riskInfo.level === 'red'" class="alert-banner" :style="{ backgroundColor: $risk-red-bg }">
      <text class="alert-text">⚠️ 你的风险评分偏低，建议寻求专业帮助或拨打危机热线</text>
    </view>

    <!-- 风险仪表盘 -->
    <view class="gauge-section">
      <RiskGauge :score="riskInfo.score" :level="riskInfo.level" :label="riskInfo.label" />
    </view>

    <!-- 今日签到入口 -->
    <view class="checkin-card" @tap="goCheckIn">
      <view class="checkin-info">
        <text class="checkin-title">{{ hasCheckedToday ? '✅ 今日已签到' : '📝 今日签到' }}</text>
        <text class="checkin-desc">{{ hasCheckedToday ? '点击查看详情' : '记录你的六个维度状态' }}</text>
      </view>
      <text class="checkin-arrow">→</text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-num">{{ streakDays }}</text>
        <text class="stat-label">打卡天数</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ adherenceRate }}%</text>
        <text class="stat-label">用药依从率</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ thisWeekCount }}</text>
        <text class="stat-label">本周记录</text>
      </view>
    </view>

    <!-- 七日趋势图 -->
    <view v-if="recentRecords.length > 0">
      <TrendChart :records="recentRecords" />
    </view>

    <!-- WRAP 入口 -->
    <view class="wrap-entry" @tap="goWrap">
      <text class="wrap-title">📋 WRAP 康复计划</text>
      <text class="wrap-desc">制定你的个人危机预防计划</text>
    </view>

    <!-- CrisisButton 浮动按钮 -->
    <CrisisButton :visible="true" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import RiskGauge from '@/components/risk-gauge/risk-gauge.vue'
import TrendChart from '@/components/trend-chart/trend-chart.vue'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'
import { useRiskLevel } from '@/composables/use-risk-level'
import { useCheckIn } from '@/composables/use-checkin'

const store = useStore()
const { riskInfo, recentRecords } = useRiskLevel()
const { hasCheckedToday, streakDays } = useCheckIn()

const adherenceRate = computed(() => store.getters['medication/adherenceRate'])

const thisWeekCount = computed(() => {
  const thisWeek = store.getters['checkin/recentRecords'](7)
  return thisWeek.length
})

function goCheckIn() { uni.navigateTo({ url: '/pages/checkin/checkin' }) }
function goWrap() { uni.navigateTo({ url: '/pages/wrap-plan/wrap-plan' }) }
</script>

<style lang="scss" scoped>
.dashboard { padding: $space-base; padding-bottom: 180rpx; }
.header { margin-bottom: $space-xl; }
.title { font-size: $text-h1; font-weight: 700; display: block; }
.subtitle { font-size: $text-body; color: $color-text-secondary; margin-top: $space-xs; display: block; }
.alert-banner { padding: $space-md $space-base; border-radius: $radius-md; margin-bottom: $space-base; }
.alert-text { font-size: $text-body-sm; color: $color-danger; }
.gauge-section { margin: $space-lg 0; }
.checkin-card {
  background: $color-bg-elevated; border-radius: $radius-lg; padding: $space-lg;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: $shadow-sm; margin-bottom: $space-lg;
}
.checkin-title { font-size: $text-h3; font-weight: 600; display: block; }
.checkin-desc { font-size: $text-body-sm; color: $color-text-secondary; margin-top: 4rpx; display: block; }
.checkin-arrow { font-size: $text-h2; color: $color-text-tertiary; }
.stats-row { display: flex; gap: $space-md; margin-bottom: $space-lg; }
.stat-card {
  flex: 1; background: $color-bg-elevated; border-radius: $radius-lg;
  padding: $space-md; text-align: center; box-shadow: $shadow-sm;
}
.stat-num { font-size: $text-h1; font-weight: 700; color: $color-primary; display: block; }
.stat-label { font-size: $text-caption; color: $color-text-secondary; margin-top: 4rpx; display: block; }
.wrap-entry {
  background: $color-primary-light; border-radius: $radius-lg; padding: $space-lg;
  margin-top: $space-lg;
}
.wrap-title { font-size: $text-h3; font-weight: 600; display: block; }
.wrap-desc { font-size: $text-body-sm; color: $color-text-secondary; margin-top: 4rpx; display: block; }
</style>
```

- [ ] **Step 2: 验证**

仪表盘正确显示风险评分、统计数据，点击签到卡片跳转到 CheckIn 页面。

- [ ] **Step 3: 提交**

```bash
git add app/pages/dashboard/
git commit -m "feat: 开发 Dashboard 仪表盘页面"
```

---

### Task 15: 开发 CheckIn 每日签到页面

**Files:**
- Create: `app/pages/checkin/checkin.vue`

- [ ] **Step 1: 创建签到页面**

六个维度评分（1-5分），支持备注，显示已签到状态和提交成功鼓励语。

```vue
<!-- app/pages/checkin/checkin.vue -->
<template>
  <view class="checkin-page">
    <view class="header">
      <text class="title">每日签到</text>
      <text class="subtitle">记录你今天的六个维度状态</text>
    </view>

    <!-- 已签到状态 -->
    <view v-if="hasCheckedToday && !showSuccess && !editing" class="checked-card">
      <text class="checked-title">✅ 今日已完成签到</text>
      <view class="checked-scores">
        <view v-for="dim in dimensions" :key="dim.key" class="score-item">
          <text>{{ dim.icon }} {{ dim.label }}: {{ todayRecord.scores[dim.key] }}分</text>
        </view>
      </view>
      <view v-if="todayRecord.note" class="checked-note">
        <text>📝 {{ todayRecord.note }}</text>
      </view>
      <view class="btn-row">
        <view class="edit-btn" @tap="startEdit"><text>修改</text></view>
      </view>
    </view>

    <!-- 签到表单 -->
    <view v-else>
      <view v-for="dim in dimensions" :key="dim.key" class="dim-section">
        <text class="dim-label">{{ dim.icon }} {{ dim.label }}</text>
        <view class="score-btns">
          <view v-for="n in 5" :key="n"
            :class="['score-btn', { 'score-btn-active': scores[dim.key] === n }]"
            @tap="setScore(dim.key, n)">
            <text>{{ n }}</text>
          </view>
        </view>
      </view>

      <view class="note-section">
        <text class="note-label">📝 备注</text>
        <textarea v-model="note" class="note-input" placeholder="今天有什么想记录的吗？" maxlength="200" />
      </view>

      <view class="submit-area">
        <view class="submit-btn" @tap="handleSubmit">
          <text>{{ canSubmit ? '提交签到 🌟' : '请完成所有评分' }}</text>
        </view>
      </view>
    </view>

    <!-- 提交成功 -->
    <view v-if="showSuccess" class="success-card">
      <text class="success-emoji">🎉</text>
      <text class="success-text">{{ encouragement }}</text>
      <view class="back-btn" @tap="goBack">
        <text>返回</text>
      </view>
    </view>

    <CrisisButton :visible="true" />
  </view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'
import { useCheckIn } from '@/composables/use-checkin'

const { hasCheckedToday, todayRecord, submitCheckIn } = useCheckIn()

const dimensions = [
  { key: 'sleep', label: '睡眠', icon: '😴' },
  { key: 'mood', label: '情绪', icon: '😊' },
  { key: 'body', label: '身体', icon: '💪' },
  { key: 'drive', label: '动力', icon: '🔥' },
  { key: 'cognition', label: '思维', icon: '🧠' },
  { key: 'social', label: '社交', icon: '🤝' }
]

const scores = reactive({ sleep: 0, mood: 0, body: 0, drive: 0, cognition: 0, social: 0 })
const note = ref('')
const showSuccess = ref(false)
const editing = ref(false)

const encouragements = ['你做得很棒！坚持记录是康复的重要一步 🌟', '每一天的记录都在帮助你更好地了解自己 💪', '感谢你今天的记录！你正在变得更强 🌱', '记录本身就是勇气，为你骄傲 ❤️']

const canSubmit = computed(() => Object.values(scores).every(v => v > 0))
const encouragement = computed(() => encouragements[Math.floor(Math.random() * encouragements.length)])

function setScore(key, val) { scores[key] = val }

function startEdit() {
  editing.value = true
  Object.assign(scores, todayRecord.value.scores)
  note.value = todayRecord.value.note || ''
}

function handleSubmit() {
  if (!canSubmit.value) return
  submitCheckIn({ ...scores }, note.value)
  showSuccess.value = true
}

function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.checkin-page { padding: $space-base; padding-bottom: 180rpx; }
.header { margin-bottom: $space-xl; }
.title { font-size: $text-h1; font-weight: 700; display: block; }
.subtitle { font-size: $text-body; color: $color-text-secondary; margin-top: $space-xs; display: block; }
.dim-section { margin-bottom: $space-lg; }
.dim-label { font-size: $text-h3; font-weight: 600; margin-bottom: $space-sm; display: block; }
.score-btns { display: flex; gap: $space-md; }
.score-btn {
  width: 80rpx; height: 80rpx; border-radius: $radius-md;
  background: $color-bg-subtle; display: flex; align-items: center; justify-content: center;
  font-size: $text-h3; font-weight: 600; color: $color-text-secondary;
}
.score-btn-active { background: $color-primary; color: #fff; }
.note-section { margin-bottom: $space-xl; }
.note-label { font-size: $text-h3; font-weight: 600; margin-bottom: $space-sm; display: block; }
.note-input {
  width: 100%; min-height: 150rpx; padding: $space-base; background: $color-bg-elevated;
  border-radius: $radius-md; font-size: $text-body; box-sizing: border-box;
}
.submit-btn {
  background: $color-primary; color: #fff; border-radius: $radius-full;
  padding: $space-md 0; text-align: center; font-size: $text-button; font-weight: 600;
}
.checked-card { background: $color-bg-elevated; border-radius: $radius-lg; padding: $space-xl; box-shadow: $shadow-sm; }
.checked-title { font-size: $text-h2; font-weight: 600; display: block; margin-bottom: $space-base; }
.checked-scores { display: flex; flex-direction: column; gap: $space-sm; }
.score-item { font-size: $text-body-sm; color: $color-text-secondary; }
.checked-note { margin-top: $space-md; font-size: $text-body-sm; color: $color-text-secondary; }
.btn-row { margin-top: $space-lg; }
.edit-btn { background: $color-bg-subtle; border-radius: $radius-md; padding: $space-md $space-xl; display: inline-block; }
.success-card { text-align: center; padding: $space-2xl 0; }
.success-emoji { font-size: 120rpx; display: block; margin-bottom: $space-lg; }
.success-text { font-size: $text-h2; color: $color-text-primary; display: block; margin-bottom: $space-xl; }
.back-btn { background: $color-primary; color: #fff; border-radius: $radius-full; padding: $space-md $space-xl; display: inline-block; }
</style>
```

- [ ] **Step 2: 验证**

完成六维度评分后可提交，数据正确存入 Storage。

- [ ] **Step 3: 提交**

```bash
git add app/pages/checkin/
git commit -m "feat: 开发每日签到页面"
```

---

### Task 16: 开发 Medication 用药管理主页

**Files:**
- Create: `app/pages/medication/medication.vue`

- [ ] **Step 1: 创建用药管理主页面**

核心功能：依从率圆环、连续服药天数、药物列表（服药/跳过）、添加药物表单、四个子功能入口。

```vue
<!-- app/pages/medication/medication.vue -->
<template>
  <view class="medication-page">
    <view class="header">
      <text class="title">用药管理 💊</text>
    </view>

    <!-- 依从率 + 连续天数 -->
    <view class="stats-row">
      <view class="adherence-card">
        <view class="adherence-circle" :style="{ background: conicGradient }">
          <text class="adherence-num">{{ adherenceRate }}%</text>
        </view>
        <text class="adherence-label">用药依从率</text>
      </view>
      <view class="streak-card">
        <text class="streak-num">{{ consecutiveDays }}</text>
        <text class="streak-label">连续服药天数</text>
      </view>
    </view>

    <!-- 今日药物列表 -->
    <view class="section">
      <text class="section-title">今日用药</text>
      <view v-if="medications.length === 0" class="empty-hint">
        <text>暂无药物，请添加</text>
      </view>
      <view v-for="med in medications" :key="med.id" class="med-card">
        <view class="med-info">
          <text class="med-name">{{ med.name }}</text>
          <text class="med-dose">{{ med.dose }} · {{ med.frequency }}</text>
        </view>
        <view class="med-actions">
          <view v-if="!isTakenToday(med.id)" class="action-btn taken-btn" @tap="takeMed(med.id)">
            <text>✅ 服药</text>
          </view>
          <view v-if="!isTakenToday(med.id)" class="action-btn skip-btn" @tap="skipMed(med.id)">
            <text>⏭ 跳过</text>
          </view>
          <view v-if="isTakenToday(med.id)" class="action-btn done-btn">
            <text>已服</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加药物 -->
    <view class="add-section">
      <text class="section-title">添加药物</text>
      <view class="add-form">
        <input v-model="newMed.name" class="form-input" placeholder="药物名称" />
        <input v-model="newMed.dose" class="form-input" placeholder="剂量 (如 10mg)" />
        <input v-model="newMed.frequency" class="form-input" placeholder="频率 (如 每日一次)" />
        <view class="add-btn" @tap="addMedication"><text>+ 添加</text></view>
      </view>
    </view>

    <!-- 子功能入口 -->
    <view class="features-grid">
      <view class="feature-card" @tap="goTo('knowledge')">
        <text class="feature-icon">📖</text>
        <text class="feature-name">药物知识</text>
      </view>
      <view class="feature-card" @tap="goTo('sideEffects')">
        <text class="feature-icon">📋</text>
        <text class="feature-name">副作用追踪</text>
      </view>
      <view class="feature-card" @tap="goTo('moodCorrelation')">
        <text class="feature-icon">📊</text>
        <text class="feature-name">情绪关联</text>
      </view>
      <view class="feature-card" @tap="goTo('taper')">
        <text class="feature-icon">🔄</text>
        <text class="feature-name">减药导航</text>
      </view>
    </view>

    <CrisisButton :visible="true" />
  </view>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useStore } from 'vuex'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'

const store = useStore()

const medications = computed(() => store.state.medication.medications)
const adherenceRate = computed(() => store.getters['medication/adherenceRate'])
const consecutiveDays = computed(() => store.getters['medication/consecutiveDays'])
const todayRecords = computed(() => store.getters['medication/todayRecords'])

const newMed = reactive({ name: '', dose: '', frequency: '' })

function isTakenToday(medId) {
  return todayRecords.value.some(r => r.medId === medId && r.status === 'taken')
}

function takeMed(medId) {
  const today = new Date().toISOString().slice(0, 10)
  store.commit('medication/ADD_RECORD', { date: today, medId, status: 'taken', timestamp: Date.now() })
}

function skipMed(medId) {
  const today = new Date().toISOString().slice(0, 10)
  store.commit('medication/ADD_RECORD', { date: today, medId, status: 'skipped', timestamp: Date.now() })
}

function addMedication() {
  if (!newMed.name || !newMed.dose) return
  store.commit('medication/ADD_MEDICATION', {
    id: Date.now().toString(),
    name: newMed.name,
    dose: newMed.dose,
    frequency: newMed.frequency || '每日一次'
  })
  newMed.name = ''; newMed.dose = ''; newMed.frequency = ''
}

function goTo(page) {
  const routes = {
    knowledge: '/pages/medication/med-knowledge',
    sideEffects: '/pages/medication/side-effect-tracker',
    moodCorrelation: '/pages/medication/mood-correlation',
    taper: '/pages/medication/taper-navigator'
  }
  uni.navigateTo({ url: routes[page] })
}
</script>

<style lang="scss" scoped>
.medication-page { padding: $space-base; padding-bottom: 180rpx; }
.header { margin-bottom: $space-xl; }
.title { font-size: $text-h1; font-weight: 700; }
.stats-row { display: flex; gap: $space-lg; margin-bottom: $space-xl; }
.adherence-card { flex: 1; background: $color-bg-elevated; border-radius: $radius-lg; padding: $space-lg; text-align: center; box-shadow: $shadow-sm; }
.adherence-circle {
  width: 120rpx; height: 120rpx; border-radius: 50%; margin: 0 auto $space-sm;
  display: flex; align-items: center; justify-content: center;
}
.adherence-num { font-size: $text-h2; font-weight: 700; color: $color-primary; }
.adherence-label { font-size: $text-caption; color: $color-text-secondary; }
.streak-card { flex: 1; background: $color-bg-elevated; border-radius: $radius-lg; padding: $space-lg; text-align: center; box-shadow: $shadow-sm; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.streak-num { font-size: $text-hero; font-weight: 700; color: $color-success; }
.streak-label { font-size: $text-caption; color: $color-text-secondary; margin-top: $space-xs; }
.section { margin-bottom: $space-xl; }
.section-title { font-size: $text-h3; font-weight: 600; margin-bottom: $space-md; display: block; }
.empty-hint { color: $color-text-tertiary; font-size: $text-body-sm; }
.med-card {
  background: $color-bg-elevated; border-radius: $radius-md; padding: $space-md $space-base;
  margin-bottom: $space-sm; display: flex; align-items: center; justify-content: space-between;
  box-shadow: $shadow-sm;
}
.med-name { font-size: $text-body; font-weight: 600; display: block; }
.med-dose { font-size: $text-caption; color: $color-text-secondary; }
.med-actions { display: flex; gap: $space-sm; }
.action-btn { padding: 8rpx 20rpx; border-radius: $radius-sm; font-size: $text-caption; }
.taken-btn { background: $risk-green-bg; color: $risk-green; }
.skip-btn { background: $color-bg-subtle; color: $color-text-secondary; }
.done-btn { background: $color-primary-light; color: $color-primary; }
.add-form { display: flex; flex-direction: column; gap: $space-sm; }
.form-input {
  background: $color-bg-elevated; padding: $space-md; border-radius: $radius-md;
  font-size: $text-body;
}
.add-btn {
  background: $color-primary; color: #fff; border-radius: $radius-md;
  padding: $space-md; text-align: center; font-weight: 600;
}
.features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: $space-md; }
.feature-card {
  background: $color-bg-elevated; border-radius: $radius-lg; padding: $space-lg;
  text-align: center; box-shadow: $shadow-sm;
}
.feature-icon { font-size: 60rpx; display: block; margin-bottom: $space-sm; }
.feature-name { font-size: $text-body-sm; font-weight: 600; color: $color-text-primary; }
</style>
```

- [ ] **Step 2: 验证**

添加药物、服药/跳过操作正确，数据持久化。

- [ ] **Step 3: 提交**

```bash
git add app/pages/medication/medication.vue
git commit -m "feat: 开发用药管理主页"
```

---

### Task 17: 开发 Medication 子页面（药物知识、副作用追踪、情绪关联、减药导航）

**Files:**
- Create: `app/pages/medication/med-knowledge.vue`
- Create: `app/pages/medication/side-effect-tracker.vue`
- Create: `app/pages/medication/mood-correlation.vue`
- Create: `app/pages/medication/taper-navigator.vue`

- [ ] **Step 1: 创建药物知识页面**

从 `shen-gui-tu/src/pages/Medication/MedKnowledge.jsx` 迁移，展示药物知识库数据（`medicationKnowledge.js`），支持分类筛选和详情展示。

- [ ] **Step 2: 创建副作用追踪页面**

从 `shen-gui-tu/src/pages/Medication/SideEffectTracker.jsx` 迁移，支持副作用记录（日期、症状、严重程度、应对措施），数据存入 Vuex `medication/sideEffectRecords`。

- [ ] **Step 3: 创建情绪关联分析页面**

从 `shen-gui-tu/src/pages/Medication/MoodCorrelation.jsx` 迁移，对比用药记录和签到数据，展示药物-情绪关联图表。

- [ ] **Step 4: 创建减药导航页面**

从 `shen-gui-tu/src/pages/Medication/TaperNavigator.jsx` 迁移，提供减药方案指引和进度追踪。

- [ ] **Step 5: 验证**

所有子页面正确渲染，数据读写正常。

- [ ] **Step 6: 提交**

```bash
git add app/pages/medication/
git commit -m "feat: 开发用药管理四个子页面"
```

---

### Task 18: 开发 Crisis 危机干预页面

**Files:**
- Create: `app/pages/crisis/crisis.vue`

- [ ] **Step 1: 创建危机干预页面**

核心功能：紧急电话一键拨打、4-7-8 呼吸放松法交互练习、安全小贴士。

```vue
<!-- app/pages/crisis/crisis.vue -->
<template>
  <view class="crisis-page">
    <view class="header">
      <text class="title">🆘 危机干预</text>
      <text class="subtitle">你不是一个人，求助是勇敢的行为</text>
    </view>

    <!-- 紧急电话列表 -->
    <view class="hotlines-section">
      <view v-for="line in hotlines" :key="line.name" class="hotline-card" @tap="callPhone(line.number)">
        <view class="hotline-name">{{ line.featured ? '🔴' : '📞' }} {{ line.name }}</view>
        <view class="hotline-number">{{ line.number }}</view>
        <view class="hotline-info">{{ line.hours }} {{ line.featured ? '· 免费' : '' }}</view>
      </view>
    </view>

    <!-- 4-7-8 呼吸练习 -->
    <view class="breathing-section">
      <text class="section-title">🌬️ 4-7-8 呼吸放松法</text>
      <view class="breath-area">
        <view :class="['breath-circle', breathPhase]" />
        <text class="breath-text">{{ breathLabel }}</text>
        <text class="breath-timer">{{ breathTimer }}</text>
      </view>
      <view class="breath-controls">
        <view v-if="!breathing" class="start-btn" @tap="startBreathing"><text>开始练习</text></view>
        <view v-else class="stop-btn" @tap="stopBreathing"><text>停止</text></view>
      </view>
    </view>

    <!-- 安全小贴士 -->
    <view class="tips-section">
      <text class="section-title">💡 安全小贴士</text>
      <view v-for="tip in safetyTips" :key="tip" class="tip-item">
        <text>{{ tip }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { hotlines } from '@/data/hotlines'

const breathing = ref(false)
const breathPhase = ref('')
const breathLabel = ref('准备开始')
const breathTimer = ref('')
let breathInterval = null
let breathTimeout = null

const safetyTips = [
  '你现在经历的一切都是暂时的',
  '深呼吸，专注于当下这一刻',
  '联系一个你信任的人',
  '远离危险物品和环境',
  '记住：求助不是软弱，是保护自己的方式'
]

function callPhone(number) {
  uni.makePhoneCall({ phoneNumber: number })
}

function startBreathing() {
  breathing.value = true
  runBreathCycle()
}

function runBreathCycle() {
  // 吸气 4s
  breathPhase.value = 'inhale'
  breathLabel.value = '吸气...'
  let countdown = 4
  breathTimer.value = countdown + 's'
  breathInterval = setInterval(() => {
    countdown--
    breathTimer.value = countdown + 's'
    if (countdown <= 0) clearInterval(breathInterval)
  }, 1000)

  breathTimeout = setTimeout(() => {
    // 屏息 7s
    breathPhase.value = 'hold'
    breathLabel.value = '屏息...'
    countdown = 7
    breathTimer.value = countdown + 's'
    breathInterval = setInterval(() => {
      countdown--
      breathTimer.value = countdown + 's'
      if (countdown <= 0) clearInterval(breathInterval)
    }, 1000)

    breathTimeout = setTimeout(() => {
      // 呼气 8s
      breathPhase.value = 'exhale'
      breathLabel.value = '呼气...'
      countdown = 8
      breathTimer.value = countdown + 's'
      breathInterval = setInterval(() => {
        countdown--
        breathTimer.value = countdown + 's'
        if (countdown <= 0) clearInterval(breathInterval)
      }, 1000)

      breathTimeout = setTimeout(() => {
        if (breathing.value) runBreathCycle()
      }, 8000)
    }, 7000)
  }, 4000)
}

function stopBreathing() {
  breathing.value = false
  breathPhase.value = ''
  breathLabel.value = '准备开始'
  breathTimer.value = ''
  clearInterval(breathInterval)
  clearTimeout(breathTimeout)
}

onUnmounted(() => { clearInterval(breathInterval); clearTimeout(breathTimeout) })
</script>

<style lang="scss" scoped>
.crisis-page { padding: $space-base; min-height: 100vh; background: linear-gradient(180deg, $risk-red-bg, $color-bg); }
.header { text-align: center; margin-bottom: $space-xl; }
.title { font-size: $text-h1; font-weight: 700; display: block; }
.subtitle { font-size: $text-body; color: $color-text-secondary; margin-top: $space-xs; display: block; }
.hotlines-section { margin-bottom: $space-xl; }
.hotline-card {
  background: $color-bg-elevated; border-radius: $radius-md; padding: $space-base;
  margin-bottom: $space-sm; box-shadow: $shadow-sm;
}
.hotline-name { font-size: $text-body; font-weight: 600; display: block; }
.hotline-number { font-size: $text-h2; font-weight: 700; color: $color-danger; display: block; margin-top: $space-xs; }
.hotline-info { font-size: $text-caption; color: $color-text-secondary; margin-top: 4rpx; }
.section-title { font-size: $text-h3; font-weight: 600; margin-bottom: $space-md; display: block; }
.breathing-section { margin-bottom: $space-xl; }
.breath-area { display: flex; flex-direction: column; align-items: center; padding: $space-xl 0; }
.breath-circle {
  width: 240rpx; height: 240rpx; border-radius: 50%;
  background: rgba(74, 144, 217, 0.15); border: 4rpx solid $color-primary;
  margin-bottom: $space-lg; transition: transform 1s ease;
}
.breath-circle.inhale { transform: scale(1.3); }
.breath-circle.hold { transform: scale(1.3); border-color: $color-warning; }
.breath-circle.exhale { transform: scale(1.0); }
.breath-text { font-size: $text-h2; font-weight: 600; margin-bottom: $space-sm; }
.breath-timer { font-size: $text-h1; font-weight: 700; color: $color-primary; }
.breath-controls { display: flex; justify-content: center; margin-top: $space-lg; }
.start-btn { background: $color-primary; color: #fff; border-radius: $radius-full; padding: $space-md $space-xl; }
.stop-btn { background: $color-danger; color: #fff; border-radius: $radius-full; padding: $space-md $space-xl; }
.tips-section { margin-bottom: $space-xl; }
.tip-item {
  background: $color-bg-elevated; border-radius: $radius-md; padding: $space-md $space-base;
  margin-bottom: $space-sm; font-size: $text-body-sm; color: $color-text-secondary;
}
</style>
```

- [ ] **Step 2: 验证**

拨打功能正常（模拟器中会有确认弹窗），呼吸练习动画流畅。

- [ ] **Step 3: 提交**

```bash
git add app/pages/crisis/
git commit -m "feat: 开发危机干预页面"
```

---

### Task 19: 开发 Resources 资源服务页面

**Files:**
- Create: `app/pages/resources/resources.vue`
- Create: `app/pages/resources/family-tab.vue`
- Create: `app/pages/resources/rebuild-tab.vue`

- [ ] **Step 1: 创建资源服务主页**

6 个 Tab（医院、热线、社区、医保、家属、重建），使用 scroll-view 横向滚动 Tab 栏：

```vue
<!-- app/pages/resources/resources.vue -->
<template>
  <view class="resources-page">
    <view class="header">
      <text class="title">服务中心 📚</text>
      <text class="subtitle">上海本地心理健康服务</text>
    </view>

    <!-- Tab 栏 -->
    <scroll-view scroll-x class="tabs-scroll">
      <view class="tabs">
        <view v-for="(tab, i) in tabs" :key="tab.key"
          :class="['tab-item', { 'tab-active': activeTab === i }]"
          @tap="activeTab = i">
          <text>{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- Tab 内容 -->
    <!-- 医院 -->
    <view v-if="activeTab === 0" class="panel">
      <picker :range="areas" @change="onAreaChange" class="filter-picker">
        <text class="filter-text">📍 {{ selectedArea }}</text>
      </picker>
      <view v-for="h in filteredHospitals" :key="h.id" class="res-card" @tap="callPhone(h.phone)">
        <text class="card-name">{{ h.name }}</text>
        <text class="card-info">{{ h.level }} · {{ h.address }}</text>
        <view class="card-tags">
          <text v-for="t in h.tags" :key="t" class="tag">{{ t }}</text>
        </view>
        <text class="card-link">📞 {{ h.phone }}</text>
      </view>
    </view>

    <!-- 热线 -->
    <view v-if="activeTab === 1" class="panel">
      <view v-for="h in hotlinesData" :key="h.id" :class="['hotline-card', { featured: h.featured }]" @tap="callPhone(h.number)">
        <text class="hotline-name">{{ h.featured ? '🔴' : '📞' }} {{ h.name }}</text>
        <text class="hotline-num">{{ h.number }}</text>
        <text class="hotline-time">{{ h.hours }} {{ h.featured ? '· 免费' : '' }}</text>
      </view>
    </view>

    <!-- 社区 / 医保 / 家属 / 重建 -->
    <view v-if="activeTab === 2" class="panel">
      <!-- 社区资源列表 -->
    </view>
    <view v-if="activeTab === 3" class="panel">
      <!-- 医保政策列表 -->
    </view>
    <FamilyTab v-if="activeTab === 4" />
    <RebuildTab v-if="activeTab === 5" />

    <CrisisButton :visible="true" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { hospitals, areas } from '@/data/hospitals'
import { hotlines as hotlinesData } from '@/data/hotlines'
import { communityResources } from '@/data/community'
import { insurancePolicies } from '@/data/insurance'
import FamilyTab from './family-tab.vue'
import RebuildTab from './rebuild-tab.vue'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'

const tabs = [
  { key: 'hospitals', label: '🏥 医院' },
  { key: 'hotlines', label: '📞 热线' },
  { key: 'community', label: '🏘️ 社区' },
  { key: 'insurance', label: '📋 医保' },
  { key: 'family', label: '👨‍👩‍👧 家属' },
  { key: 'rebuild', label: '🌱 重建' }
]

const activeTab = ref(0)
const selectedArea = ref('全部区域')

const filteredHospitals = computed(() => {
  return selectedArea.value === '全部区域'
    ? hospitals
    : hospitals.filter(h => h.area === selectedArea.value)
})

function onAreaChange(e) { selectedArea.value = areas[e.detail.value] }
function callPhone(number) { uni.makePhoneCall({ phoneNumber: number }) }
</script>

<style lang="scss" scoped>
.resources-page { padding: $space-base; padding-bottom: 180rpx; }
.header { margin-bottom: $space-xl; }
.title { font-size: $text-h1; font-weight: 700; display: block; }
.subtitle { font-size: $text-body; color: $color-text-secondary; margin-top: $space-xs; display: block; }
.tabs-scroll { white-space: nowrap; margin-bottom: $space-lg; }
.tabs { display: flex; gap: $space-sm; padding-bottom: $space-sm; }
.tab-item {
  padding: $space-sm $space-md; border-radius: $radius-full;
  background: $color-bg-subtle; font-size: $text-body-sm; color: $color-text-secondary;
  flex-shrink: 0;
}
.tab-active { background: $color-primary; color: #fff; }
.panel { padding-top: $space-sm; }
.filter-picker { margin-bottom: $space-md; }
.filter-text { font-size: $text-body-sm; color: $color-primary; }
.res-card {
  background: $color-bg-elevated; border-radius: $radius-md; padding: $space-base;
  margin-bottom: $space-sm; box-shadow: $shadow-sm;
}
.card-name { font-size: $text-body; font-weight: 600; display: block; }
.card-info { font-size: $text-caption; color: $color-text-secondary; margin-top: 4rpx; display: block; }
.card-tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: $space-sm; }
.tag { font-size: 22rpx; padding: 4rpx 12rpx; background: $color-primary-light; color: $color-primary; border-radius: $radius-sm; }
.card-link { font-size: $text-body-sm; color: $color-primary; margin-top: $space-sm; display: block; }
.hotline-card {
  background: $color-bg-elevated; border-radius: $radius-md; padding: $space-base;
  margin-bottom: $space-sm;
}
.featured { border-left: 6rpx solid $color-danger; }
.hotline-name { font-size: $text-body; font-weight: 600; display: block; }
.hotline-num { font-size: $text-h2; font-weight: 700; color: $color-danger; display: block; }
.hotline-time { font-size: $text-caption; color: $color-text-secondary; }
</style>
```

- [ ] **Step 2: 创建 family-tab.vue 和 rebuild-tab.vue**

分别从 `shen-gui-tu/src/pages/Resources/FamilyTab.jsx` 和 `RebuildTab.jsx` 迁移，保持功能一致。

- [ ] **Step 3: 验证**

Tab 切换流畅，医院筛选、电话拨打正常，家属/重建 Tab 数据展示正确。

- [ ] **Step 4: 提交**

```bash
git add app/pages/resources/
git commit -m "feat: 开发资源服务中心页面"
```

---

### Task 20: 开发 CBTCourse CBT 课程页面

**Files:**
- Create: `app/pages/cbt-course/cbt-course.vue`

- [ ] **Step 1: 创建 CBT 课程页面**

从 `shen-gui-tu/src/pages/CBTCourse/CBTCourse.jsx` 迁移。按 tier 分组展示课程（CBT/MBCT/WRAP/ACT），支持课程解锁（前置依赖检查）、步骤式学习、完成进度持久化。

```vue
<!-- app/pages/cbt-course/cbt-course.vue -->
<template>
  <view class="cbt-page">
    <view class="header">
      <text class="title">CBT 循证课程 🧠</text>
      <text class="subtitle">认知行为疗法 · 循证支持</text>
    </view>

    <scroll-view scroll-y class="courses-list">
      <view v-for="(tier, tierKey) in groupedCourses" :key="tierKey" class="tier-group">
        <view class="tier-header" @tap="toggleTier(tierKey)">
          <text class="tier-title">{{ tier.title }}</text>
          <text class="tier-toggle">{{ expandedTiers[tierKey] ? '▼' : '▶' }}</text>
        </view>

        <view v-if="expandedTiers[tierKey]" class="tier-courses">
          <view v-for="course in tier.courses" :key="course.id" class="course-card" @tap="openCourse(course)">
            <view class="course-info">
              <text class="course-name">{{ course.icon }} {{ course.name }}</text>
              <text class="course-desc">{{ course.description }}</text>
            </view>
            <view v-if="isCourseLocked(course)" class="lock-badge">
              <text>🔒 需要: {{ getPrereqName(course.prerequisites) }}</text>
            </view>
            <view v-if="getCourseProgress(course) === 100" class="progress-badge done">
              <text>✅ 已完成</text>
            </view>
            <view v-else-if="getCourseProgress(course) > 0" class="progress-badge">
              <text>{{ getCourseProgress(course) }}%</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 课程详情弹窗 -->
    <view v-if="activeCourse" class="course-modal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ activeCourse.icon }} {{ activeCourse.name }}</text>
          <text class="modal-close" @tap="closeCourse">✕</text>
        </view>
        <scroll-view scroll-y class="modal-body">
          <view v-for="(step, i) in activeCourse.steps" :key="i" class="step-item">
            <view :class="['step-marker', { 'step-done': isStepDone(activeCourse.id, i), 'step-active': currentStep === i }]">
              <text>{{ i + 1 }}</text>
            </view>
            <view class="step-content">
              <text class="step-title">{{ step.title }}</text>
              <text class="step-text">{{ step.text }}</text>
              <!-- 引导式练习 -->
              <GuidedPlayer v-if="step.guided && currentStep === i" :guided="step.guided" />
            </view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <view v-if="currentStep > 0" class="nav-btn prev" @tap="prevStep"><text>上一步</text></view>
          <view v-if="currentStep < activeCourse.steps.length - 1" class="nav-btn next" @tap="nextStep"><text>下一步</text></view>
          <view v-else class="nav-btn complete" @tap="completeCourse"><text>完成课程</text></view>
        </view>
      </view>
    </view>

    <CrisisButton :visible="true" />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { cbtCourses, tierInfo } from '@/data/cbt-content'
import GuidedPlayer from '@/components/guided-player/guided-player.vue'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'

const store = useStore()
const expandedTiers = reactive(Object.fromEntries(Object.keys(tierInfo).map(k => [k, true])))
const activeCourse = ref(null)
const currentStep = ref(0)

const groupedCourses = computed(() => {
  const result = {}
  for (const [tierKey, info] of Object.entries(tierInfo)) {
    result[tierKey] = {
      title: info.title,
      courses: cbtCourses.filter(c => c.tier === tierKey)
    }
  }
  return result
})

function toggleTier(key) { expandedTiers[key] = !expandedTiers[key] }

function isCourseLocked(course) {
  if (!course.prerequisites) return false
  return course.prerequisites.some(preId => {
    const pre = cbtCourses.find(c => c.id === preId)
    return pre && getCourseProgress(pre) < 100
  })
}

function getCourseProgress(course) {
  if (!course.steps) return 0
  const done = course.steps.filter((_, i) => isStepDone(course.id, i)).length
  return Math.round((done / course.steps.length) * 100)
}

function isStepDone(courseId, stepIdx) {
  return store.getters['cbt/isStepComplete'](courseId, stepIdx)
}

function getPrereqName(prereqs) {
  return prereqs.map(id => cbtCourses.find(c => c.id === id)?.name || id).join(', ')
}

function openCourse(course) {
  if (isCourseLocked(course)) return
  activeCourse.value = course
  currentStep.value = 0
}

function closeCourse() { activeCourse.value = null }

function prevStep() { currentStep.value = Math.max(0, currentStep.value - 1) }
function nextStep() {
  const step = currentStep.value
  store.commit('cbt/COMPLETE_STEP', { courseId: activeCourse.value.id, stepIdx: step })
  currentStep.value++
}

function completeCourse() {
  store.commit('cbt/COMPLETE_STEP', { courseId: activeCourse.value.id, stepIdx: currentStep.value })
  activeCourse.value = null
}
</script>

<style lang="scss" scoped>
.cbt-page { padding: $space-base; padding-bottom: 180rpx; }
.header { margin-bottom: $space-xl; }
.title { font-size: $text-h1; font-weight: 700; display: block; }
.subtitle { font-size: $text-body; color: $color-text-secondary; margin-top: $space-xs; display: block; }
.tier-group { margin-bottom: $space-lg; }
.tier-header {
  background: $color-bg-elevated; border-radius: $radius-md; padding: $space-md $space-base;
  display: flex; align-items: center; justify-content: space-between;
}
.tier-title { font-size: $text-h3; font-weight: 600; }
.tier-toggle { font-size: $text-caption; color: $color-text-tertiary; }
.course-card {
  background: $color-bg-elevated; border-radius: $radius-md; padding: $space-base;
  margin: $space-sm 0 0 $space-lg; box-shadow: $shadow-sm;
}
.course-name { font-size: $text-body; font-weight: 600; display: block; }
.course-desc { font-size: $text-caption; color: $color-text-secondary; margin-top: 4rpx; display: block; }
.lock-badge { margin-top: $space-sm; font-size: $text-caption; color: $color-warning; }
.progress-badge { margin-top: $space-sm; font-size: $text-caption; color: $color-primary; }
.done { color: $color-success; }
/* 课程弹窗 */
.course-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-content { width: 90%; max-height: 85vh; background: #fff; border-radius: $radius-lg; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: $space-lg $space-base; display: flex; align-items: center; justify-content: space-between; border-bottom: 1rpx solid $color-border-light; }
.modal-title { font-size: $text-h2; font-weight: 700; flex: 1; }
.modal-close { font-size: $text-h2; color: $color-text-tertiary; padding: $space-sm; }
.modal-body { flex: 1; padding: $space-base; max-height: 60vh; }
.step-item { display: flex; gap: $space-md; margin-bottom: $space-lg; }
.step-marker {
  width: 56rpx; height: 56rpx; border-radius: 50%; background: $color-bg-subtle;
  display: flex; align-items: center; justify-content: center;
  font-size: $text-body-sm; font-weight: 600; color: $color-text-tertiary; flex-shrink: 0;
}
.step-active { background: $color-primary; color: #fff; }
.step-done { background: $color-success; color: #fff; }
.step-title { font-size: $text-h3; font-weight: 600; display: block; }
.step-text { font-size: $text-body-sm; color: $color-text-secondary; margin-top: 4rpx; display: block; line-height: 1.6; }
.modal-footer { padding: $space-md $space-base; display: flex; gap: $space-md; justify-content: space-between; border-top: 1rpx solid $color-border-light; }
.nav-btn {
  padding: $space-md $space-xl; border-radius: $radius-full; font-size: $text-button; font-weight: 600;
}
.prev { background: $color-bg-subtle; color: $color-text-secondary; }
.next { background: $color-primary; color: #fff; }
.complete { background: $color-success; color: #fff; }
</style>
```

- [ ] **Step 2: 验证**

课程分组展示正确，解锁逻辑有效，步骤学习流程正常，进度持久化。

- [ ] **Step 3: 提交**

```bash
git add app/pages/cbt-course/
git commit -m "feat: 开发 CBT 课程页面"
```

---

### Task 21: 开发 WRAPPlan 康复计划页面

**Files:**
- Create: `app/pages/wrap-plan/wrap-plan.vue`

- [ ] **Step 1: 创建 WRAP 计划页面**

从 `shen-gui-tu/src/pages/WRAPPlan/WRAPPlan.jsx` 迁移。手风琴面板展示多个计划板块，支持条目的增删改。

```vue
<!-- app/pages/wrap-plan/wrap-plan.vue -->
<template>
  <view class="wrap-page">
    <view class="header">
      <text class="title">📋 WRAP 康复计划</text>
      <text class="subtitle">Wellness Recovery Action Plan</text>
    </view>

    <view class="sections">
      <view v-for="section in wrapSections" :key="section.id" class="section-card">
        <view class="section-header" @tap="toggleSection(section.id)">
          <text class="section-title">{{ section.icon }} {{ section.title }}</text>
          <text class="section-toggle">{{ openPanel === section.id ? '▼' : '▶' }}</text>
        </view>

        <view v-if="openPanel === section.id" class="section-body">
          <view v-for="(item, i) in getSectionItems(section.id)" :key="i" class="item-row">
            <input v-model="sectionItems[section.id][i]" class="item-input" placeholder="输入内容..." />
            <view class="item-delete" @tap="removeItem(section.id, i)"><text>✕</text></view>
          </view>
          <view class="add-item-btn" @tap="addItem(section.id)">
            <text>+ 添加条目</text>
          </view>
        </view>
      </view>
    </view>

    <CrisisButton :visible="true" />
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { wrapSections } from '@/data/wrap-template'
import CrisisButton from '@/components/crisis-button/crisis-button.vue'

const store = useStore()
const openPanel = ref(wrapSections[0]?.id || '')
const sectionItems = reactive({})

// 初始化各板块条目（从 Vuex 恢复或使用默认模板）
wrapSections.forEach(section => {
  const saved = store.state.wrap.content[section.id]
  sectionItems[section.id] = saved
    ? [...saved]
    : section.items.map(item => typeof item === 'string' ? item : '')
})

function getSectionItems(sectionId) {
  return sectionItems[sectionId] || []
}

function toggleSection(id) {
  openPanel.value = openPanel.value === id ? '' : id
}

function addItem(sectionId) {
  if (!sectionItems[sectionId]) sectionItems[sectionId] = []
  sectionItems[sectionId].push('')
  saveSection(sectionId)
}

function removeItem(sectionId, index) {
  sectionItems[sectionId].splice(index, 1)
  saveSection(sectionId)
}

function saveSection(sectionId) {
  // 使用 nextTick 避免响应式未更新
  setTimeout(() => {
    store.commit('wrap/UPDATE_SECTION', {
      sectionId,
      items: [...(sectionItems[sectionId] || [])]
    })
  }, 0)
}
</script>

<style lang="scss" scoped>
.wrap-page { padding: $space-base; padding-bottom: 180rpx; }
.header { margin-bottom: $space-xl; }
.title { font-size: $text-h1; font-weight: 700; display: block; }
.subtitle { font-size: $text-body; color: $color-text-secondary; margin-top: $space-xs; display: block; }
.section-card { background: $color-bg-elevated; border-radius: $radius-lg; margin-bottom: $space-md; box-shadow: $shadow-sm; overflow: hidden; }
.section-header { padding: $space-base; display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: $text-h3; font-weight: 600; }
.section-toggle { font-size: $text-caption; color: $color-text-tertiary; }
.section-body { padding: 0 $space-base $space-base; }
.item-row { display: flex; align-items: center; gap: $space-sm; margin-bottom: $space-sm; }
.item-input {
  flex: 1; padding: $space-sm $space-md; background: $color-bg-subtle;
  border-radius: $radius-sm; font-size: $text-body-sm;
}
.item-delete { color: $color-danger; padding: $space-sm; }
.add-item-btn { padding: $space-sm; color: $color-primary; font-size: $text-body-sm; }
</style>
```

- [ ] **Step 2: 验证**

手风琴展开/收起正常，条目增删改操作正确，数据持久化。

- [ ] **Step 3: 提交**

```bash
git add app/pages/wrap-plan/
git commit -m "feat: 开发 WRAP 康复计划页面"
```

---

### Task 22: 配置应用图标与启动屏

**Files:**
- Modify: `app/manifest.json`
- Create: `app/static/logo.png`

- [ ] **Step 1: 准备应用图标**

使用 `shen-gui-tu/src/assets/` 下的 Logo 图片，生成各尺寸图标（1024×1024、512×512、192×192 等），放入 `app/static/`。

- [ ] **Step 2: 配置 manifest.json**

```json
{
  "name": "申归途",
  "appid": "",
  "description": "抑郁症复发预防支持工具",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "app-plus": {
    "usingComponents": true,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "modules": {},
    "distribute": {
      "android": {
        "permissions": ["<uses-permission android:name=\"android.permission.CALL_PHONE\"/>"]
      },
      "ios": {}
    }
  },
  "quickapp": {},
  "mp-weixin": {
    "appid": "",
    "setting": { "urlCheck": false },
    "usingComponents": true
  },
  "h5": {
    "title": "申归途",
    "router": { "mode": "hash" }
  }
}
```

- [ ] **Step 3: 制作 tabBar 图标**

需要 8 个 PNG 图标（4个 tab × 2种状态），尺寸 81×81px：
- home.png / home-active.png
- heal.png / heal-active.png
- service.png / service-active.png
- grow.png / grow-active.png

- [ ] **Step 4: 提交**

```bash
git add app/manifest.json app/static/
git commit -m "feat: 配置应用图标、启动屏和权限"
```

---

### Task 23: 开发环境数据重置功能

**Files:**
- Modify: `app/pages/dashboard/dashboard.vue`

- [ ] **Step 1: 添加开发环境数据重置按钮**

仅在开发环境显示（通过条件编译 `#ifdef H5` 或 `process.env.NODE_ENV === 'development'`）：

```vue
<!-- 仅在开发环境显示 -->
<!-- #ifdef H5 -->
<view v-if="isDev" class="dev-tools">
  <view class="dev-btn" @tap="resetAllData"><text>🔄 重置所有数据</text></view>
</view>
<!-- #endif -->
```

```javascript
const isDev = process.env.NODE_ENV === 'development'

function resetAllData() {
  store.commit('checkin/CLEAR_RECORDS')
  store.commit('medication/CLEAR_ALL')
  store.commit('wrap/UPDATE_SECTION', { sectionId: '_all', items: {} })
  // 清除 Storage
  const keys = ['checkinRecords', 'medications', 'medRecords', 'sideEffectRecords', 'wrapContent', 'cbtProgress', 'socialRecords']
  keys.forEach(k => uni.removeStorageSync(k))
  uni.showToast({ title: '数据已重置', icon: 'success' })
}
```

- [ ] **Step 2: 提交**

```bash
git add app/pages/dashboard/
git commit -m "feat: 添加开发环境数据重置功能"
```

---

### Task 24: 全页面集成测试与修复

- [ ] **Step 1: 完整页面流程测试**

按照以下流程逐一测试每个页面：

1. Welcome → 点击"开始使用" → 跳转 Dashboard ✓
2. Dashboard → 风险仪表盘显示正确 → 签到卡片跳转 CheckIn ✓
3. CheckIn → 六维度评分 → 提交成功 → 返回 Dashboard 显示打卡天数+1 ✓
4. Medication → 添加药物 → 服药/跳过 → 依从率更新 ✓
5. Medication 子页面（药物知识/副作用/情绪关联/减药）→ 内容展示 ✓
6. Crisis → 电话拨打 → 呼吸练习动画 ✓
7. Resources → Tab 切换 → 医院筛选 → 热线拨打 → 家属/重建 ✓
8. CBTCourse → 课程分组 → 解锁逻辑 → 步骤学习 → 进度持久化 ✓
9. WRAPPlan → 手风琴展开 → 条目增删改 → 数据持久化 ✓

- [ ] **Step 2: 测试 CrisisButton 浮动按钮**

在所有 tabBar 页面（Dashboard/CBTCourse/Resources/Medication）验证：
- CrisisButton 可见且可点击
- 点击跳转到 Crisis 页面
- Crisis 页面不显示 CrisisButton

- [ ] **Step 3: 测试数据持久化**

- 签到后关闭应用 → 重新打开 → 签到数据保留
- 用药后关闭应用 → 重新打开 → 用药记录保留
- WRAP 编辑后关闭应用 → 重新打开 → WRAP 内容保留

- [ ] **Step 4: 修复发现的问题**

逐一修复测试中发现的问题。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "fix: 集成测试修复"
```

---

### Task 25: H5 端构建验证与最终交付

- [ ] **Step 1: H5 端构建**

```bash
cd app && npx uni build -p h5
```

Expected: 构建成功，无错误。

- [ ] **Step 2: 本地预览 H5 版本**

```bash
cd app && npx uni -p h5
```

在浏览器中打开，验证所有页面功能正常。

- [ ] **Step 3: 小程序端构建验证（可选）**

```bash
cd app && npx uni build -p mp-weixin
```

使用微信开发者工具打开 `app/dist/build/mp-weixin` 目录，验证功能。

- [ ] **Step 4: 确保目录整洁**

```bash
git add -A
git commit -m "chore: 最终构建验证与清理"
```

---

## 七、关键风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|------|
| React → Vue 3 思维转换 | 开发效率降低 | 本计划提供完整代码模板，减少转换成本 |
| CSS Modules → SCSS BEM 转换 | 样式迁移工作量大 | 本计划采用内联 scoped SCSS，避免全局命名冲突 |
| SVG 圆环 → Canvas | 绘制逻辑需重写 | Task 8 已提供完整 Canvas 实现代码 |
| uni.createInnerAudioContext 与 Web Audio API 差异 | 音频播放需适配 | Task 10 已使用 UniApp 音频 API |
| tabBar 页面固定，无法嵌套子路由 | 页面架构需调整 | 每个页面独立，使用 navigateTo/switchTab 编程式导航 |
| 测试覆盖 | UniApp 生态测试工具不如 React | 以手动集成测试为主（Task 24） |

---

## 八、验证标准

1. **功能完整性**：所有 12 个页面 + 子页面功能与 Web 版一致
2. **数据兼容性**：签到、用药、WRAP、CBT 进度等数据正常持久化
3. **音频功能**：引导式练习播放器正常播放预录 MP3
4. **双端构建**：H5 端和小程序端均可成功构建
5. **UI 一致性**：视觉风格与 Web 版保持一致（温暖治愈系）
6. **交互流畅**：页面切换、动画、滚动无明显卡顿
7. **CrisisButton**：所有非 Crisis 页面均显示浮动求助按钮
