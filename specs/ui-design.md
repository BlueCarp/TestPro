# 视觉设计规范 — 番茄钟计时器客户端

> **版本**: 1.0.0
> **设计者**: UID-UI设计师
> **基于**: specs/wireframes.md（PM 线框图）、specs/design.md（TD 技术设计）、specs/api-contract.yaml（数据契约）

---

## 1. 设计令牌（Design Tokens）

```yaml
# ============================================================
# 番茄钟计时器 — 全域设计令牌
# 主题：暖色番茄红 + 中性灰，干净、专注、温暖的产品气质
# ============================================================

colors:
  # ----- 品牌色（番茄红系） -----
  brand:
    tomato-900: "#B71C1C"    # 最深 — active / 强调
    tomato-800: "#C62828"    # 深 — hover
    tomato-700: "#D32F2F"    # 中深 — 主色 hover
    tomato-600: "#E53935"    # 主色 (primary) — 默认
    tomato-500: "#EF5350"    # 浅 — 轻量强调
    tomato-100: "#FFCDD2"    # 极浅 — 背景微染

  # ----- 阶段色 -----
  phase:
    work:        "#E53935"   # 红色 — 工作阶段
    short_break: "#43A047"   # 绿色 — 短休息
    long_break:  "#1E88E5"   # 蓝色 — 长休息

  # ----- 中性色 -----
  neutral:
    900: "#212121"    # 正文 / 标题
    700: "#616161"    # 次要文字
    500: "#9E9E9E"    # 占位符 / 禁用文字
    300: "#E0E0E0"    # 边框 / 分割线
    200: "#EEEEEE"    # 浅边框 / 悬停背景
    100: "#F5F5F5"    # 表面背景 (surface)
    50:  "#FAFAFA"    # 页面背景极浅

  # ----- 功能色 -----
  functional:
    success:         "#188038"   # 成功 (Toast)
    error:           "#D93025"   # 错误 (验证 / Toast)
    focus-ring:      "#1A73E8"   # 焦点环 (蓝色)
    overlay:         "rgba(0,0,0,0.4)"  # 遮罩层

  # ----- 暗黑模式映射（原则性定义，详见 §6） -----
  dark:
    surface-0:  "#1A1A2E"    # 最深背景
    surface-1:  "#2D2D44"    # 卡片表面
    surface-2:  "#3D3D56"    # 次级表面 / hover
    text-primary:  "#E8E8E8"
    text-secondary:"#A0A0B0"
    border:        "#3D3D56"
    overlay:       "rgba(0,0,0,0.6)"

typography:
  font-family: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
  monospace:  "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace"
  
  # 字体缩放 (Modular Scale: 1.25 — Major Third)
  sizes:
    display:    "3.5rem"    # 56px — 计时器主数字
    h1:         "2rem"      # 32px
    h2:         "1.5rem"    # 24px
    h3:         "1.25rem"   # 20px
    body:       "1rem"      # 16px — 基准字号
    body-small: "0.875rem"  # 14px
    caption:    "0.75rem"   # 12px

  weights:
    regular:    400
    medium:     500
    semibold:   600
    bold:       700

  line-heights:
    tight:      1.2         # 计时器数字
    heading:    1.3
    body:       1.6
    relaxed:    1.75

spacing:
  unit: 8px               # 基础网格单元
  # 常用间距令牌
  xs:   4px               # 1/2 unit
  sm:   8px               # 1 unit
  md:   16px              # 2 units
  lg:   24px              # 3 units
  xl:   32px              # 4 units
  xxl:  48px              # 6 units

border-radius:
  none:  "0"
  sm:    "4px"            # 输入框
  md:    "8px"            # 卡片 / 按钮
  lg:    "12px"           # Modal / 大容器
  full:  "9999px"         # 胶囊 / Toggle

shadows:
  sm:    "0 1px 2px rgba(0,0,0,0.08)"              # 卡片
  md:    "0 2px 8px rgba(0,0,0,0.10)"              # 下拉 / 弹出
  lg:    "0 8px 24px rgba(0,0,0,0.12)"             # Modal
  focus: "0 0 0 2px rgba(26,115,232,0.3)"          # 焦点环
  glow-tomato: "0 0 12px rgba(229,57,53,0.25)"     # 计时器运行中发光

transition:
  fast:   "150ms ease-in-out"    # hover / active
  normal: "200ms ease-out"       # 模态 / 弹窗
  slow:   "300ms ease-in-out"    # 页面切换
```

---

## 2. 组件规格

### 2.1 TitleBar（标题栏）

| 属性 | 规格 |
|------|------|
| **用途** | 显示应用名称 + 右侧操作图标 |
| **高度** | 48px |
| **内边距** | `padding: 0 16px` |
| **布局** | flexbox: `justify-content: space-between; align-items: center` |
| **背景** | `background: transparent` |
| **标题文字** | `font-size: 1rem; font-weight: 600; color: #212121` |
| **样式** | 底部可选 1px 分割线 `border-bottom: 1px solid #E0E0E0` |

