# 申归途 App 开发设计文档

> **日期**：2026-05-04
> **状态**：待用户审核
> **基于**：Web 版 `shen-gui-tu/` 项目

---

## 1. 概述

### 1.1 项目背景

「申归途」是一款面向抑郁症康复期患者的复发预防支持工具，已作为 Web 应用完成开发并部署（https://shenguitu.netlify.app/）。现需将其移植为 iOS 和 Android 原生应用，功能与 Web 版完全一致。

### 1.2 设计决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 技术框架 | React Native CLI（裸项目） | 与现有 React 代码最大复用，用户偏好 |
| 架构方案 | 方案 A：最大代码复用 | Hooks/数据/工具直接复用，仅重写 UI 层 |
| 数据存储 | AsyncStorage（纯本地） | 与 Web 版保持一致的纯前端架构 |
| 语言 | TypeScript | 提升代码质量 |
| 最低支持 | iOS 14+ / Android 8.0+ | RN 社区推荐 |

---

## 2. 技术栈对照

| 类别 | Web 版（现有） | App 版（新） |
|------|------|------|
| 框架 | React 19 | React 18（RN 兼容版本） |
| 路由 | React Router DOM (HashRouter) | React Navigation 7（Bottom Tabs + Native Stack） |
| 样式 | CSS Modules | StyleSheet.create() |
| 状态管理 | React Hooks + LocalStorage | React Hooks + @react-native-async-storage/async-storage |
| 语音合成 | Edge TTS (WebSocket) + Web Speech API | expo-speech + react-native-track-player |
| 拨号 | `tel:` 协议 | Linking.openURL('tel:...') |
| 构建工具 | Vite 8 | React Native CLI + Metro |
| 测试 | Vitest + RTL | Jest + React Native Testing Library |

---

## 3. 目录结构

```
app/                              # App 项目根目录
├── package.json
├── index.js                      # RN 入口文件
├── app.json                      # RN 配置
├── metro.config.js               # Metro 打包配置
├── babel.config.js
├── tsconfig.json
├── android/                      # Android 原生项目
├── ios/                          # iOS 原生项目
├── src/
│   ├── App.tsx                   # 导航根配置
│   ├── navigation/
│   │   ├── AppNavigator.tsx      # 根导航器
│   │   ├── BottomTabNavigator.tsx # 底部 Tab 导航
│   │   └── theme.ts              # 导航主题色
│   ├── screens/                  # 页面
│   │   ├── Welcome.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CheckIn.tsx
│   │   ├── Medication/
│   │   │   ├── MedicationMain.tsx
│   │   │   ├── MedKnowledge.tsx
│   │   │   ├── SideEffectTracker.tsx
│   │   │   ├── MoodCorrelation.tsx
│   │   │   └── TaperNavigator.tsx
│   │   ├── Resources/
│   │   │   ├── ResourcesMain.tsx
│   │   │   ├── FamilyTab.tsx
│   │   │   └── RebuildTab.tsx
│   │   ├── Crisis.tsx
│   │   ├── CBTCourse.tsx
│   │   └── WRAPPlan.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── RiskGauge.tsx
│   │   ├── CrisisButton.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── GuidedPlayer.tsx
│   │   └── Toast.tsx
│   ├── hooks/                    # 从 Web 版迁移并适配
│   │   ├── useAsyncStorage.ts
│   │   ├── useCheckIn.ts
│   │   ├── useMedication.ts
│   │   ├── useRiskLevel.ts
│   │   ├── useTTS.ts
│   │   ├── useMedMoodCorrelation.ts
│   │   └── useTaperPlan.ts
│   ├── data/                     # 100% 直接复用（14个文件）
│   │   ├── hospitals.ts
│   │   ├── hotlines.ts
│   │   ├── community.ts
│   │   ├── insurance.ts
│   │   ├── cbtContent.ts
│   │   ├── wrapTemplate.ts
│   │   ├── medicationKnowledge.ts
│   │   ├── familyCourses.ts
│   │   ├── familyGuide.ts
│   │   ├── caregiverAssessment.ts
│   │   ├── socialTasks.ts
│   │   ├── peerStories.ts
│   │   └── ...
│   ├── utils/                    # 大部分直接复用
│   │   ├── riskCalculator.ts
│   │   └── formatters.ts
│   ├── styles/
│   │   ├── theme.ts              # 颜色/字体/间距常量
│   │   └── globalStyles.ts
│   └── assets/
│       ├── audio/                # 22个 MP3 音频文件
│       ├── images/               # Logo、图标等
│       └── fonts/
└── __tests__/                    # 测试文件
```

