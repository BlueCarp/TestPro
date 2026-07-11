# UI-Modify.md — 视觉设计交付报告

> **设计者**: UID-UI设计师
> **日期**: 2026-07-11
> **基于**: specs/prd.md, specs/wireframes.md

---

## 交付清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `Design-Token.pen` | 设计令牌变量（色彩/字体/间距/圆角） | ✅ 新建 |
| `PageUI-Design.pen` | 高保真页面设计（2 页面 × 7 状态 + 组件） | ✅ 新建 |

---

## 本次设计涵盖内容

### 设计令牌（Design-Token.pen）

| 类别 | 变量 |
|------|------|
| 品牌色 | `color-primary` #E53935, `color-primary-dark` #C62828, `color-primary-light` #EF5350 |
| 文字 | `color-text-primary` #212121, `color-text-secondary` #757575, `color-text-on-primary` #FFFFFF |
| 界面色 | `color-border` #E0E0E0, `color-background` #FAFAFA, `color-surface` #FFFFFF |
| 阶段色 | `color-success` #43A047（短休息绿）, `color-info` #1E88E5（长休息蓝） |
| 字体 | `font-ui` Inter, `font-mono` JetBrains Mono |
| 间距 | 8px 网格：xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48 |
| 圆角 | sm=4, md=8, lg=16, full=capsule |

### 页面设计（PageUI-Design.pen）

**计时器主页** — 5 个状态：
- `idle`: 25:00 / 工 作（红点） / 开 始（红按钮） / 🍅×0
- `running_work`: 23:45 / 暂 停 + 跳 过 链接 / 🍅×0
- `paused_work`: 18:32 / 继 续 + 重 置 · 跳 过 / 🍅×2
- `running_short_break`: 4:15 / 短 休 息（绿点 #43A047） / 暂 停（绿） / 🍅×1
- `running_long_break`: 11:22 / 长 休 息（蓝点 #1E88E5） / 暂 停（蓝） / 🍅×4

**设置页面**：
- 返回 + 设置标题
- 时长调节（工作时间/短休息/长休息，各带 −/+ 步进）
- 通知开关（声音通知/桌面通知，toggle ON）
- 保存设置（红胶囊）+ 恢复默认（描边）

**共享组件**：
- `ConfirmModal`：320px 居中弹窗，取消（描边）+ 确定（红）
- `Toast - Success`：绿色底 #43A047，"设置已保存"
- `Toast - Error`：红色底 #E53935，校验错误提示

### 视觉规格

- 窗口：400×600px，圆角 16px，外层阴影
- 标题栏：48px，Pomodoro 标题 + 齿轮图标
- 计时器：JetBrains Mono 56px/700，letter-spacing 4
- 主按钮：200×48 胶囊，颜色随阶段变化，带同色阴影
- 文字链接：Inter 14px/500，#757575
- 色点：10px 圆，颜色对应阶段

### 字段对齐

- 组件名与 wireframes.md 元素清单一致
- 数据字段与 PRD 定义一致

---

## 变更说明

首次视觉设计交付。基于 PM 线框图（wireframes.md）建立番茄钟计时器的完整视觉体系。设计方向：暖色番茄红 + 干净中性灰，胶囊按钮传递友好感，等宽计时数字强调专业感，阶段三重编码（色点+文字+按钮色）确保时刻清晰。

---

## V1.0.1 更新 — 2026-07-11

### 变更内容

| 变更 | 说明 |
|------|------|
| 图标全部改用 SVG | 替换所有 emoji 图标为自定义 SVG 组件：齿轮、番茄、时钟、铃铛、对勾、警告三角、左箭头 |
| 中文字体改为 Noto Sans SC | `font-ui` 变量从 Inter 改为 Noto Sans SC（中文字体优化），等宽字体 JetBrains Mono 不变 |

### 影响文件

- `Design-Token.pen` — `font-sans` 变量改为 "Noto Sans SC"；文档说明更新
- `PageUI-Design.pen` — 所有 emoji 替换为 SVG 图标引用，文字节点自动继承 `$font-ui`（Noto Sans SC）
- `specs/ui-design.md` — 字体规范和图标规范更新

## V1.0.2 更新 — 2026-07-11

### 变更内容

| 变更 | 说明 |
|------|------|
| 图标改用 Heroicons SVG | 所有自定义 SVG 图标替换为 Heroicons Outline 标准路径（通过 `better-icons` 技能获取） |
| PageUI 字体 Noto Sans SC 修复 | PageUI-Design.pen 的 `font-ui` 变量更新为 "Noto Sans SC"（之前只更新了 Design-Token.pen） |
| 应用 Logo | 使用 Agnes MCP 生成番茄钟 logo 图（SVG 版本回落 + 远程 AI 生成图） |

### 图标明细

| 图标 | Heroicons ID | 说明 |
|------|-------------|------|
| 齿轮 | `heroicons:cog-6-tooth` | 标题栏设置按钮 |
| 左箭头 | `heroicons:arrow-left` | 设置页返回按钮 |
| 时钟 | `heroicons:clock` | 计时时长分组标题 |
| 铃铛 | `heroicons:bell` | 通知分组标题 |
| 对勾 | `heroicons:check-circle` | Toast 成功 |
| 警告 | `heroicons:exclamation-triangle` | Toast 错误 |
| 减 | `heroicons:minus` | 步进器减少 |
| 加 | `heroicons:plus` | 步进器增加 |

### Logo 文件

- `specs/mockups/logo.svg` — 手工 SVG 版（番茄 + 时钟指针，可直接用做应用图标）
- `specs/mockups/logo.png` — **Agnes AI 生成版（主 logo）**：番茄红主体 + 白色嵌入式钟面（指针 10:10）+ 绿叶 + 光泽高光，iOS 风格圆角方形白底
- `specs/mockups/logo-v1.png` — Agnes AI 生成版（备选）：相似设计，指针指向 2 点和 12 点方向

### 影响文件

- `Design-Token.pen` — 无变化（已在 V1.0.1 更新）
- `PageUI-Design.pen` — 所有图标替换为 Heroicons SVG 组件；`font-ui` 变量改为 "Noto Sans SC"
- `specs/ui-design.md` — 图标规范更新为 Heroicons 对照表
- `specs/mockups/logo.svg` — 新建，应用 logo