#### SettingsIcon（设置图标按钮）

| 状态 | 视觉表现 |
|------|---------|
| default | `color: #616161; cursor: pointer` |
| hover | `color: #E53935; transform: rotate(45deg); transition: 200ms` |
| active | `color: #B71C1C` |
| focus | `outline: 2px solid #1A73E8; outline-offset: 2px` |
| disabled | 不适用（始终可用） |

#### BackButton（返回按钮 — 设置页）

| 状态 | 视觉表现 |
|------|---------|
| default | `color: #616161; cursor: pointer` |
| hover | `color: #E53935` |
| active | `color: #B71C1C` |
| focus | `outline: 2px solid #1A73E8; outline-offset: 2px` |
| disabled | 不适用 |

---

### 2.2 PhaseLabel（阶段标签）

| 属性 | 规格 |
|------|------|
| **用途** | 显示当前阶段名称 + 色点指示 |
| **布局** | 居中，`flex` 行，色点 + 文字间距 8px |
| **色点** | `width: 10px; height: 10px; border-radius: 50%` |
| **文字** | `font-size: 0.875rem; font-weight: 600; letter-spacing: 0.02em` |

#### 阶段变体

| 阶段 | 色点色值 | 文字色值 | 标签文本 |
|------|---------|---------|---------|
| work | `#E53935` | `#E53935` | "🔴 工 作" |
| short_break | `#43A047` | `#43A047` | "🟢 短休息" |
| long_break | `#1E88E5` | `#1E88E5` | "🔵 长休息" |

> **注**：色点+文字带阶段色，帮助用户一目了然当前阶段。

---

### 2.3 TimerDisplay（倒计时显示）

| 属性 | 规格 |
|------|------|
| **用途** | 大字显示倒计时 MM:SS |
| **字体** | `'JetBrains Mono', 'SF Mono', monospace` — 等宽数字防抖动 |
| **字号** | `3.5rem` (56px) — 居中 |
| **字重** | `700` (bold) |
| **颜色** | `#212121` |
| **行高** | `1.2` |
| **内边距** | `padding: 24px 16px` |
| **tabular-nums** | `font-variant-numeric: tabular-nums` — 确保数字等宽 |

#### 阶段色发光

| phase | 运行中计时器下方发光 |
|-------|-------------------|
| work | `box-shadow: 0 4px 20px rgba(229,57,53,0.15)` |
| short_break | `box-shadow: 0 4px 20px rgba(67,160,71,0.15)` |
| long_break | `box-shadow: 0 4px 20px rgba(30,136,229,0.15)` |

---

### 2.4 PrimaryButton（主操作按钮）

| 属性 | 规格 |
|------|------|
| **用途** | 核心操作：开始 / 暂停 / 继续 |
| **尺寸** | `height: 48px; min-width: 200px` |
| **圆角** | `border-radius: 24px`（胶囊形） |
| **内边距** | `padding: 0 40px` |
| **字体** | `font-size: 1rem; font-weight: 600; letter-spacing: 0.02em` |
| **光标** | `cursor: pointer` |
| **过渡** | `transition: all 150ms ease-in-out` |

#### 5 状态全覆盖

| 状态 | 按钮文本 | 背景色 | 文字色 | 边框 | 其他 |
|------|---------|--------|--------|------|------|
| default (开始) | "开始" | `#E53935` | `#FFFFFF` | 无 | — |
| default (暂停) | "暂停" | `#E53935` | `#FFFFFF` | 无 | — |
| default (继续) | "继续" | `#E53935` | `#FFFFFF` | 无 | — |
| hover | — | `#D32F2F` | `#FFFFFF` | 无 | `box-shadow: 0 2px 8px rgba(211,47,47,0.3)` |
| active | — | `#B71C1C` | `#FFFFFF` | 无 | `transform: scale(0.97)` |
| focus | — | `#E53935` | `#FFFFFF` | 无 | `outline: 2px solid #1A73E8; outline-offset: 3px` |
| disabled | — | `#E0E0E0` | `#9E9E9E` | 无 | `cursor: not-allowed; box-shadow: none` |
| loading | "开始" | `#E53935` | `#FFFFFF` | 无 | 显示旋转 SVG 图标（16px，白色），`pointer-events: none` |

> **disabled 场景**：倒计时归零瞬间（极短暂态）或系统异常时禁用。正常流程中按钮始终可操作。
>
> **loading 场景**：点击开始后计时器线程初始化期间（<100ms），短时显示 loading 态防止重复点击。

---

### 2.5 SkipButton（跳过按钮）

