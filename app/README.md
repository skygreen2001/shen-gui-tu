# 申归途 App

> 你的复发预防伙伴 — 面向抑郁症康复期患者的移动端支持工具

## 项目简介

「申归途」是一款专注于**抑郁症复发预防**的移动应用，基于 React Native 构建，同时支持 iOS 和 Android 平台。应用提供每日情绪追踪、用药管理、心理干预课程、危机干预等核心功能，帮助康复期患者建立科学的自我管理习惯。

本项目为同名 Web 应用（[shen-gui-tu](../shen-gui-tu/)）的移动端移植版本，功能与 Web 版完全一致。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React Native 0.76 + React 18 |
| 语言 | TypeScript |
| 导航 | React Navigation 7（Bottom Tabs + Native Stack） |
| 样式 | StyleSheet.create() |
| 数据存储 | @react-native-async-storage/async-storage |
| 动画 | react-native-reanimated 3 |
| 图形 | react-native-svg 15 |
| 语音 | expo-speech |
| 音频播放 | react-native-track-player 4 |
| 推送通知 | @notifee/react-native 9 |
| 测试 | Jest + React Native Testing Library |

## 功能模块

### 🏠 首页 — 预警仪表盘
- SVG 圆环风险仪表盘（四级风险分级：绿/黄/橙/红）
- 六维度加权评分算法（睡眠/情绪/躯体/动力/认知/社交）
- 今日签到快捷入口
- 近 7 天趋势柱状图
- 用药依从率与连续服药天数统计

### ✅ 每日签到
- 六维度自评（1-5 分）：睡眠质量、情绪状态、身体活力、动力水平、思维清晰度、社交意愿
- 备注记录（200 字限制）
- 支持修改当日签到
- 随机鼓励语反馈

### 💊 用药管理
- 药物增删改查
- 每日服药/跳过记录
- 月度依从率统计（动画百分比圆环）
- 连续服药天数追踪
- 药物起效期引导（前 4 周）
- **药物知识库**：5 种常见抗抑郁药详细信息
- **副作用周报**：7 项副作用追踪 + 循证应对策略
- **药物-情绪联动**：跨数据源关联分析
- **减药导航**：阶段性减药计划 + 医生报告生成

### 🧘 疗愈 — 心理干预课程
- 分层课程体系（Tier 1 基础 → Tier 2 深化 → Tier 3 整合）
- CBT / MBCT / ACT / WRAP 多种疗法
- 前置依赖解锁机制
- 步骤式学习（内容/练习/反思）
- **引导式冥想播放器**：身体扫描、呼吸练习、冥想（含预录 MP3 音频）

### 🏥 服务 — 服务中心
- **医院**：上海 10 家精神卫生医疗机构，区域筛选，一键拨号
- **热线**：6 条心理援助热线（962525、400-161-9995 等）
- **社区**：4 个社区心理健康服务中心
- **医保**：5 项上海医保政策
- **家属支持**：照护者课程、行动指南、压力自评、自我关怀清单
- **生活重建**：渐进式社交任务（5 阶段）+ 同侪康复故事

### 🆘 危机干预
- 962525 / 400-161-9995 一键拨打
- 更多求助渠道（120、希望 24、12345 等）
- **4-7-8 呼吸放松法**（动画引导）
- 安全小贴士

### 📋 WRAP 计划
- 5 大模块手风琴编辑器（每日维护/预警信号/应对策略/危机计划/康复关怀）
- 条目增删改
- 本地持久化存储

## 项目结构

