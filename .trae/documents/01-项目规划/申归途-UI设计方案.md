# 「申归途」UI设计方案

> **设计方向**：温暖治愈系 | **确认方式**：HTML原型逐页预览 | **移动端优先**：max-width 480px

---

## 一、全局设计系统

### 1.1 色彩体系

#### 语义色板

| Token | 色值 | 用途 | WCAG对比度(白底) |
|-------|------|------|-----------------|
| `--color-primary` | `#4A90D9` | 主操作、导航高亮、链接 | 3.2:1 (AA Large) |
| `--color-primary-dark` | `#3A7BC8` | 主色hover/active状态 | 4.5:1 (AA) |
| `--color-primary-light` | `#E8F1FB` | 主色浅底、选中背景 | - |
| `--color-accent` | `#E8985E` | 强调、CTA按钮、重要提示 | 3.0:1 (AA Large) |
| `--color-accent-dark` | `#D4854A` | 强调色hover状态 | 4.1:1 (AA) |
| `--color-success` | `#6BAF7A` | 稳定/安全/完成状态 | 3.4:1 (AA Large) |
| `--color-warning` | `#E8C95A` | 关注/提醒 | 2.8:1 (需深色文字) |
| `--color-danger` | `#D46B6B` | 危险/危机/紧急 | 3.8:1 (AA Large) |
| `--color-danger-dark` | `#C05555` | 危险hover状态 | 4.8:1 (AA) |

#### 中性色板

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-bg` | `#F8F6F2` | 页面背景（暖白） |
| `--color-bg-elevated` | `#FFFFFF` | 卡片、浮层背景 |
| `--color-bg-subtle` | `#F0EDE7` | 次级背景、分隔区域 |
| `--color-text-primary` | `#2D2D2D` | 主文字 |
| `--color-text-secondary` | `#6B6B6B` | 次要文字、说明 |
| `--color-text-tertiary` | `#9B9B9B` | 占位符、禁用文字 |
| `--color-text-inverse` | `#FFFFFF` | 深色背景上的文字 |
| `--color-border` | `#E5E2DC` | 边框、分割线 |
| `--color-border-light` | `#F0EDE7` | 轻边框 |

#### 风险等级色（四级）

| 等级 | 色值 | 浅底色 | 语义 |
|------|------|--------|------|
| 绿色(稳定) | `#6BAF7A` | `#EDF5EF` | 状态良好 |
| 黄色(关注) | `#E8C95A` | `#FDF8E8` | 需要关注 |
| 橙色(预警) | `#E8985E` | `#FDF0E5` | 建议行动 |
| 红色(危机) | `#D46B6B` | `#FDECEC` | 立即行动 |

### 1.2 字体系统

```css
--font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont,
  'Segoe UI', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
```

#### 字号阶梯

| Token | 大小 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|
| `--text-hero` | 28px | 1.3 | 700 | 欢迎页标题、仪表盘核心数字 |
| `--text-h1` | 22px | 1.35 | 700 | 页面标题 |
| `--text-h2` | 18px | 1.4 | 600 | 区块标题、卡片标题 |
| `--text-h3` | 16px | 1.5 | 600 | 子标题、列表标题 |
| `--text-body` | 15px | 1.6 | 400 | 正文内容 |
| `--text-body-sm` | 14px | 1.5 | 400 | 辅助说明、列表项 |
| `--text-caption` | 12px | 1.4 | 400 | 标签、时间戳、脚注 |
| `--text-button` | 16px | 1 | 600 | 按钮文字 |

#### 字重规范

- **400 Regular**：正文、说明文字
- **500 Medium**：表格数据、导航标签
- **600 Semibold**：小标题、按钮、强调文字
- **700 Bold**：页面标题、核心数据、品牌名称

### 1.3 间距系统（8px基准网格）

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-xs` | 4px | 图标与文字间距、紧凑元素 |
| `--space-sm` | 8px | 同组元素间距 |
| `--space-md` | 12px | 列表项间距、内边距 |
| `--space-base` | 16px | 卡片内边距、区块间距 |
| `--space-lg` | 24px | 大区块间距、页面section间距 |
| `--space-xl` | 32px | 页面顶部/底部留白 |
| `--space-2xl` | 48px | 页面级大留白 |

### 1.4 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | 6px | 标签、小按钮 |
| `--radius-md` | 10px | 卡片、输入框、弹窗 |
| `--radius-lg` | 16px | 大卡片、模态框 |
| `--radius-xl` | 24px | 全宽底部弹窗 |
| `--radius-full` | 9999px | 胶囊按钮、头像 |

### 1.5 阴影系统

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | 卡片默认 |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.08)` | 悬浮卡片、下拉 |
| `--shadow-lg` | `0 4px 16px rgba(0,0,0,0.10)` | 弹窗、浮动按钮 |
| `--shadow-crisis` | `0 4px 20px rgba(212,107,107,0.3)` | 危机按钮专属 |

### 1.6 动画与微交互

#### 原则
- **克制**：仅用于功能反馈，不用于装饰
- **快速**：过渡时长 150-300ms，避免让用户等待
- **柔和**：使用 `ease-out` 缓动，避免生硬

#### 动画Token

```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
```

#### 关键微交互清单