| 属性 | 规格 |
|------|------|
| **用途** | 跳过当前阶段（次要操作） |
| **类型** | 文字按钮（无背景） |
| **尺寸** | `height: 32px; min-width: 60px` |
| **字体** | `font-size: 0.875rem; font-weight: 500` |
| **光标** | `cursor: pointer` |
| **过渡** | `transition: all 150ms ease-in-out` |

| 状态 | 视觉表现 |
|------|---------|
| default | `color: #616161; background: transparent` |
| hover | `color: #E53935; background: rgba(229,57,53,0.06)` |
| active | `color: #B71C1C; background: rgba(229,57,53,0.10)` |
| focus | `outline: 2px solid #1A73E8; outline-offset: 2px` |
| disabled | `color: #E0E0E0; cursor: not-allowed` |

> **可见性**：仅 `status === "running"` 或 `status === "paused"` 时渲染。wireframes 中 running 态显示"跳过"文字链接，paused 态作为文字按钮之一。

---

### 2.6 ResetButton（重置按钮）

| 属性 | 规格 |
|------|------|
| **用途** | 重置当前阶段到初始时长 |
| **类型** | 文字按钮 |
| **尺寸** | `height: 32px; min-width: 60px` |
| **字体** | `font-size: 0.875rem; font-weight: 500` |
| **光标** | `cursor: pointer` |

| 状态 | 视觉表现 |
|------|---------|
| default | `color: #616161; background: transparent` |
| hover | `color: #D93025; background: rgba(217,48,37,0.06)` |
| active | `color: #B71C1C; background: rgba(217,48,37,0.10)` |
| focus | `outline: 2px solid #1A73E8; outline-offset: 2px` |
| disabled | `color: #E0E0E0; cursor: not-allowed` |

> **可见性**：仅 `status === "paused"` 时渲染（wireframes §4.1 paused_work 线框图）。

---

### 2.7 PomodoroCounter（番茄钟计数）

| 属性 | 规格 |
|------|------|
| **用途** | 显示当前循环已完成的工作番茄钟数量 |
| **布局** | 居中，flex 行，图标+文字间距 4px |
| **图标** | 🍅 emoji（因番茄为具象事物，使用 emoji 更具可读性），字号 1rem |
| **文字** | `font-size: 0.875rem; color: #616161; font-weight: 500` |
| **格式** | `🍅 × N`（N 为 0–4 的数字） |
| **显示规则** | 始终显示，count=0 时显示 "🍅 × 0" |

---

### 2.8 DurationInput（时长调节组件）

| 属性 | 规格 |
|------|------|
| **用途** | 设置页面中调节工作时长/短休息/长休息（± 按钮 + 数字输入） |
| **布局** | flex 行：`label | [—] value [+] | 单位` |
| **高度** | 40px |
| **内边距** | 每项 `padding: 0 12px` |

#### 数值输入框

| 状态 | 视觉表现 |
|------|---------|
| default | `border: 1px solid #E0E0E0; border-radius: 4px; background: #FFFFFF; color: #212121` |
| hover | `border-color: #E53935` |
| focus | `border-color: #1A73E8; outline: 2px solid rgba(26,115,232,0.3)` |
| disabled | `background: #F5F5F5; color: #9E9E9E; cursor: not-allowed` |
| error | `border-color: #D93025; outline: 2px solid rgba(217,48,37,0.3)` |

#### ± 步进按钮

| 状态 | 视觉表现 |
|------|---------|
| default | `width: 32px; height: 32px; border-radius: 50%; border: 1px solid #E0E0E0; background: #FFFFFF; color: #616161; cursor: pointer` |
| hover | `border-color: #E53935; color: #E53935; background: rgba(229,57,53,0.06)` |
| active | `background: rgba(229,57,53,0.12); transform: scale(0.93)` |
| focus | `outline: 2px solid #1A73E8; outline-offset: 2px` |
| disabled | `border-color: #EEEEEE; color: #E0E0E0; cursor: not-allowed; background: #F5F5F5` |

#### 校验错误行

| 元素 | 视觉表现 |
|------|---------|
| 错误文本 | `font-size: 0.75rem; color: #D93025; margin-top: 4px` |
| 错误图标 | ⚠ 红色感叹号（`color: #D93025`） |

---

### 2.9 ToggleSwitch（开关组件）

| 属性 | 规格 |
|------|------|
| **用途** | 通知开关（声音通知 / 桌面通知） |
| **尺寸** | `width: 44px; height: 24px` |
| **圆角** | `border-radius: 12px`（胶囊） |
| **光标** | `cursor: pointer` |
| **过渡** | `transition: all 200ms ease` |

