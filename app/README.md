# 申归途 App

> 抑郁症复发预防支持工具 — 基于 uni-app 的跨平台移动应用

## 技术栈

- **框架**: uni-app 3.x (Vue 3 + Composition API)
- **语言**: TypeScript + SCSS
- **状态管理**: Vuex 4 (命名空间模块)
- **构建工具**: Vite 5
- **数据持久化**: uni.getStorageSync / setStorageSync (本地存储)

## 功能模块

### 📊 每日打卡

六维度自评追踪：睡眠、情绪、身体、动力、思维、社交。支持连续打卡统计、趋势图表、风险等级评估。

### 💊 用药管理

- 药物列表与服药记录（依从率圆形仪表盘）
- 连续服药统计
- 副作用周报追踪
- 药物-情绪联动分析
- 减药导航（在医生指导下安全渐进减药）
- 药物知识库

### 📖 CBT 课程

分层循证心理干预课程体系（CBT · MBCT · WRAP · ACT），包含：

- 引导练习播放器（呼吸练习、身体扫描、冥想）
- 音频播放与进度追踪
- 课程完成度统计

### 📝 WRAP 计划

个人康复行动计划（Wellness Recovery Action Plan），五大板块：

1. 每日维护
2. 预警信号
3. 应对策略
4. 危机计划
5. 康复关怀

支持条目的增删改查。

### 🆘 危机干预

- 一键拨打心理援助热线（962525 / 400-161-9995）
- 紧急联系渠道（120、市民热线等）
- 4-7-8 呼吸练习
- 安全小贴士

### 🏥 服务中心

- 本地精神卫生医院（区域筛选）
- 心理援助热线
- 社区心理服务资源
- 医保政策信息
- 家属支持（课程/评估/行动指南）
- 社交恢复阶梯与同伴故事

## 项目结构

```
app/src/
├── main.ts                    # 应用入口
├── App.vue                    # 根组件（全局样式）
├── pages.json                 # 路由与 tabBar 配置
├── manifest.json              # 应用配置
│
├── pages/                     # 页面（12 个）
│   ├── welcome/               # 欢迎页
│   ├── dashboard/             # 首页仪表盘
│   ├── checkin/               # 每日打卡
│   ├── medication/            # 用药管理
│   │   ├── med-knowledge      # 药物知识
│   │   ├── side-effect-tracker # 副作用追踪
│   │   ├── mood-correlation   # 情绪关联分析
│   │   └── taper-navigator    # 减药导航
│   ├── resources/             # 服务中心
│   ├── crisis/                # 危机干预
│   ├── cbt-course/            # CBT 课程
│   └── wrap-plan/             # WRAP 计划
│
├── components/                # 公共组件（6 个）
│   ├── risk-gauge/            # Canvas 风险仪表盘
│   ├── trend-chart/           # 趋势柱状图
│   ├── guided-player/         # 引导练习播放器
│   ├── crisis-button/         # SOS 悬浮按钮
│   ├── toast/                 # Toast 提示
│   └── confirm-dialog/        # 确认对话框
│
├── composables/               # 组合式函数
│   ├── use-checkin.ts         # 打卡逻辑
│   └── use-risk-level.ts      # 风险等级计算
│
├── store/                     # Vuex 状态管理
│   ├── index.ts               # Store 入口
│   ├── storage.ts             # 本地存储封装
│   └── modules/
│       ├── checkin.ts         # 打卡记录（sgt-checkins）
│       ├── medication.ts      # 用药记录（sgt-medications）
│       ├── wrap.ts            # WRAP 计划（sgt-wrap-sections）
│       └── cbt.ts             # CBT 进度（sgt-cbt-progress）
│
├── data/                      # 静态数据（12 个文件）
│   ├── cbtContent.js          # CBT 课程与分层信息
│   ├── wrapTemplate.js        # WRAP 模板
│   ├── hospitals.js           # 医院与区域
│   ├── hotlines.js            # 心理热线
│   ├── community.js           # 社区资源
│   ├── insurance.js           # 医保政策
│   ├── medicationKnowledge.js # 药物知识库
│   ├── familyCourses.js       # 家属课程
│   ├── familyGuide.js         # 家属行动指南
│   ├── caregiverAssessment.js # 照护者评估
│   ├── socialTasks.js         # 社交恢复阶梯
│   └── peerStories.js         # 同伴故事
│
├── utils/                     # 工具函数
│   ├── riskCalculator.js      # 风险评分计算（加权算法）
│   └── dateUtils.js           # 日期格式化
│
└── static/                    # 静态资源
    ├── audio/                 # 引导练习音频（28 个 MP3）
    ├── images/                # 图片资源
    └── tab/                   # tabBar 图标
```

