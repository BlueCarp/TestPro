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