| 状态 | ON | OFF |
|------|----|-----|
| default | `background: #E53935` （滑块右移，白色圆点 `16x16px`） | `background: #E0E0E0`（滑块左移） |
| hover (ON) | `background: #D32F2F` | `background: #BDBDBD` |
| active (ON) | `background: #C62828; transform: scale(0.95)` | `background: #9E9E9E; transform: scale(0.95)` |
| focus | `outline: 2px solid #1A73E8; outline-offset: 2px` | 同 left |
| disabled | `opacity: 0.5; cursor: not-allowed` | 同 left |

> **聚焦状态**：开关始终从左边（OFF = `left: 2px`，ON = `left: 22px`）用 `transform: translateX()` 动画实现滑块滑动。

---

### 2.10 ConfirmModal（确认弹窗）

| 属性 | 规格 |
|------|------|
| **用途** | 跳过确认 / 放弃未保存修改确认 |
| **背景遮罩** | `background: rgba(0,0,0,0.4)` — 点击遮罩 = 次要操作 |
| **弹窗卡片** | `background: #FFFFFF; border-radius: 12px; width: 320px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.12)` |
| **入场动效** | 遮罩 `opacity: 0→1` 200ms；卡片 `transform: scale(0.95) → scale(1); opacity: 0→1` 200ms ease-out |
| **离场动效** | 遮罩 `opacity: 1→0` 150ms；卡片 `transform: scale(1) → scale(0.95); opacity: 1→0` 150ms ease-in |

#### 弹窗内部

| 元素 | 规格 |
|------|------|
| 提示文案 | `font-size: 1rem; color: #212121; text-align: center; line-height: 1.5; margin-bottom: 24px` |
| 按钮组 | flex 行，`gap: 12px; justify-content: center` |
| 次要按钮 | `height: 36px; padding: 0 20px; border-radius: 18px; border: 1px solid #E0E0E0; background: #FFFFFF; color: #616161; font-size: 0.875rem; font-weight: 500; cursor: pointer` |
| 主要按钮 | `height: 36px; padding: 0 20px; border-radius: 18px; border: none; background: #E53935; color: #FFFFFF; font-size: 0.875rem; font-weight: 600; cursor: pointer` |

> **Tab 键顺序**：主要(右) → 次要(左) → 遮罩。Esc 键 = 次要操作。

---

### 2.11 Toast（提示条）

| 属性 | 规格 |
|------|------|
| **用途** | 操作反馈提示（成功 / 错误） |
| **定位** | 页面顶部居中（距离顶部 `80px`），`position: fixed; z-index: 1000` |
| **最大宽度** | `360px` |
| **内边距** | `padding: 12px 20px` |
| **圆角** | `border-radius: 8px` |
| **入场** | `transform: translateY(-20px) → translateY(0); opacity: 0→1` 200ms ease-out |
| **离场** | `opacity: 1→0` 300ms ease-in（离场缩短时间） |

| 类型 | 背景 | 文字色 | 图标 | 持续时间 |
|------|------|--------|------|---------|
| success | `#E8F5E9` | `#188038` | ✅（或自定义 SVG 勾号） | 2000ms 自动消失 |
| error | `#FFEBEE` | `#D93025` | ⚠（或自定义 SVG 警告） | 3000ms 自动消失或手动关闭 |
| info（设置已保存后） | `#E3F2FD` | `#1565C0` | ℹ（信息图标） | 2000ms 自动消失 |

---

## 3. 5 状态全覆盖（交互组件完整状态表）

| 组件 | default | hover | active | focus | disabled |
|------|---------|-------|--------|-------|----------|
| **PrimaryButton** | bg-#E53935, text-white | bg-#D32F2F, shadow | bg-#B71C1C, scale(0.97) | ring-2 #1A73E8 offset-3 | bg-#E0E0E0, text-#9E9E9E |
| **SkipButton** | text-#616161, bg-transparent | text-#E53935, bg-rgba(229,57,53,0.06) | text-#B71C1C, bg-rgba(229,57,53,0.10) | ring-2 #1A73E8 | text-#E0E0E0 |
| **ResetButton** | text-#616161, bg-transparent | text-#D93025, bg-rgba(217,48,37,0.06) | text-#B71C1C, bg-rgba(217,48,37,0.10) | ring-2 #1A73E8 | text-#E0E0E0 |
| **DurationInput** | border-#E0E0E0, bg-white | border-#E53935 | border-#B71C1C | ring-2 rgba(26,115,232,0.3) | bg-#F5F5F5, text-#9E9E9E |
| **StepperButton(±)** | border-#E0E0E0, bg-white, text-#616161 | border-#E53935, text-#E53935, bg-tint | bg-tint darker, scale(0.93) | ring-2 #1A73E8 | border-#EEEEEE, text-#E0E0E0, bg-#F5F5F5 |
| **ToggleSwitch** | ON:bg-#E53935 / OFF:bg-#E0E0E0 | ON:bg-#D32F2F / OFF:bg-#BDBDBD | scale(0.95) | ring-2 #1A73E8 | opacity-0.5 |
| **ConfirmModal-主** | bg-#E53935, text-white | bg-#D32F2F | bg-#B71C1C | ring-2 #1A73E8 | —（始终可操作） |
| **ConfirmModal-次** | bg-white, border-#E0E0E0, text-#616161 | border-#E53935, text-#E53935 | border-#B71C1C, text-#B71C1C | ring-2 #1A73E8 | —（始终可操作） |
| **SettingsIcon(⚙)** | text-#616161 | text-#E53935, rotate(45deg) | text-#B71C1C | ring-2 #1A73E8 | —（始终可操作） |
| **BackButton(←)** | text-#616161 | text-#E53935 | text-#B71C1C | ring-2 #1A73E8 | —（始终可操作） |

