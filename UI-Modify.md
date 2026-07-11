# UI-Modify.md — 视觉设计交付报告

> **版本**: 1.0.0
> **设计者**: UID-UI设计师
> **日期**: 2026-07-11
> **基于**: specs/wireframes.md（PM）, specs/design.md（TD）, specs/api-contract.yaml

---

## 交付清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `Design-Token.pen` | 设计令牌 + 组件规范（色彩/字体/间距/圆角/阴影/动效） | ✅ 新建 |
| `PageUI-Design.pen` | 页面级 UI 设计（计时器主页 7 状态 + 设置页 3 状态） | ✅ 新建 |
| `specs/ui-design.md` | 完整视觉设计规范文档 | ✅ 已存在 |
| `specs/mockups/timer-*.html` | HTML 效果预览（idle / running / paused / short_break / long_break） | ✅ 已存在 |
| `specs/mockups/settings-*.html` | HTML 效果预览（default / validation_error） | ✅ 已存在 |
| `specs/mockups/modal-confirm.html` | HTML 确认弹窗效果预览 | ✅ 已存在 |

---

## 本次设计涵盖内容

### ✅ 设计令牌（Design Tokens）
- 品牌色（番茄红系 #E53935 主色）、阶段色、中性色、功能色
- 暗黑模式独立色值映射（深蓝紫底 #1A1A2E）
- 字体体系（Inter + JetBrains Mono）、字号缩放（Major Third 1.25）
- 8px 网格间距体系、圆角、阴影、过渡动效

### ✅ 组件规范（覆盖 5 种交互状态）
- TitleBar / PhaseLabel / TimerDisplay / PrimaryButton / SkipButton
- ResetButton / PomodoroCounter / DurationInput / ToggleSwitch
- ConfirmModal / Toast
- 所有交互组件覆盖：default / hover / active / focus-visible / disabled

### ✅ 页面设计
- 计时器主页：7 个 UI 状态全覆盖（idle / running_work / paused_work / running_short_break / paused_short_break / running_long_break / paused_long_break）
- 设置页面：3 个状态（default / validation_error / saved）
- HTML 高保真 Mockup：8 个预览文件

### ✅ 可访问性（WCAG AA）
- 颜色对比度 ≥ 4.5:1（正文）/ ≥ 3:1（大文本）
- 焦点环（outline: 2px solid #1A73E8）
- 键盘导航 + 快捷键（Space/R/S/Esc）
- prefers-reduced-motion 适配
- aria-label / aria-live / role 无障碍属性

### ✅ 暗黑模式
- 深蓝紫背景 #1A1A2E 独立色值映射，非反色处理
- 品牌红保持亮色在暗背景突出

### ✅ 字段对齐
- 组件名与 wireframes.md 元素清单完全一致
- 数据字段名与 api-contract.yaml 完全一致
- Token 名与 design.md 技术方案对齐

---

## 变更说明

此次为 Phase 1 首次视觉设计交付。基于 PM 的线框图（wireframes.md）和 TD 的技术设计（design.md、api-contract.yaml），从零建立番茄钟计时器的完整视觉体系。

**设计方向**：暖色番茄红 + 中性灰，营造干净、专注、温暖的产品气质。胶囊形按钮传递友好感，等宽计时数字强调专业感，阶段三重编码（色点+文字+发光）确保时刻清晰。