## TabBar 导航

| Tab | 页面 | 说明 |
|-----|------|------|
| 首页 | dashboard | 风险仪表盘、打卡入口、趋势图、WRAP 入口 |
| 疗愈 | medication | 用药管理、依从率、副作用追踪 |
| 服务 | resources | 医院、热线、社区、医保、家属、社交 |
| 成长 | cbt-course | CBT/MBCT/WRAP/ACT 循证课程 |

## 状态管理

使用 Vuex 4，4 个命名空间模块，数据通过 `uni.getStorageSync` 本地持久化：

| 模块 | 存储键 | 核心数据 |
|------|--------|---------|
| `checkin` | `sgt-checkins` | 打卡记录（6 维度评分） |
| `medication` | `sgt-medications` | 药物列表与服药记录 |
| | `sgt-side-effects` | 副作用记录 |
| `wrap` | `sgt-wrap-sections` | WRAP 计划条目 |
| `cbt` | `sgt-cbt-progress` | 课程学习进度 |

## 快速开始

### 环境要求

- Node.js >= 16
- HBuilderX（推荐最新版）

### 安装依赖

```bash
cd app
npm install
```

### H5 开发

```bash
npm run dev:h5
```

### App 构建（通过 HBuilderX）

1. 用 HBuilderX 打开 `app/` 目录
2. 菜单 → 运行 → 运行到手机或模拟器
3. 或菜单 → 发行 → 原生 App-云打包

### 小程序构建

```bash
# 微信小程序
npm run build:mp-weixin

# 支付宝小程序
npm run build:mp-alipay

# 飞书小程序
npm run build:mp-lark
```

## 构建命令

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | H5 开发模式 |
| `npm run build:h5` | H5 生产构建 |
| `npm run build:mp-weixin` | 微信小程序构建 |
| `npm run build:mp-alipay` | 支付宝小程序构建 |
| `npm run build:app` | App 构建（需 HBuilderX） |
| `npm run type-check` | TypeScript 类型检查 |

## 支持平台

- H5（Web）
- iOS / Android（原生 App）
- 微信小程序
- 支付宝小程序
- 小红书小程序
- 飞书小程序
- 鸿蒙

## 关键设计决策

### React → Vue 3 迁移映射

| React (Web 版) | Vue 3 (App 版) |
|----------------|----------------|
| useState / useEffect | ref / computed / onMounted |
| CSS Modules | SCSS (scoped) |
| localStorage | uni.getStorageSync / setStorageSync |
| React Router | pages.json 声明式路由 |
| Audio API | uni.createInnerAudioContext() |
| SVG | Canvas 2D API |
| `<a href="tel:xxx">` | uni.makePhoneCall() |

### 风险评分算法

六维度加权平均：

| 维度 | 权重 |
|------|------|
| 睡眠 (sleep) | 0.25 |
| 情绪 (mood) | 0.20 |
| 身体 (body) | 0.15 |
| 动力 (motivation) | 0.15 |
| 思维 (cognition) | 0.12 |
| 社交 (social) | 0.13 |

风险等级：绿色(≥65)、黄色(≥45)、橙色(≥25)、红色(<25)

## 相关项目

- [申归途 Web 版](../shen-gui-tu/) — React 实现的 Web 版本