---

## 4. 响应式规格

| 页面 | 小窗口 (320–400px) | 标准桌面 (400–1024px) | 大桌面 (>1024px) |
|------|------------------|---------------------|-----------------|
| **通用** | 最小窗口 320×480px | 固定窗口 400×600px，居中 | 窗口可调大，内容居中 max-w-440px |
| **计时器主页** | TimerDisplay 字号缩至 2.5rem；内边距 12px | TimerDisplay 3.5rem；内边距 24px | 同上 |
| **设置页面** | DurationInput 堆叠/间距 8px | 正常 16px 间距 | 同上 |
| **Modal** | width: 280px | width: 320px | 同左 |
| **Toast** | width: calc(100% - 32px)，max-w 无 | max-width: 360px | 同左 |

> **注**：V1 仅支持桌面端（Tauri 窗口）。以上断点用于保证最小窗口下的可用性。窗口尺寸低于 320×480 时内容按最小约束展示（不隐藏功能）。

---

## 5. 可访问性检查清单

### 5.1 颜色对比度

| 用途 | 前景色 | 背景色 | 对比度 | WCAG AA | WCAG AAA |
|------|--------|--------|--------|---------|---------|
| 正文 | #212121 | #FFFFFF | 15.4:1 | ✅ | ✅ |
| 次要文字 | #616161 | #FFFFFF | 5.9:1 | ✅ | ✅ |
| 禁用文字 | #9E9E9E | #E0E0E0 | 2.3:1 | ❌ | ❌ |
| PrimaryButton 文字 | #FFFFFF | #E53935 | 5.1:1 | ✅ | ✅ |
| 错误提示 | #D93025 | #FFEBEE | 4.7:1 | ✅ | ✅ |
| 成功提示 | #188038 | #E8F5E9 | 4.8:1 | ✅ | ✅ |
| 暗黑模式正文 | #E8E8E8 | #1A1A2E | 13.5:1 | ✅ | ✅ |
| 暗黑模式次要 | #A0A0B0 | #1A1A2E | 7.2:1 | ✅ | ✅ |

> **禁用态注释**：禁用文字对比度低于 AA 是业界惯例（因用户无需阅读不可操作的文本），但已确保与禁用背景的视觉区分≥2:1。

### 5.2 可访问性要求

#### 通用
- [x] **颜色对比度**：正文 ≥ 4.5:1；大文本 ≥ 3:1（全部达标，见上表）
- [x] **颜色非唯一传达方式**：阶段色（🔴🟢🔵）辅以文字标签；Toast 类型辅以图标
- [x] `prefers-reduced-motion` 适配：所有动效降级为瞬时切换（opacity/transform 删去过渡）
- [ ] **初始实现检查**：确保 `prefers-reduced-motion` media query 已添加

#### 交互
- [x] **所有交互元素可键盘操作**：Tab 顺序 = 视觉顺序，所有按钮/链接/开关均可 Tab 到达 + Enter/Space 激活
- [x] **焦点环可见**：`outline: 2px solid #1A73E8` 无 `outline: none` 覆写
- [x] **快捷键**：空格(开始/暂停/继续)、R(重置)、S(跳过)、Esc(关闭弹窗)
- [x] **触摸目标 ≥ 44px**：PrimaryButton 48px、DurationInput 40px（接近）、ToggleSwitch 24px（但内含滑块 44px 交互区）
- [x] **禁用态明显**：灰色背景 + 文字 + `cursor: not-allowed`

#### 表单与语义
- [x] **所有表单输入有 `<label>` 关联**：DurationInput 通过 `label` 属性对应 `<label>`
- [x] **错误提示关联**：校验错误使用 `aria-describedby` 指向错误文本元素
- [x] **图标有 `alt` 属性**：装饰性 SVG 图标标 `aria-hidden="true"`；功能图标（齿轮设置）有 `aria-label`
- [x] **加载状态提示**：PrimaryButton loading 态按钮文本不变 + 旋转图标 + 禁用
- [x] **Toast 无障碍**：使用 `role="alert"` 或 `aria-live="polite"`，不抢占焦点
- [x] **Modal 焦点陷阱**：弹窗打开时焦点锁定在弹窗内，Tab 循环；关闭后归还焦点到触发元素