| 交互 | 动画类型 | 时长 | 说明 |
|------|---------|------|------|
| 按钮点击 | scale(0.97) + opacity | 150ms | 按下缩小反馈 |
| 卡片触摸 | translateY(-1px) + shadow增强 | 150ms | 轻微浮起 |
| 页面切换 | fadeIn | 200ms | 内容淡入 |
| 打卡评分选择 | scale弹跳(1.0→1.15→1.0) | 250ms | 选中弹跳 |
| 仪表盘填充 | strokeDashoffset渐变 | 800ms | 圆环动画填充 |
| 呼吸引导 | scale(1.0→1.3→1.0) | 4s/7s/8s | 跟随呼吸节奏 |
| Tab切换 | 下划线滑动 | 250ms | 底部指示器平移 |
| 危机按钮 | pulse呼吸光晕 | 2s循环 | 持续吸引注意 |
| 成功提交 | checkmark绘制 | 400ms | SVG路径动画 |
| Toast提示 | slideUp + fadeIn | 250ms | 从底部滑入 |

#### 减弱动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 1.7 无障碍规范

| 要求 | 实现方式 |
|------|---------|
| 焦点可见 | `outline: 2px solid var(--color-primary); outline-offset: 2px;` |
| 触摸目标 | 最小 44x44px（Apple HIG标准） |
| 颜色对比度 | 文字/背景 >= 4.5:1 (AA)，大文字 >= 3:1 |
| 语义HTML | 使用 `<header>`, `<main>`, `<nav>`, `<section>`, `<button>` |
| ARIA标签 | 图标按钮添加 `aria-label`，评分组件添加 `aria-valuenow` |
| 键盘导航 | Tab顺序符合视觉顺序，Escape关闭弹窗 |
| 屏幕阅读器 | 隐藏装饰元素 `aria-hidden="true"`，状态变化用 `aria-live` |
| 危机按钮 | `role="alert"` + 高对比度，确保任何状态都可触达 |

### 1.8 CSS变量汇总（theme.css核心结构）

```css
:root {
  /* 色彩 */
  --color-primary: #4A90D9;
  --color-primary-dark: #3A7BC8;
  --color-primary-light: #E8F1FB;
  --color-accent: #E8985E;
  --color-accent-dark: #D4854A;
  --color-success: #6BAF7A;
  --color-warning: #E8C95A;
  --color-danger: #D46B6B;
  --color-danger-dark: #C05555;
  --color-bg: #F8F6F2;
  --color-bg-elevated: #FFFFFF;
  --color-bg-subtle: #F0EDE7;
  --color-text-primary: #2D2D2D;
  --color-text-secondary: #6B6B6B;
  --color-text-tertiary: #9B9B9B;
  --color-text-inverse: #FFFFFF;
  --color-border: #E5E2DC;
  --color-border-light: #F0EDE7;

  /* 风险等级 */
  --risk-green: #6BAF7A;
  --risk-yellow: #E8C95A;
  --risk-orange: #E8985E;
  --risk-red: #D46B6B;

  /* 字体 */
  --font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont,
    'Segoe UI', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-base: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.10);
  --shadow-crisis: 0 4px 20px rgba(212,107,107,0.3);
}
```

---

## 二、共享组件设计

### 2.1 Layout（主布局）

**结构**：
```
<main className={styles.layout}>
  <Outlet />
  <BottomNav />
  <CrisisButton />
</main>
```

**布局规范**：
- `min-height: 100vh`，`padding-bottom: 80px`（为BottomNav留空）
- 内容区 `max-width: 480px`，`margin: 0 auto`
- 背景色 `var(--color-bg)`
- 页面切换使用 `fadeIn` 动画（200ms）

### 2.2 BottomNav（底部导航栏）

**结构**：固定底部，5个Tab

| Tab | 图标(Emoji) | 标签 | 路由 |
|-----|------------|------|------|
| 打卡 | 📝 | 打卡 | `/checkin` |
| 预警 | 📊 | 预警 | `/dashboard` |
| 用药 | 💊 | 用药 | `/medication` |
| 服务 | 🏥 | 服务 | `/resources` |
| 求助 | 🆘 | 求助 | `/crisis` |

**视觉规范**：
- 高度：`64px`，背景 `var(--color-bg-elevated)`
- 顶部 `1px solid var(--color-border)` 分割线
- 未选中：图标 20px + 文字 11px，颜色 `var(--color-text-tertiary)`
- 选中：图标 22px + 文字 12px，颜色 `var(--color-primary)`，字重 600
- 选中指示器：Tab上方 `3px` 高的 `var(--color-primary)` 圆角条
- 切换动画：指示器 `translateX` 滑动 250ms
- 安全区适配：`padding-bottom: env(safe-area-inset-bottom)`
- 触摸目标：每个Tab至少 `44px` 高

**CSS提示**：
```css
.nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 64px;
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
  display: flex;
  z-index: 100;
}
.navItem {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--color-text-tertiary);
  transition: color var(--duration-normal) var(--easing-default);
  min-height: 44px;
}
.navItem.active {
  color: var(--color-primary);
  font-weight: 600;
}
```

### 2.3 CrisisButton（浮动求助按钮）