---

## 4. 导航架构

```
AppNavigator (Root)
├── Welcome (Stack Screen, 无底部Tab)
└── MainTabs (Bottom Tab Navigator)
    ├── Tab "首页" → DashboardStack
    │   ├── Dashboard
    │   ├── CheckIn
    │   └── WRAPPlan
    ├── Tab "疗愈" → TherapyStack
    │   ├── CBTCourse
    │   └── GuidedPlayer (Modal)
    ├── Tab "服务" → ResourcesStack
    │   ├── ResourcesMain
    │   ├── FamilyTab
    │   └── RebuildTab
    └── Tab "成长" → GrowthStack
        ├── MedicationMain
        ├── MedKnowledge
        ├── SideEffectTracker
        ├── MoodCorrelation
        └── TaperNavigator
```

- CrisisButton 作为浮动按钮覆盖在所有页面之上（除 Crisis 页面外）
- Crisis 页面从任何页面均可通过 CrisisButton 进入

---

## 5. 组件迁移映射

| Web 组件/功能 | RN 实现方案 | 迁移难度 | 备注 |
|------|------|------|------|
| div/span/p | View / Text | 低 | 直接替换 |
| button/a | TouchableOpacity / Pressable | 低 | 直接替换 |
| input/textarea | TextInput | 低 | RN 原生组件 |
| CSS Modules | StyleSheet.create() | 中 | 手动转换样式语法 |
| React Router | React Navigation 7 | 中 | 路由配置重写 |
| LocalStorage | AsyncStorage | 低 | API 类似，异步化 |
| SVG 圆环图 | react-native-svg | 中 | SVG 语法兼容 |
| CSS 动画 | react-native-reanimated | 中 | 动画 API 不同 |
| CSS 柱状图 | RN View + flex 布局 | 低 | 用 flex 实现 |
| tel: 拨号 | Linking.openURL | 低 | RN 原生支持 |
| Web Speech API | expo-speech | 低 | API 更简洁 |
| Edge TTS (WebSocket) | expo-speech + 预录 MP3 | 中 | 放弃 WebSocket |
| HTML Audio | react-native-track-player | 中 | 音频播放器重写 |
| HashRouter | React Navigation | 中 | 导航模式不同 |
| Emoji 图标 | 直接复用 | 无 | RN 原生支持 |
| 滚动容器 | ScrollView / FlatList | 低 | RN 原生组件 |
| Modal/Dialog | RN Modal 组件 | 低 | 原生支持 |

---

## 6. RN 依赖清单

```json
{
  "dependencies": {
    "@react-navigation/native": "^7.x",
    "@react-navigation/bottom-tabs": "^7.x",
    "@react-navigation/native-stack": "^7.x",
    "@react-native-async-storage/async-storage": "^2.x",
    "react-native-svg": "^15.x",
    "react-native-reanimated": "^3.x",
    "react-native-track-player": "^4.x",
    "expo-speech": "^12.x",
    "react-native-safe-area-context": "^5.x",
    "react-native-screens": "^4.x",
    "react-native-toast-message": "^2.x",
    "react-native-gesture-handler": "^2.x",
    "@notifee/react-native": "^9.x"
  }
}
```

---

## 7. 音频方案

| 场景 | Web 版 | App 版 |
|------|------|------|
| CBT 课程语音引导 | Edge TTS WebSocket + Web Speech API | expo-speech（系统 TTS） |
| 离线音频播放 | HTML Audio + 预录 MP3 | react-native-track-player + 预录 MP3 |
| 呼吸练习 | CSS 动画 + Web Speech API | react-native-reanimated 动画 + expo-speech |

**变更说明**：放弃 Edge TTS WebSocket 方案（移动端不稳定），统一使用 expo-speech 进行语音合成，预录 MP3 作为离线备选。

---

## 8. 分阶段实施计划

### 阶段 1：项目初始化与基础架构