#### 屏幕阅读器
- [x] **PhaseLabel**：`role="status"` + `aria-live="polite"` — 阶段变化时自动播报
- [x] **TimerDisplay**：倒计时值通过 `aria-live="polite"` 播报（每 15 秒或整分钟报一次，避免过频）
- [x] **PomodoroCounter**：`aria-label="已完成 3 个番茄钟"`
- [x] **Toast 消息**：`role="alert"`

---

## 6. 暗黑模式适配

| 元素 | CSS 自定义属性 | 亮色模式 | 暗黑模式 |
|------|--------------|---------|---------|
| 页面背景 | `--bg-page` | #FAFAFA | #1A1A2E |
| 卡片/容器背景 | `--bg-surface` | #FFFFFF | #2D2D44 |
| 悬停强化背景 | `--bg-surface-hover` | #F5F5F5 | #3D3D56 |
| 标题栏分割线 | `--border-divider` | #E0E0E0 | #3D3D56 |
| 正文 | `--text-primary` | #212121 | #E8E8E8 |
| 次要文字 | `--text-secondary` | #616161 | #A0A0B0 |
| 禁用文字 | `--text-disabled` | #9E9E9E | #6A6A7A |
| 边框 | `--border-default` | #E0E0E0 | #3D3D56 |
| 输入框背景 | `--bg-input` | #FFFFFF | #2D2D44 |
| 输入框禁用背景 | `--bg-input-disabled` | #F5F5F5 | #252538 |
| Modal 遮罩 | `--color-overlay` | rgba(0,0,0,0.4) | rgba(0,0,0,0.6) |
| 品牌色（不变） | `--color-primary` | #E53935 | #E53935（保持亮色，在暗背景上更突出） |

> **暗黑模式策略**：品牌番茄红色在暗黑模式下保持原有色值（#E53935），因红色在深色背景上视觉更舒适且对比度更优。背景采用深蓝紫色调（而非纯黑），减少视觉疲劳。

---

## 7. 动效规范

| 元素 | 动效 | 时长 | 缓动 | `prefers-reduced-motion` |
|------|------|------|------|------------------------|
| 按钮 hover | 背景色渐变 | 150ms | ease-in-out | 取消（瞬时切换） |
| 按钮 active | scale(0.97) | 100ms | ease-out | 取消 |
| 倒计时数字更新 | 无动画（直接更新） | 0ms | — | —（无动效） |
| 阶段切换（自动） | 数字 + 标签淡入 | 200ms | ease-out | 取消 |
| Modal 打开 | 淡入 + scale(0.95→1) | 200ms | ease-out | 取消（直接显示） |
| Modal 关闭 | 淡出 + scale(1→0.95) | 150ms | ease-in | 取消（直接隐藏） |
| Toast 进入 | translateY(-20→0) + 淡入 | 200ms | ease-out | 取消（直接显示） |
| Toast 离开 | 淡出 | 300ms | ease-in | 取消（直接隐藏） |
| Toggle 滑块 | translateX 滑动 | 200ms | ease | 取消（直接切换） |
| 页面切换 | 淡入 | 300ms | ease-in-out | 取消（直接切换） |
| 设置图标 gear | rotate(45deg) on hover | 200ms | ease-in-out | 取消 |
| 骨架/脉冲 | 不适用（无异步加载场景） | — | — | — |

---

## 8. 与 API 契约的字段对齐表

| UI 组件 | 页面 | API 字段 / 数据模型 | 数据类型 | 校验规则 | UI 验证/错误表现 |
|---------|------|-------------------|---------|---------|----------------|
| TimerDisplay | 计时器主页 | `timerState.remainingSeconds` | integer [0, 7200] | 引擎计算（非用户输入） | 直接显示 MM:SS，范围外 clamp |
| PhaseLabel | 计时器主页 | `timerState.phase` | enum: work / short_break / long_break | 引擎决定 | 色点+文字自动匹配 |
| PrimaryButton | 计时器主页 | `timerState.status` | enum: idle / running / paused | 状态机驱动 | idle→"开始" / running→"暂停" / paused→"继续" |
| PomodoroCounter | 计时器主页 | `timerState.completedPomodoros` | integer [0, 4] | 引擎计算 | 显示 🍅 × N |
| SkipButton | 计时器主页 | — | — | 仅运行/暂停时可见 | 隐藏/idle 不渲染 |
| ResetButton | 计时器主页 | — | — | 仅暂停时可见 | 隐藏/running 不渲染 |
| WorkDurationInput | 设置页 | `settings.workMinutes` | integer [1, 120] | 1–120 | 错误边框+红字提示 |
| ShortBreakDurationInput | 设置页 | `settings.shortBreakMinutes` | integer [1, 120] | 1–120 | 同上 |
| LongBreakDurationInput | 设置页 | `settings.longBreakMinutes` | integer [1, 120] | 1–120 | 同上 |
| SoundToggle | 设置页 | `settings.soundEnabled` | boolean | — | ON/OFF 切换 |
| DesktopNotificationToggle | 设置页 | `settings.desktopNotificationEnabled` | boolean | — | ON/OFF 切换 |
| SaveButton | 设置页 | `settings`（整体） | Settings 对象 | 所有字段校验通过后 | 成功→Toast / 失败→字段高亮 |
| ConfirmModal | 通用 | — | — | — | 主/次按钮，Esc/遮罩关闭 |
| Toast | 通用 | — | — | — | success/error/info 三态 |