**视觉规范**：
- 位置：`fixed`，`right: 16px`，`bottom: 80px`（BottomNav上方）
- 尺寸：`52x52px`，圆形 `border-radius: 50%`
- 背景：`var(--color-danger)`，文字 🆘 白色 22px
- 阴影：`var(--shadow-crisis)` 红色光晕
- 动画：`pulse` 呼吸效果（2s循环，scale 1.0→1.05→1.0，opacity 1→0.85→1）
- hover/active：`var(--color-danger-dark)`，scale(0.95)
- `aria-label="紧急求助"`，`role="button"`

**CSS提示**：
```css
.crisisBtn {
  position: fixed;
  right: 16px;
  bottom: 80px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-danger);
  border: none;
  box-shadow: var(--shadow-crisis);
  animation: pulse 2s ease-in-out infinite;
  z-index: 200;
  cursor: pointer;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.85; }
}
```

### 2.4 通用UI元素

#### 按钮
- **主按钮**：`var(--color-primary)` 背景，白色文字，`--radius-full`，高度 44px，内边距 `0 24px`
- **强调按钮**：`var(--color-accent)` 背景，用于关键CTA（如"开始使用"）
- **次按钮**：透明背景，`var(--color-primary)` 边框 1.5px，`var(--color-primary)` 文字
- **危险按钮**：`var(--color-danger)` 背景，用于危机操作
- **文字按钮**：无边框无背景，`var(--color-primary)` 文字
- **禁用态**：opacity 0.4，`cursor: not-allowed`，`pointer-events: none`

#### 卡片
- 背景：`var(--color-bg-elevated)`
- 圆角：`var(--radius-md)` (10px)
- 阴影：`var(--shadow-sm)`
- 内边距：`var(--space-base)` (16px)
- 卡片间距：`var(--space-md)` (12px)

#### 输入框
- 高度：44px，背景 `var(--color-bg)`，边框 `1.5px solid var(--color-border)`
- 圆角：`var(--radius-sm)` (6px)
- 聚焦：边框变 `var(--color-primary)`，`box-shadow: 0 0 0 3px var(--color-primary-light)`
- 占位符颜色：`var(--color-text-tertiary)`

#### Toast提示
- 位置：底部居中，BottomNav上方
- 背景：`var(--color-text-primary)`，白色文字
- 圆角：`var(--radius-full)`，最大宽度 80%
- 动画：slideUp + fadeIn 250ms，自动消失 3s

---

## 三、逐页详细设计

### 3.1 Welcome（欢迎页）

**设计理念**：第一屏海报式设计，大气温暖，建立信任感。不使用卡片堆叠，用排版和留白创造呼吸感。

**页面结构**（自上而下）：

```
┌─────────────────────────┐
│                         │
│    [渐变背景区域]        │  ← 顶部40%屏幕，浅蓝到暖白渐变
│                         │
│      申 归 途           │  ← --text-hero (28px, 700)
│                         │
│   上海抑郁症复发预防     │  ← --text-h3 (16px, 400)
│      支持工具           │     --color-text-secondary
│                         │
│   "每一步，都有人陪你"   │  ← --text-body (15px, 400)
│     品牌标语(斜体)      │     --color-text-tertiary
│                         │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │ 🛡️ 六维预警监测   │  │  ← 三个核心价值，横向排列
│  │ 💊 用药全程陪伴   │  │     每项：Emoji + 标题 + 一行说明
│  │ 🏥 上海本地服务   │  │     --text-body-sm
│  └───────────────────┘  │
│                         │
│  ── 数据支撑 ──         │  ← 轻分隔线 + 小标题
│                         │
│  50-85%    9500万   2025│  ← 三个关键数据
│  复发率    患者总数  医保 │     数字用 --text-h2 (18px, 700)
│                         │     说明用 --text-caption (12px)
│                         │
│  ┌───────────────────┐  │
│  │   开 始 使 用     │  │  ← 强调按钮，全宽
│  └───────────────────┘  │     --color-accent 背景
│                         │     高度 48px，--radius-full
│                         │
│  免责声明文字            │  ← --text-caption (12px)
│  24h热线: 962525        │     --color-text-tertiary
│                         │
└─────────────────────────┘
```

**详细规范**：

- **顶部渐变区域**：`background: linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-bg) 100%)`，占据约 40vh，内容垂直居中
- **品牌标题**：「申归途」三个字使用 `letter-spacing: 8px` 增加品牌感，颜色 `var(--color-primary)`
- **核心价值区**：三列等宽布局，每列居中对齐，Emoji 28px，标题 `--text-body-sm` 600，说明 `--text-caption`
- **数据区**：三列等宽，数字 `var(--color-primary)`，使用 `tabular-nums` 等宽数字
- **CTA按钮**：`var(--color-accent)` 背景，白色文字 18px 700，`margin: var(--space-xl) var(--space-base)`，点击后 `navigate('/checkin')`
- **底部免责**：`padding-bottom: var(--space-xl)`，含962525热线链接
- **无BottomNav**：Welcome页不显示底部导航

**交互**：
- 进入页面：标题和内容依次 fadeIn（stagger 100ms）
- CTA按钮：hover 放大至 scale(1.02)，active scale(0.98)
- 无其他交互元素，保持简洁

**CSS关键提示**：
```css
.hero {
  min-height: 40vh;
  background: linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-bg) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--space-base);
}
.brandName {
  font-size: var(--text-hero);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 8px;
  margin-bottom: var(--space-sm);
}
```

---

### 3.2 CheckIn（每日打卡页）

