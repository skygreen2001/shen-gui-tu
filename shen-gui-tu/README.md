# 申归途

> 上海抑郁症复发预防支持工具

「申归途」是一款面向抑郁症康复期患者的移动端支持工具，聚焦**复发预防**这一关键环节。通过每日六维自评追踪、用药管理、上海本地资源导航、危机干预和认知行为疗法自助课程，帮助患者在巩固期和维持期保持稳定，降低复发风险。

本项目为 **TRAE × 脉脉「AI 无限职场」SOLO 挑战赛** 公益赛道「Hello AI 科技致善」参赛作品。

## 项目体验

- [申归途](https://shen-gui-tu.zh-cn.edgeone.cool/)

## 核心功能

| 模块 | 功能 | 说明 |
|------|------|------|
| 🏠 预警仪表盘 | 综合评分 + 7天趋势 | 基于六维加权评分（睡眠/情绪/躯体/动力/认知/社交），四级风险分级 |
| 📋 每日签到 | 30秒快速自评 | 6个维度各5级评分，支持备注，数据持久化存储 |
| 💊 用药管理 | 服药打卡 + 依从率 | 药物增删、服药记录、月度依从率统计、正向反馈 |
| 📚 服务中心 | 上海本地资源 | 10家医院（区域筛选）、6条热线、4个社区中心、5项医保政策 |
| 🆘 危机干预 | 一键求助 + 呼吸练习 | 962525/400-161-9995 热线、4-7-8 呼吸放松法、安全提示 |
| 📖 CBT课程 | 认知行为疗法自助 | 2门课程（5步+4步），步骤式学习，进度追踪 |
| 📝 WRAP计划 | 个人康复行动计划 | 5大模块手风琴编辑器，条目增删改，本地持久化 |

## 技术栈

- **React 18** — UI 框架
- **React Router v6** — HashRouter（离线文件协议兼容）
- **Vite 5** — 构建工具
- **CSS Modules** — 组件样式隔离，零外部运行时依赖
- **LocalStorage** — 无后端数据持久化
- **Emoji 图标** — 无需图标库，离线可用
- **纯 CSS 图表** — SVG 仪表盘 + CSS 柱状图，无图表库依赖

## 项目结构

```
shen-gui-tu/
├── src/
│   ├── main.jsx                  # 应用入口
│   ├── App.jsx                   # 路由配置
│   ├── App.css
│   ├── index.css
│   ├── test-setup.js
│   ├── assets/                   # 静态资源
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/               # 共享组件 (7个)
│   │   ├── BottomNav/            # 底部导航
│   │   ├── ConfirmDialog/        # 确认对话框
│   │   ├── CrisisButton/         # 危机求助按钮
│   │   ├── GuidedPlayer/         # 引导式播放器
│   │   ├── Layout/               # 页面布局
│   │   ├── RiskGauge/            # 风险仪表盘
│   │   └── Toast/                # 提示消息
│   ├── pages/                    # 页面组件 (8个)
│   │   ├── CBTCourse/            # CBT 认知课程
│   │   ├── CheckIn/              # 每日签到
│   │   ├── Crisis/               # 危机干预
│   │   ├── Dashboard/            # 预警仪表盘
│   │   ├── Medication/           # 用药管理 (6个子模块)
│   │   │   ├── Medication.jsx     # 服药打卡
│   │   │   ├── MedKnowledge.jsx   # 药物知识
│   │   │   ├── MoodCorrelation.jsx # 情绪关联
│   │   │   ├── SideEffectTracker.jsx # 副作用追踪
│   │   │   └── TaperNavigator.jsx # 减药导航
│   │   ├── Resources/            # 资源中心
│   │   │   ├── FamilyTab.jsx      # 家庭支持
│   │   │   └── RebuildTab.jsx     # 生活重建
│   │   ├── WRAPPlan/             # WRAP 康复计划
│   │   └── Welcome/              # 欢迎页
│   ├── hooks/                    # 自定义 Hooks (8个)
│   │   ├── useCheckIn.js         # 签到逻辑
│   │   ├── useEdgeTTS.js         # Edge TTS 语音
│   │   ├── useLocalStorage.js    # 本地存储
│   │   ├── useMedMoodCorrelation.js # 药物情绪关联
│   │   ├── useMedication.js      # 用药管理
│   │   ├── useRiskLevel.js       # 风险等级
│   │   ├── useTTS.js             # 语音合成
│   │   └── useTaperPlan.js       # 减药计划
│   ├── data/                     # 静态数据 (13个)
│   │   ├── caregiverAssessment.js # 照护者评估
│   │   ├── cbtContent.js         # CBT 课程内容
│   │   ├── community.js          # 社区资源
│   │   ├── familyCourses.js      # 家庭课程
│   │   ├── familyGuide.js        # 家庭指南
│   │   ├── hospitals.js          # 上海医院数据
│   │   ├── hotlines.js          # 心理援助热线
│   │   ├── insurance.js         # 医保政策
│   │   ├── medicationKnowledge.js # 药物知识
│   │   ├── peerStories.js        # 同伴故事
│   │   ├── socialTasks.js        # 社交任务
│   │   └── wrapTemplate.js      # WRAP 模板
│   ├── styles/                   # 样式
│   │   ├── global.css            # 全局样式
│   │   └── theme.css             # 主题变量
│   └── utils/                    # 工具函数
│       ├── dateUtils.js         # 日期工具
│       └── riskCalculator.js    # 风险计算
├── public/
│   ├── audio/                    # 引导音频 (31个 mp3)
│   ├── icons.svg
│   └── favicon.*                  # 多尺寸 Favicon
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 构建产物在 dist/ 目录，可直接打开 dist/index.html 离线运行
```

## 设计规范

- **设计方向**：温暖治愈系
- **主色调**：#4A90D9（治愈蓝）
- **强调色**：#E8985E（温暖橙）
- **背景色**：#F8F6F2（暖白）
- **风险等级**：🟢 良好(≥65) / 🟡 关注(≥45) / 🟠 就医(≥25) / 🔴 紧急(<25)
- **移动端优先**：max-width 480px，触控区域 ≥ 44px
- **无障碍**：ARIA 标签、键盘可访问、prefers-reduced-motion 支持

## 许可证

MIT

## 项目依赖

- `[React]`: https://react.dev/
- `[Vite]`: https://vite.dev/
- `[React Router]`: https://reactrouter.com/
- `[Vitest]`: https://vitest.dev/
- `[ESLint]`: https://eslint.org/
- `[Edge-TTS]`: https://github.com/rany2/edge-tts
- `[TRAE SOLO CN]`: https://trae.cn/
- `[腾讯云 EdgeOne Pages]`: https://edgeone.ai/zh/