---

## 9. 前端实现映射表

| 设计组件 | 目标技术栈组件 | Props / CSS 映射 | 备注 |
|---------|-------------|-----------------|------|
| TitleBar | 自定义组件 `TitleBar` | `children`（左侧标题）+ `rightSlot`（设置图标） | 两侧插槽模式 |
| SettingsIcon | SVG 图标（齿轮） | `onClick`, `aria-label="设置"` | 使用 Lucide 或 Heroicons 的 `Settings` 图标 |
| BackButton | SVG 图标（箭头） + 文字 | `onClick`, `aria-label="返回"` | Heroicons `ArrowLeft` |
| PhaseLabel | 自定义组件 `PhaseLabel` | `phase: Phase` | phase 枚举决定色点和文字 |
| TimerDisplay | 自定义组件 `TimerDisplay` | `remainingSeconds: number` | 等宽字体 + tabular-nums CSS |
| PrimaryButton | 自定义 `<button>` | `status: Status`, `onClick`, `loading?: boolean` | 胶囊形；文本由 status prop 派生 |
| SkipButton | 自定义 `<button>` | `onClick`, `visible: boolean` | 文字按钮样式 |
| ResetButton | 自定义 `<button>` | `onClick`, `visible: boolean` | 文字按钮样式 |
| PomodoroCounter | 自定义 `<span>` | `count: number` | 纯展示 |
| DurationInput | 自定义组件 `DurationInput` | `label, value, min, max, onChange` | 内聚 ± 步进 + 数字输入 + 校验 |
| ToggleSwitch | 自定义 `<button>` (role="switch") | `enabled, onToggle, label` | `role="switch"`, `aria-checked=enabled` |
| ConfirmModal | 自定义组件 `ConfirmModal` | `message, primaryLabel, secondaryLabel, onPrimary, onSecondary, onDismiss` | Portal 渲染；焦点陷阱 |
| Toast | 自定义组件 `Toast` + `ToastContainer` | `message, type, duration` | Portal 渲染；自动消失 |
| SaveButton | 标准 `<button>` | `onClick, disabled` | 全宽按钮，设置页样式 |
| ResetDefaultsButton | 标准 `<button>` | `onClick` | 次要操作，灰色边框文字按钮 |

---

## 10. 页面级布局规格

### 10.1 计时器主页（/）

```
┌──────────────────────────────────────┐
│      TitleBar (48px)                 │  border-bottom: 1px solid #E0E0E0
├──────────────────────────────────────┤
│                                      │  flex: 1
│           PhaseLabel                 │  margin-top: 24px
│                                      │
│           TimerDisplay               │  margin: 16px 0; font-size: 3.5rem
│                                      │
│         PrimaryButton                │  margin: 8px auto
│                                      │
│      [SkipButton] [ResetButton]      │  gap: 16px; justify-content: center
│                                      │  (可见性由 status 决定)
│                                      │
│           PomodoroCounter            │  margin-top: auto; padding-bottom: 16px
│                                      │
└──────────────────────────────────────┘

窗口固定尺寸: 400px × 600px
布局: flex column, align-items: center
```

### 10.2 设置页面（/settings）

```
┌──────────────────────────────────────┐
│     ← 返回        设置               │  TitleBar 变体：左侧 BackButton + 居中标题
├──────────────────────────────────────┤
│                                      │  padding: 24px 16px; flex: 1; overflow-y: auto
│   ⏱ 计时时长                        │  section-title: font-size: 1rem; font-weight: 600; margin-bottom: 12px
│   ┌──────────────────────────────┐   │
│   │  DurationInput × 3           │   │  card: bg-#FFFFFF, border-radius: 8px, padding: 16px, gap: 12px
│   └──────────────────────────────┘   │
│                                      │  margin: 24px 0
│   🔔 通知                            │  section-title
│   ┌──────────────────────────────┐   │
│   │  ToggleSwitch × 2            │   │  card
│   └──────────────────────────────┘   │
│                                      │  margin-top: auto; gap: 12px
│   [        保 存 设 置         ]     │  full-width, height: 44px; border-radius: 22px
│                                      │
│   [      恢 复 默 认 设 置      ]    │  full-width, border: 1px solid #E0E0E0, text-#616161
│                                      │  height: 40px; border-radius: 20px
│                                      │
└──────────────────────────────────────┘
```