**设计理念**：30秒完成的核心交互。克制、清晰、低负担。每个维度一行，左右标注极端值，中间5个选择点。

**页面结构**：

```
┌─────────────────────────┐
│  每日打卡          4/30 │  ← 页面标题 + 日期
│  "花30秒，记录今天的你" │  ← 引导语，--text-body-sm
├─────────────────────────┤
│                         │
│  😴 睡眠质量            │  ← 维度标题行：Emoji + 名称
│                         │
│  几乎没睡 ○○○○○ 睡很好  │  ← 5个圆形选择按钮
│           1 2 3 4 5     │     未选：边框 --color-border
│                         │     选中：填充 --color-primary
│  ─────────────────────  │
│                         │
│  💭 情绪状态            │
│  很低落   ○○○○○  很好   │
│                         │
│  ─────────────────────  │
│                         │
│  💪 躯体感受            │
│  很不适   ○○○○○  舒适   │
│                         │
│  ─────────────────────  │
│                         │
│  🚀 动力水平            │
│  毫无     ○○○○○  充沛   │
│                         │
│  ─────────────────────  │
│                         │
│  🧠 认知清晰度          │
│  模糊     ○○○○○  清晰   │
│                         │
│  ─────────────────────  │
│                         │
│  🤝 社交意愿            │
│  想独处   ○○○○○  想交流  │
│                         │
├─────────────────────────┤
│  💬 今天想说什么？      │  ← 可选文本框
│  ┌───────────────────┐  │     placeholder: "选填，记录此刻感受..."
│  │                   │  │     200字限制，右下角显示字数
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │    提交打卡        │  │  ← 主按钮
│  └───────────────────┘  │     6维全选后启用，否则 disabled
│                         │
└─────────────────────────┘
```

**三种状态设计**：

**状态一：未打卡（默认）**
- 显示上述完整评分界面
- 提交按钮 disabled 态（opacity 0.4），6个维度全部评分后激活
- 激活时按钮添加微妙动画提示（轻微上下浮动）

**状态二：刚提交成功**
- 整个评分区域淡出
- 中央显示大号 Emoji（随机选择：🌟/🌈/💪/🌻/🤗）+ 鼓励语
- 鼓励语池：
  - "今天又照顾好自己了"
  - "记录本身就是一种勇气"
  - "你在做自己最好的守护者"
  - "每一步都算数"
  - "谢谢你的诚实"
- 3秒后或点击任意位置回到"已打卡"状态

**状态三：今日已打卡**
- 简洁展示：打卡完成图标 ✅ + "今日已完成打卡" + 打卡时间
- 下方显示今日评分摘要（6维雷达图或简单条形图）
- 底部文字："明天继续，我在这里等你"

**详细规范**：

- **评分按钮**：每个 `36x36px` 圆形，间距 `8px`，触摸区域扩大到 `44x44px`（通过 padding）
- **选中动画**：scale 弹跳 `1.0 → 1.2 → 1.0`，250ms
- **维度间距**：每个维度区块间距 `20px`，维度标题与评分按钮间距 `8px`
- **左右标注**：`--text-caption` (12px)，`--color-text-tertiary`
- **维度间分隔线**：`1px solid var(--color-border-light)`，或用间距代替（更简洁）
- **文本框**：`min-height: 80px`，`border-radius: var(--radius-sm)`，背景 `var(--color-bg)`
- **页面内边距**：`padding: var(--space-base)`

**无障碍**：
- 评分按钮组使用 `role="radiogroup"` + `role="radio"` + `aria-checked`
- `aria-valuenow` 反映当前选中分数
- 提交按钮 `aria-disabled="true"` 当未完成评分时

---

### 3.3 Dashboard（预警仪表盘）

**设计理念**：信息密度适中，一眼看到核心风险状态，向下滚动查看详情。仪表盘是"感知层"的可视化输出。

**页面结构**：

```
┌─────────────────────────┐
│  预警仪表盘             │  ← 页面标题
│  "了解自己的状态"       │  ← 引导语
├─────────────────────────┤
│                         │
│      ┌─────────┐       │
│     /           \      │  ← SVG圆环仪表盘
│    │    72      │      │     直径 180px
│    │   稳定     │      │     中心：分数 + 等级文字
│     \           /      │     颜色随等级变化
│      └─────────┘       │
│                         │
│  "你的状态整体稳定"     │  ← 建议文案，根据等级变化
│                         │
├─────────────────────────┤
│                         │
│  ┌────┐ ┌────┐ ┌────┐  │  ← 三个统计卡片，横向等宽
│  │ 7  │ │ 23 │ │ 5  │  │
│  │连续 │ │累计 │ │本周 │  │
│  │打卡 │ │打卡 │ │记录 │  │
│  └────┘ └────┘ └────┘  │
│                         │
├─────────────────────────┤
│                         │
│  近7天趋势              │  ← 区块标题
│                         │
│  周一 周二 周三 ... 周日 │  ← 纯CSS柱状图
│  ███ ███ ███     ███   │     每天6根细柱子(6维)
│  ███ ███ ███     ███   │     柱高映射分数1-5
│  ███ ███             ███│     颜色：--color-primary
│                         │
│  图例：😴💭💪🚀🧠🤝   │  ← 维度图例
│                         │
├─────────────────────────┤
│  ⚠️ 如果感到不适，      │  ← 仅红色等级显示
│  请拨打 962525          │     橙色背景条
└─────────────────────────┘
```