1. 使用 `react-native init ShenGuiTu --template typescript` 创建裸项目到 `app/`
2. 配置 TypeScript（tsconfig.json）
3. 安装所有核心依赖
4. 配置 React Navigation（底部 Tab + Stack）
5. 建立完整目录结构
6. 迁移所有 `data/` 静态数据文件（100% 直接复用，.js → .ts）
7. 迁移 `utils/` 工具函数（riskCalculator、formatters）
8. 创建主题常量文件（theme.ts、globalStyles.ts），从 Web 版 CSS 变量提取
9. 复制 22 个 MP3 音频文件到 `src/assets/audio/`
10. 复制 Logo 等图片资源
11. **验证**：iOS 和 Android 模拟器均能启动，显示空白 Tab 页面

### 阶段 2：核心 Hooks 与数据层迁移

1. 实现 `useAsyncStorage` Hook（替代 useLocalStorage，API 异步化）
2. 迁移 `useRiskLevel`（直接复用，无改动）
3. 迁移 `useCheckIn`（改依赖为 useAsyncStorage）
4. 迁移 `useMedication`（改依赖为 useAsyncStorage）
5. 迁移 `useTaperPlan`（改依赖为 useAsyncStorage）
6. 迁移 `useMedMoodCorrelation`（改依赖为 useAsyncStorage）
7. 实现 `useTTS` Hook（基于 expo-speech）
8. **验证**：单元测试通过，数据读写正常

### 阶段 3：共享组件开发

1. `Layout` 组件（页面布局壳 + SafeAreaView）
2. `RiskGauge` 组件（react-native-svg 圆环 + reanimated 动画）
3. `CrisisButton` 组件（浮动按钮，Absolute 定位）
4. `ConfirmDialog` 组件（RN Modal）
5. `GuidedPlayer` 组件（react-native-track-player 音频播放器）
6. `Toast` 组件（react-native-toast-message 封装）
7. 通用 UI 子组件（评分滑块、卡片、标签页、手风琴等）
8. **验证**：组件渲染正常，交互可用

### 阶段 4：页面开发

按优先级排序：

| 优先级 | 页面 | 子页面 | 复杂度 |
|--------|------|--------|--------|
| P0 | Welcome | - | 低 |
| P0 | Dashboard | - | 中（含 SVG 圆环、柱状图） |
| P0 | CheckIn | - | 中（六维度评分） |
| P1 | Medication | MedKnowledge, SideEffectTracker, MoodCorrelation, TaperNavigator | 高（最复杂模块） |
| P1 | Crisis | - | 中（呼吸练习动画） |
| P2 | Resources | FamilyTab, RebuildTab | 中 |
| P2 | CBTCourse | GuidedPlayer (Modal) | 中高 |
| P2 | WRAPPlan | - | 中（手风琴编辑器） |

### 阶段 5：原生能力集成

1. **本地推送通知**：用药提醒（@notifee/react-native）
2. **拨号功能**：Linking.openURL('tel:...')
3. **状态栏**：配置状态栏颜色和样式
4. **启动屏/闪屏**：配置 Splash Screen
5. **App 图标**：配置 iOS/Android 应用图标
6. **安全区域**：适配刘海屏、底部安全区（SafeAreaView）

### 阶段 6：测试与优化

1. 单元测试（Hooks、工具函数）
2. 组件测试（核心组件）
3. iOS 真机/模拟器测试
4. Android 真机/模拟器测试
5. 性能优化（FlatList 虚拟化、图片优化、内存泄漏检查）
6. 无障碍支持（accessibilityLabel、accessibilityHint）

---

## 9. 关键风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|------|
| CSS Modules → StyleSheet 转换工作量大 | 开发周期延长 | 编写转换脚本自动化处理常见模式 |
| expo-speech 中文语音质量不如 Edge TTS | 用户体验下降 | 优先使用预录 MP3，TTS 作为补充 |
| AsyncStorage 是异步 API | 所有数据操作需 await | 统一封装 useAsyncStorage，上层业务无感知 |
| react-native-track-player 配置复杂 | 音频播放功能延迟 | 阶段 3 优先实现 GuidedPlayer 组件验证 |
| iOS/Android 平台差异 | 双端表现不一致 | 使用 SafeAreaView、Platform.select 处理差异 |

---

## 10. 验证标准

1. **功能完整性**：所有 8 个页面 + 子页面功能与 Web 版一致
2. **数据兼容性**：签到、用药、WRAP 等数据正常读写
3. **音频功能**：语音引导正常播放，呼吸练习动画流畅
4. **双端运行**：iOS 和 Android 均可正常安装和运行
5. **性能达标**：页面切换流畅，无明显卡顿
6. **UI 一致性**：视觉风格与 Web 版保持一致（温暖治愈系）