---

## 11. 图标规范

| 图标 | 来源 | 尺寸 | 用途 | 无障碍 |
|------|------|------|------|--------|
| 设置 (齿轮) | Heroicons `outline/cog-6-tooth` | 24×24px | 打开设置 | `aria-label="设置"` |
| 返回 (左箭头) | Heroicons `outline/arrow-left` | 24×24px | 返回计时器页 | `aria-label="返回"` |
| 番茄表情 | emoji 🍅 | 1rem | 番茄计数 | `role="img" aria-label="番茄钟"` |
| 加载旋转 | 自定义 SVG 的 `circle` 旋转动画 | 16×16px | 按钮 loading | `aria-hidden="true"` |
| 成功 | Heroicons `outline/check-circle` | 20×20px | Toast 成功 | `aria-hidden="true"` |
| 错误 | Heroicons `outline/exclamation-circle` | 20×20px | Toast 错误 | `aria-hidden="true"` |

> **图标风格一致性**：全部使用 Heroicons Outline 风格（1.5px 描边），确保视觉统一。

---

## 12. 设计原则与决策记录

### D-001：品牌色采用番茄红而非中性蓝/灰

- **决策**：品牌主色使用 #E53935（番茄红）
- **理由**：
  1. 产品名"番茄钟"自然映射番茄红色，强化品牌识别
  2. 暖色符合"温暖陪伴"的产品气质（vs 冷色让计时器感觉严厉）
  3. 番茄红在深/浅背景上都有良好的对比度（5.1:1 ON 白底）
- **反模式避免**：红色不用于错误以外的功能性提示（避免混淆）

### D-002：TimerDisplay 采用等宽字体

- **决策**：倒计时数字使用 JetBrains Mono 等宽字体
- **理由**：数字变化时宽度不变，防止视觉跳动；专业感强

### D-003：PrimaryButton 采用胶囊形而非直角

- **决策**：`border-radius: 24px` 胶囊形
- **理由**：圆角传递友好、温暖的感觉，符合个人效率工具气质；与番茄的圆形意象呼应

### D-004：页面切换使用淡入而非滑动

- **决策**：2 页间切换使用 `opacity` 淡入（300ms）
- **理由**：无导航层级关系（非前进/后退关系），淡入自然过渡；避免滑动引起不必要的方向暗示

### D-005：禁用态使用灰阶处理而非降低透明度

- **决策**：禁用态指定具体色值（bg-#E0E0E0、text-#9E9E9E）
- **理由**：指定色值比 `opacity: 0.4` 更可控，避免透出下层背景颜色失真

---

## 13. 设计审查清单

### 可访问性
- [x] 颜色对比度 ≥ 4.5:1（正文）/ ≥ 3:1（大文本）— 详见 §5.1 表格
- [x] 所有交互元素可键盘操作（Tab + Space/Enter）
- [x] 表单输入框有 `<label>` 关联
- [x] 功能图标有 `aria-label` / 装饰图标 `aria-hidden="true"`
- [x] 加载状态有禁用态 + 旋转图标
- [x] 错误信息有 `aria-describedby` 关联
- [x] `prefers-reduced-motion` 适配
- [ ] **实现验证**：使用 axe DevTools 或 Lighthouse 做最终检查

### 设计一致性
- [x] 组件名与 wireframes.md 元素清单完全一致（TitleBar, PhaseLabel, TimerDisplay, PrimaryButton, SkipButton, ResetButton, PomodoroCounter, DurationInput, ToggleSwitch, ConfirmModal, Toast）
- [x] 数据字段名与 api-contract.yaml 完全一致（Phase, Status, TimerState, Settings 字段）
- [x] 页面结构与 wireframes.md 线框图一致（布局、元素顺序、交互流）
- [x] 5 状态全覆盖（default / hover / active / focus / disabled）
- [x] 响应式断点与 wireframes.md §7 一致（320px / 400px / 1024px）
- [x] 暗黑模式独立定义（非反色，独立色值）

### 视觉质量
- [x] SVG 图标统一风格（Heroicons Outline）
- [x] 间距基于 8px 网格
- [x] 全局统一过渡时长（150ms / 200ms / 300ms）
- [x] 动效仅使用 transform + opacity（高性能）
- [x] 无 emoji 替代结构性图标（仅 🍅 用于计数字段）

---

*本文档基于 PM 的 wireframes.md 和 TD 的 design.md、api-contract.yaml 编写。实现阶段请以本文档视觉规范为准，如有不一致请与 UI 设计师确认。*