**RiskGauge SVG仪表盘组件规范**：

- **容器**：`200x200px`，居中
- **圆环**：`stroke-width: 12`，`r: 85`，背景轨道 `var(--color-bg-subtle)`
- **填充弧**：`stroke-dasharray: 534`（周长），`stroke-dashoffset` 根据分数计算
- **颜色**：根据风险等级使用对应色值（绿/黄/橙/红）
- **动画**：页面加载时从0填充到目标值，800ms `ease-out`
- **中心文字**：分数 `--text-hero` (28px, 700)，等级标签 `--text-h3` (16px, 600)
- **无数据时**：显示灰色圆环 + "暂无数据" + "完成打卡后这里会显示你的状态"

**统计卡片规范**：
- 三列等宽，间距 `8px`
- 数字 `--text-h1` (22px, 700)，颜色 `var(--color-primary)`
- 标签 `--text-caption` (12px)，`--color-text-secondary`
- 背景 `var(--color-bg-elevated)`，`--radius-sm`，`--shadow-sm`

**7天趋势图规范**：
- 纯CSS实现，不引入图表库
- 每天6根柱子，柱宽 `6px`，柱间距 `2px`，组间距 `12px`
- 柱高：`score * 16px`（1分=16px，5分=80px）
- 颜色统一使用 `var(--color-primary)`，opacity 0.7
- X轴标签：周一~周日（或日期），`--text-caption`
- 底部图例：6个Emoji + 维度名，`--text-caption`

**建议文案映射**：

| 等级 | 文案 |
|------|------|
| 绿色 | "你的状态整体稳定，继续保持" |
| 黄色 | "有些维度需要留意，试着多关注自己" |
| 橙色 | "状态有所波动，建议联系专业人士聊聊" |
| 红色 | "你的状态需要关注，请拨打962525或联系医生" |

---

### 3.4 Medication（用药管理）

**设计理念**：简洁的药物列表 + 温暖的正向反馈。不做复杂日历视图，聚焦"今天该吃什么"。

**页面结构**：

```
┌─────────────────────────┐
│  用药管理               │  ← 页面标题
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │  本周依从率        │  │  ← 依从率卡片（突出显示）
│  │                   │  │
│  │     85%           │  │     大号百分比数字
│  │  ████████░░       │  │     进度条
│  │  本周服药 6/7 次   │  │     次要信息
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│                         │
│  我的药物        + 添加 │  ← 标题行 + 添加按钮
│                         │
│  ┌───────────────────┐  │
│  │ 草酸艾司西酞普兰   │  │  ← 药物卡片
│  │ 10mg · 每日1次     │  │     名称 + 剂量/频次
│  │ 早餐后            │  │     服药时间
│  │                   │  │
│  │ [✅已服] [跳过]    │  │     操作按钮
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 喹硫平             │  │  ← 另一种药物
│  │ 25mg · 每晚1次     │  │
│  │ 睡前              │  │
│  │                   │  │
│  │ [✅已服] [跳过]    │  │
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│  💡 温馨提示            │  ← 底部提示区
│  "漏服不必焦虑..."      │     --color-text-secondary
└─────────────────────────┘
```

**依从率卡片规范**：
- 背景：`var(--color-bg-elevated)`，`--radius-md`，`--shadow-sm`
- 百分比数字：`--text-hero` (28px, 700)，颜色根据依从率变化（>=80% 绿色，50-79% 橙色，<50% 红色）
- 进度条：高度 `8px`，`--radius-full`，背景 `var(--color-bg-subtle)`，填充色同百分比颜色
- 进度条动画：页面加载时从0填充，600ms

**药物卡片规范**：
- 背景：`var(--color-bg-elevated)`，`--radius-md`，`--shadow-sm`
- 药物名称：`--text-h3` (16px, 600)
- 剂量信息：`--text-body-sm` (14px)，`--color-text-secondary`
- 操作按钮行：右对齐，间距 `8px`
  - "已服"按钮：`var(--color-success)` 浅底，绿色文字，点击后变为 "✅ 已服" 禁用态
  - "跳过"按钮：文字按钮，`--color-text-tertiary`，点击后弹出温和关心语

**正向反馈设计**：
- 服药成功：按钮变为 ✅ + 随机鼓励语 Toast（"今天又照顾好自己了" / "坚持就是力量" / "你做得很好"）
- 跳过服药：温和弹出 "没关系，记得和医生聊聊。需要记录原因吗？"（非强制）
- 连续服药7天：依从率卡片显示 🎉 "连续一周！你真棒"

**添加药物表单**（点击"+添加"展开）：
- 从页面底部滑入的表单区域
- 字段：药物名称（text）、剂量（text，如"10mg"）、频次（select）、服药时间（text）
- 底部：取消 + 确认添加 两个按钮
- 动画：slideUp 250ms

**底部温馨提示**：
- 背景：`var(--color-primary-light)` 浅蓝底
- 图标 💡 + 文字
- 内容："漏服不必焦虑。如果偶尔忘记，不要加倍补服。如有疑问，请咨询医生。"

---

### 3.5 Resources（上海服务页）

**设计理念**：信息密集但有序。4个Tab分类，数据驱动，易于更新。服务数据集中在 `src/data/` 目录，修改数据文件即可更新内容。

