# 申归途 · 微信小程序版

抑郁症全程复发预防支持工具（H5 版 React 应用的完整小程序复刻）。

## 使用方式

1. 用微信开发者工具「导入项目」，选择本 `wechat` 目录
2. AppID 可使用测试号（`project.config.json` 中已配置 `touristappid`）
3. 编译运行即可，所有数据保存在小程序本地存储（`wx.setStorageSync`），与 H5 版 localStorage 逻辑一致

## 项目结构

```
wechat/
├── app.js                      # 小程序入口
├── app.json                    # 全局配置（页面路由 + tabBar）
├── app.wxss                    # 全局主题（CSS 变量与 H5 theme.css 一致）
├── project.config.json         # 开发者工具项目配置
├── sitemap.json                # 收录配置
├── assets/
│   └── audio/                  # 正念引导音频（28 个 mp3，来自 H5 public/audio）
├── utils/
│   ├── date.js                 # 日期工具（对齐 dateUtils.js，含 ISO 周）
│   ├── risk.js                 # 风险评分算法（对齐 riskCalculator.js）
│   ├── store.js                # 本地存储封装 + 全量清除
│   └── service.js              # 业务服务层（对齐 useCheckIn/useMedication/useRiskLevel）
├── data/                       # 静态数据（与 H5 src/data 完全一致）
│   ├── hospitals.js            # 10 家上海医院 + 区域筛选
│   ├── hotlines.js             # 6 条心理热线
│   ├── community.js            # 4 个社区资源
│   ├── insurance.js            # 5 项医保政策
│   ├── cbtContent.js           # 12 门三层课程（CBT/MBCT/WRAP/ACT）
│   ├── wrapTemplate.js         # WRAP 5 大模块模板
│   ├── familyCourses.js        # 6 门家属课程
│   ├── familyGuide.js          # 4 级家属行动指南
│   ├── caregiverAssessment.js  # 照护者压力自评量表
│   ├── medicationKnowledge.js  # 常用药物知识库
│   ├── peerStories.js          # 8 篇同伴故事
│   └── socialTasks.js          # 5 阶段社交康复任务
├── components/
│   └── risk-gauge/             # 风险仪表盘（Canvas 2D 环形进度 + 数字动画）
└── pages/
    ├── welcome/                # 欢迎页（入口）
    ├── dashboard/              # 首页：综合评分/7天趋势/打卡统计（tab）
    ├── checkin/                # 每日签到：6维5级评分 + 备注 + 修改
    ├── medication/             # 用药管理：打卡/依从率/连续天数/起效期引导（tab）
    ├── med-knowledge/          # 用药知识库（手风琴）
    ├── side-effects/           # 副作用周报：评分/历史/应对策略/复诊报告
    ├── mood-correlation/       # 药物-情绪联动分析（周度柱状图 + 洞察）
    ├── taper/                  # 减药导航：计划创建/时间线/医生报告
    ├── resources/              # 服务中心：医院/热线/社区/医保/家属/重建（tab）
    │   ├── family-tab.*        #   家属子页：课程/行动指南/自评/自我关怀清单
    │   └── rebuild-tab.*       #   重建子页：社交任务/同伴故事/社交记录
    ├── crisis/                 # 危机干预：一键拨号 + 4-7-8 呼吸练习
    ├── cbt/                    # 心理干预课程：三层课程/解锁机制/引导播放器（tab）
    └── wrap/                   # WRAP 计划：手风琴编辑器 + 本地持久化
```

## 与 H5 版的功能对应

| H5 | 小程序 | 说明 |
|---|---|---|
| React Router 页面 | app.json pages + tabBar | 4 个 tab 与 H5 BottomNav 一致 |
| useLocalStorage | utils/store.js | key 完全一致（`sgt-*` 前缀） |
| RiskGauge SVG | components/risk-gauge | Canvas 2D 实现，保留数字滚动动画 |
| CrisisButton 悬浮按钮 | app.wxss .crisis-btn | 各页面复用，crisis 页自动隐藏 |
| tel: 链接 | wx.makePhoneCall | 医院/热线/危机页面一键拨号 |
| GuidedPlayer + mp3 | cbt 页内置播放器 | innerAudioContext 播放本地音频 |
| Toast/ConfirmDialog | wx.showToast / wx.showModal | 交互语义一致 |
| Clipboard 复制报告 | wx.setClipboardData | 副作用报告/减药报告 |

> 本工具仅作为辅助支持，不替代专业医疗建议。如需帮助请拨打心理热线 962525。