```
app/
├── index.js                    # React Native 入口
├── app.json                    # 应用配置
├── package.json                # 依赖管理
├── tsconfig.json               # TypeScript 配置
├── babel.config.js             # Babel 配置
├── metro.config.js             # Metro 打包配置
├── src/
│   ├── App.tsx                 # 根组件
│   ├── navigation/             # 导航配置
│   │   ├── AppNavigator.tsx    # 根导航器（Stack + Tab）
│   │   └── theme.ts            # 导航主题
│   ├── screens/                # 页面
│   │   ├── Welcome.tsx         # 欢迎页
│   │   ├── Dashboard.tsx       # 预警仪表盘
│   │   ├── CheckIn.tsx         # 每日签到
│   │   ├── Crisis.tsx          # 危机干预
│   │   ├── CBTCourse.tsx       # 心理干预课程
│   │   ├── WRAPPlan.tsx        # WRAP 计划
│   │   ├── Medication/         # 用药管理模块
│   │   │   ├── MedicationMain.tsx
│   │   │   ├── MedKnowledge.tsx
│   │   │   └── SideEffectTracker.tsx
│   │   └── Resources/          # 服务中心模块
│   │       └── ResourcesMain.tsx
│   ├── components/             # 共享组件
│   │   ├── Layout.tsx          # 页面布局壳
│   │   ├── RiskGauge.tsx       # SVG 风险仪表盘
│   │   ├── CrisisButton.tsx    # 浮动求助按钮
│   │   ├── ConfirmDialog.tsx   # 确认对话框
│   │   ├── GuidedPlayer.tsx    # 引导冥想播放器
│   │   └── Toast.tsx           # 轻量提示
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useAsyncStorage.ts  # AsyncStorage 封装
│   │   ├── useCheckIn.ts       # 签到数据管理
│   │   ├── useMedication.ts    # 用药数据管理
│   │   ├── useRiskLevel.ts     # 风险等级计算
│   │   ├── useTaperPlan.ts     # 减药计划管理
│   │   ├── useMedMoodCorrelation.ts  # 药物-情绪联动分析
│   │   └── useTTS.ts           # 语音合成
│   ├── data/                   # 静态数据（12 个文件）
│   │   ├── hospitals.ts        # 医院信息
│   │   ├── hotlines.ts         # 援助热线
│   │   ├── cbtContent.ts       # CBT 课程内容
│   │   ├── medicationKnowledge.ts  # 药物知识库
│   │   └── ...                 # 更多数据文件
│   ├── utils/                  # 工具函数
│   │   ├── riskCalculator.ts   # 风险评分引擎
│   │   └── dateUtils.ts        # 日期工具
│   ├── styles/                 # 样式系统
│   │   ├── theme.ts            # 设计令牌（颜色/间距/圆角/阴影）
│   │   └── globalStyles.ts     # 全局通用样式
│   └── assets/                 # 静态资源
│       ├── audio/              # 28 个引导冥想 MP3
│       └── images/             # Logo 等图片
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9 或 yarn >= 1.22
- iOS：Xcode >= 15、CocoaPods
- Android：Android Studio、SDK 34、JDK 17

### 安装与运行

```bash
# 1. 进入项目目录
cd app

# 2. 安装依赖
npm install

# 3. iOS 安装 Pod 依赖
cd ios && pod install && cd ..

# 4. 启动 Metro 服务
npm start

# 5. 运行 iOS
npm run ios

# 6. 运行 Android
npm run android
```

### 常用命令

```bash
npm start          # 启动 Metro 打包服务
npm run ios        # 在 iOS 模拟器/真机运行
npm run android    # 在 Android 模拟器/真机运行
npm test           # 运行测试
npm run lint       # 代码检查
```

## 设计规范

| 项目 | 值 |
|------|------|
| 主色调 | `#4A90D9`（治愈蓝） |
| 强调色 | `#E8985E`（温暖橙） |
| 背景色 | `#F8F6F2`（暖白） |
| 风险等级 | 绿 `#6BAF7A` / 黄 `#E8C95A` / 橙 `#E8985E` / 红 `#D46B6B` |
| 字体 | PingFang SC / -apple-system / Microsoft YaHei |
| 最低支持 | iOS 14+ / Android 8.0+ (API 26) |

## 架构说明

本项目采用**最大代码复用**策略，从 Web 版（React + Vite）迁移而来：

- **数据层**（`data/`）：12 个静态数据文件 100% 直接复用，仅转为 TypeScript
- **业务逻辑**（`hooks/`）：7 个自定义 Hooks 迁移适配，LocalStorage → AsyncStorage
- **工具函数**（`utils/`）：风险计算引擎、日期工具直接复用
- **UI 层**（`screens/` + `components/`）：使用 RN 原生组件完全重写
- **样式系统**（`styles/`）：从 CSS 变量提取为 TypeScript 常量

## 数据存储

应用采用**纯本地存储**方案，所有用户数据保存在设备本地：

| 存储键 | 内容 |
|--------|------|
| `sgt-checkins` | 每日签到记录 |
| `sgt-medications` | 药物列表及服药记录 |
| `sgt-side-effects` | 副作用周报数据 |
| `sgt-taper-plans` | 减药计划 |
| `sgt-wrap-sections` | WRAP 计划内容 |
| `sgt-cbt-progress` | CBT 课程学习进度 |

## 相关项目

- **Web 版**：[shen-gui-tu/](../shen-gui-tu/) — React + Vite 构建的 Web 应用
- **设计文档**：[.trae/documents/申归途-App开发设计文档.md](../.trae/documents/申归途-App开发设计文档.md)
- **在线体验**：https://shenguitu.netlify.app/

## 许可证

MIT