**页面结构**：

```
┌─────────────────────────┐
│  上海服务               │  ← 页面标题
├─────────────────────────┤
│  [医院] [热线] [社区] [医保] │  ← 4个Tab
│  ──────────              │     选中Tab下划线指示
├─────────────────────────┤
│                         │
│  ┌─ 筛选 ─────────────┐ │  ← 仅医院Tab显示
│  │ [全部区域 ▾]       │ │     下拉筛选
│  └────────────────────┘ │
│                         │
│  ┌───────────────────┐  │
│  │ 上海市精神卫生中心  │  │  ← 服务卡片
│  │ 三甲 · 专科       │  │     （以医院为例）
│  │ 📍 宛平南路600号   │  │
│  │ 📞 021-64387250   │  │
│  │ 🏷️ 门诊/急诊/心理  │  │
│  │ [📞 拨打电话]      │  │     tel: 链接
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ ...更多卡片...     │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

**Tab设计规范**：
- 4个Tab等宽排列，高度 `44px`
- 未选中：`--text-body` (15px)，`--color-text-secondary`
- 选中：`--text-body` (15px, 600)，`--color-primary)`
- 指示器：`3px` 高 `var(--color-primary)` 条，`translateX` 动画切换
- Tab内容切换：fadeIn 200ms

**各Tab内容规范**：

**Tab 1：医院**
- 顶部：区域筛选下拉框（全部/徐汇/浦东/杨浦/虹口/闵行/宝山/奉贤）
- 卡片内容：医院名称（h3）、等级标签（三甲/二甲）、地址、电话、科室标签
- 电话支持 `tel:` 协议一键拨打

**Tab 2：热线**
- 962525 和 400-161-9995 使用醒目样式（`var(--color-primary)` 左边框 4px）
- 每条热线：名称、号码（大号可点击）、描述、服务时间
- 24小时热线标注 "24h" 绿色标签

**Tab 3：社区**
- 社区服务卡片：名称、覆盖范围、服务内容标签、地址
- 标签样式：`--color-primary-light` 背景 + `--color-primary` 文字

**Tab 4：医保**
- 政策信息使用列表形式（非卡片）
- 每条政策：标题 + 说明
- 关键信息高亮（如 "85%" 报销比例用 `var(--color-accent)` 加粗）

**服务卡片通用规范**：
- 背景：`var(--color-bg-elevated)`，`--radius-md`，`--shadow-sm`
- 内边距：`var(--space-base)`
- 电话号码：`--color-primary`，可点击
- 标签：`--radius-sm`，`--color-primary-light` 背景，`--color-primary` 文字，`--text-caption`

---

### 3.6 Crisis（危机干预页）

**设计理念**：温暖、安全、即时可用。这是最重要的页面，设计目标是让用户在最脆弱的时刻感到"有人在这里"。去除一切不必要的元素。

**页面结构**：

```
┌─────────────────────────┐
│                         │
│                         │
│     你不是一个人         │  ← 核心文案，居中
│                         │     --text-h1 (22px, 700)
│   "无论发生什么，        │     --color-text-primary
│    都有人愿意倾听"       │  ← 副文案
│                         │     --text-body-sm
│                         │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │ 📞 962525         │  │  ← 主热线按钮
│  │ 上海市心理热线      │  │     大号，醒目
│  │ 24小时 · 免费     │  │     --color-primary 背景
│  └───────────────────┘  │     高度 64px
│                         │
│  ┌───────────────────┐  │
│  │ 📞 400-161-9995   │  │  ← 备用热线
│  │ 全国心理援助热线    │  │     --color-primary 边框
│  │ 24小时 · 免费     │  │     透明背景
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│                         │
│  更多求助渠道            │  ← 折叠区域标题
│                         │
│  · 12320-5 卫生热线     │
│  · 12355 青少年热线     │  ← 列表，每项可点击拨打
│  · 12338 妇女热线       │
│  · 120 急救电话         │
│                         │
├─────────────────────────┤
│                         │
│  🫁 跟我一起呼吸        │  ← 呼吸引导区
│                         │
│       ╭──────╮          │
│      ╱        ╲         │  ← 呼吸动画圆圈
│     │  吸气   │         │     scale 跟随节奏
│     │  4秒    │         │
│      ╲        ╱         │
│       ╰──────╯          │
│                         │
│  [开始呼吸] [停止]      │  ← 控制按钮
│                         │
├─────────────────────────┤
│                         │
│  🛡️ 安全提示            │  ← 底部安全信息
│  · 你现在很安全          │
│  · 这些感受会过去的      │
│  · 不要独自承受          │
│                         │
└─────────────────────────┘
```

**核心文案区规范**：
- 上方留白 `var(--space-2xl)` (48px)
- 主文案居中，`--text-h1` (22px, 700)
- 副文案居中，`--text-body-sm`，`--color-text-secondary`

**热线按钮规范**：
- 主热线（962525）：`var(--color-primary)` 背景，白色文字，高度 `64px`，`--radius-md`
  - 号码 `--text-h2` (18px, 700)，描述 `--text-caption` (12px)
  - `tel:` 链接，全宽可点击
- 备用热线（400-161-9995）：`var(--color-primary)` 边框 2px，透明背景

**呼吸引导规范**：
- 圆圈直径 `120px`，初始 `var(--color-primary)` 浅色填充
- 动画循环：吸气(4s) → 屏住(7s) → 呼气(8s)，共19s一轮
  - 吸气：scale(1.0 → 1.3)，颜色渐深
  - 屏住：保持 scale(1.3)
  - 呼气：scale(1.3 → 1.0)，颜色渐浅
- 中央文字：当前阶段 + 倒计时（如"吸气 3"）
- 实现方式：`useState` + `useEffect` + `setInterval`，CSS `transition: transform 1s ease-in-out`

**安全提示区规范**：
- 背景：`var(--color-primary-light)` 浅蓝底，`--radius-md`
- 内容："你现在很安全" / "这些感受会过去的" / "不要独自承受，打电话给信任的人" / "如果你有伤害自己的想法，请立即拨打上方热线"

---

### 3.7 CBTCourse（迷你CBT课程）—— 可选

**设计理念**：步骤式学习体验，渐进解锁，练习重于阅读。每次10-15分钟。

**页面结构**：

```
┌─────────────────────────┐
│  ← 迷你课程             │  ← 返回按钮 + 标题
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │ 📖 认识你的情绪    │  │  ← 课程卡片（列表视图）
│  │ 5个步骤 · 已完成2步 │  │     进度条
│  │ ████████░░░ 40%    │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 🧠 识别思维陷阱    │  │  ← 另一门课程
│  │ 4个步骤 · 未开始   │  │
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│  （点击课程进入步骤视图） │
│                         │
│  认识你的情绪    3/5    │  ← 步骤进度
│  ●●●○○                 │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │  步骤内容区域      │  │  ← 内容/练习/反思
│  │                   │  │     根据类型不同展示
│  │  （文字/互动/输入） │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  [上一步]    [下一步]   │  ← 导航按钮
│                         │
└─────────────────────────┘
```

**课程列表视图规范**：
- 课程卡片：`--radius-md`，`--shadow-sm`
- 进度条：`4px` 高，`--radius-full`，`var(--color-primary)` 填充
- 未解锁课程：opacity 0.5 + 锁定图标 🔒

**步骤视图规范**：
- 顶部：课程名 + 步骤进度（如 "3/5"）+ 圆点指示器
- 步骤类型：内容型（文字+Emoji）、练习型（互动元素）、反思型（文本输入框）
- 底部导航：固定底部，"上一步"（次按钮）+ "下一步"（主按钮）

---

### 3.8 WRAPPlan（个人WRAP计划）—— 可选

**设计理念**：可编辑的个人健康计划。折叠面板节省空间，LocalStorage持久化。

**页面结构**：

```
┌─────────────────────────┐
│  我的WRAP计划           │  ← 页面标题
│  "你的个性化康复蓝图"   │  ← 引导语
├─────────────────────────┤
│                         │
│  ▼ 每日维护清单         │  ← 折叠面板（默认展开）
│  ┌───────────────────┐  │
│  │ · 每天服药        │  │  ← 条目列表
│  │ · 10分钟正念      │  │
│  │ · 散步30分钟      │  │
│  │                   │  │
│  │ [+ 添加条目]      │  │  ← 添加按钮
│  └───────────────────┘  │
│                         │
│  ▶ 预警信号识别         │  ← 折叠面板（默认收起）
│                         │
│  ▶ 应对策略工具箱       │
│                         │
│  ▶ 危机计划             │
│                         │
│  ▶ 康复后自我关怀       │
│                         │
├─────────────────────────┤
│  💡 关于WRAP            │  ← 底部说明
│  WRAP是...             │
└─────────────────────────┘
```

**折叠面板规范**：
- 标题行：`--text-h3` (16px, 600) + 展开/收起箭头 ▼/▶
- 标题行可点击，触摸目标 44px
- 展开动画：`max-height` 过渡 300ms
- 面板背景：`var(--color-bg-elevated)`，`--radius-md`

**5个面板内容模板**：

| 面板 | 引导提示 | 预填示例 |
|------|---------|---------|
| 每日维护清单 | "每天做什么让自己感觉好？" | 服药、正念、散步 |
| 预警信号识别 | "你特有的早期预警信号是什么？" | 开始失眠、不想说话 |
| 应对工具箱 | "状态不好时，什么对你有帮助？" | 听音乐、找朋友聊天 |
| 危机计划 | "紧急时，谁能帮助你？" | 医生电话、家属姓名 |
| 康复后关怀 | "康复后，你想对自己说什么？" | 慢慢来、你很勇敢 |

---

## 四、逐页确认流程计划

### 确认方式

采用 **HTML原型预览** 方式，每完成一个页面即生成独立的HTML文件，在浏览器中直接打开预览。确认通过后再进入下一页。

### 确认顺序与检查清单

#### 轮次 1：全局基础 + 共享组件

**交付物**：`prototype-01-global.html`
- 包含：CSS变量系统、全局样式、BottomNav、CrisisButton、通用按钮/卡片/输入框样式展示

**确认要点**：
- [ ] 色彩方案在移动端屏幕上是否和谐温暖
- [ ] 字体大小是否舒适（特别是正文15px是否合适）
- [ ] BottomNav的5个Tab布局是否合理，选中态是否清晰
- [ ] CrisisButton是否醒目但不干扰
- [ ] 按钮的触摸目标是否足够大
- [ ] 暖白背景(#F8F6F2)的视觉效果

#### 轮次 2：Welcome 欢迎页

**交付物**：`prototype-02-welcome.html`
- 包含：完整Welcome页面，含渐变背景、品牌标题、价值展示、数据统计、CTA按钮

**确认要点**：
- [ ] 第一屏是否具有"海报式"视觉冲击
- [ ] 品牌名称「申归途」的呈现是否专业优雅
- [ ] 三个核心价值的展示是否清晰
- [ ] CTA按钮是否足够吸引点击
- [ ] 整体是否传达"温暖治愈"的感觉
- [ ] 免责声明和热线信息是否适当呈现

#### 轮次 3：CheckIn 每日打卡页

**交付物**：`prototype-03-checkin.html`
- 包含：六维评分界面、提交交互、三种状态切换

**确认要点**：
- [ ] 30秒内能否完成打卡（操作效率）
- [ ] 6个维度的评分操作是否直觉化
- [ ] 左右标注文字是否清晰易懂
- [ ] 提交后的鼓励语是否温暖恰当
- [ ] "已打卡"状态的展示是否简洁
- [ ] 整体负担感是否足够低

#### 轮次 4：Dashboard 预警仪表盘

**交付物**：`prototype-04-dashboard.html`
- 包含：SVG仪表盘、统计卡片、7天趋势图、风险等级切换

**确认要点**：
- [ ] 仪表盘的核心信息（风险等级）是否一目了然
- [ ] SVG圆环动画是否流畅
- [ ] 7天趋势图是否可读（6维×7天的信息密度）
- [ ] 不同风险等级的颜色区分是否清晰
- [ ] 无数据时的占位状态是否友好
- [ ] 红色等级的提醒横幅是否醒目

#### 轮次 5：Medication 用药管理

**交付物**：`prototype-05-medication.html`
- 包含：依从率卡片、药物列表、服药操作、添加药物表单

**确认要点**：
- [ ] 依从率的展示是否直观
- [ ] 药物卡片的信息层次是否清晰
- [ ] 服药/跳过操作是否便捷
- [ ] 正向反馈是否温暖不机械
- [ ] 添加药物的流程是否简单
- [ ] 温馨提示的内容是否恰当

#### 轮次 6：Resources 上海服务页

**交付物**：`prototype-06-resources.html`
- 包含：4个Tab切换、医院列表（含筛选）、热线列表、社区服务、医保政策

**确认要点**：
- [ ] 4个Tab的切换是否流畅
- [ ] 医院卡片的信息是否完整且不拥挤
- [ ] 区域筛选是否易用
- [ ] 热线电话是否易于拨打（tel:链接）
- [ ] 962525是否足够醒目
- [ ] 医保政策信息是否清晰可读
- [ ] 整体信息密度是否合适

#### 轮次 7：Crisis 危机干预页

**交付物**：`prototype-07-crisis.html`
- 包含：核心文案、热线按钮、呼吸引导动画、安全提示

**确认要点**：
- [ ] 页面是否传达"安全、不孤单"的感觉
- [ ] 热线按钮是否足够醒目和易于点击
- [ ] 呼吸引导动画是否舒缓自然
- [ ] 呼吸节奏（4-7-8）是否舒适
- [ ] 安全提示的内容是否恰当
- [ ] 整体氛围是否温暖而非冷冰冰

#### 轮次 8：CBTCourse + WRAPPlan（可选页面）

**交付物**：`prototype-08-optional.html`
- 包含：课程列表+步骤视图、WRAP折叠面板

**确认要点**：
- [ ] 课程步骤式导航是否清晰
- [ ] WRAP折叠面板的操作是否流畅
- [ ] 整体风格是否与核心页面一致

#### 轮次 9：整体走查与微调

**交付物**：完整原型（所有页面整合）
- 包含：完整路由导航、所有页面串联、全局一致性检查

**确认要点**：
- [ ] 页面间导航是否流畅
- [ ] 全局视觉一致性（色彩、间距、圆角、阴影）
- [ ] BottomNav在各页面的表现是否一致
- [ ] CrisisButton在各页面是否始终可见且不遮挡内容
- [ ] 整体是否符合"专业、优雅、精简"的要求
- [ ] 移动端 480px 宽度下的整体表现

---

## 五、设计原则总结

### 核心设计价值观

1. **温暖优于冷峻**：暖白背景、圆润角、柔和阴影，避免医疗工具的冰冷感
2. **克制优于丰富**：每屏一个核心任务，少卡片，强排版，留白即呼吸
3. **功能优于装饰**：动画仅用于反馈，不用于炫技；每个元素都有明确用途
4. **安全优于效率**：危机按钮始终可见，热线一键可拨，呼吸引导随时可用
5. **文字优于图标**：Emoji作为辅助而非替代文字，所有操作都有文字说明

### 与技术约束的对齐

| 约束 | 设计应对 |
|------|---------|
| 零外部依赖 | Emoji图标、系统字体栈、纯CSS图表、CSS Modules |
| 离线运行 | HashRouter、无CDN服务、LocalStorage持久化 |
| 移动端优先 | 480px max-width、44px最小触摸目标、大字体大按钮 |
| 易于更新服务 | 数据与视图分离，`src/data/` 目录独立管理 |
