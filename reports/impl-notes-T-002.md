# T-002 实现报告：类型定义、工具函数与通用组件

## 文件清单

| 文件 | 说明 |
|------|------|
| `src/types/timer.ts` | 计时器核心类型：Phase, Status, TimerState, TimerAction, TimerEngine, TickResult, StateTransitionError |
| `src/types/settings.ts` | 设置类型：DurationConfig, NotificationConfig, Settings, SettingsValidationError + DEFAULT_SETTINGS |
| `src/utils/formatTime.ts` | `formatTime(seconds)` → MM:SS 格式字符串 |
| `src/utils/validation.ts` | `validateDuration(value, field)` → SettingsValidationError \| null |
| `src/components/common/TitleBar.tsx` | 标题栏（应用名 🍅 Pomodoro + ⚙ 设置图标按钮） |
| `src/components/common/ConfirmModal.tsx` | 通用确认弹窗（Portal 渲染、Escape 关闭、遮罩点击关闭、主/次按钮） |
| `src/components/common/Toast.tsx` | 单条 Toast（success/error 类型、自动消失、定时器清理） |
| `src/components/common/ToastContainer.tsx` | Toast 容器（Portal 渲染到 document.body、多条 Toast 管理） |

## 接口对照表

### 类型定义

| api-contract.yaml schema | TypeScript 类型 | 状态 |
|-------------------------|-----------------|------|
| Phase | `type Phase = "work" \| "short_break" \| "long_break"` | ✅ |
| Status | `type Status = "idle" \| "running" \| "paused"` | ✅ |
| TimerState | `interface TimerState` (6 字段) | ✅ |
| TimerAction | `interface TimerAction { type: TimerActionType }` | ✅ |
| DurationConfig | `interface DurationConfig` (3 字段) | ✅ |
| NotificationConfig | `interface NotificationConfig` (2 字段) | ✅ |
| Settings | `interface Settings extends DurationConfig, NotificationConfig` | ✅ |
| SettingsValidationError | `interface SettingsValidationError` (2 字段) | ✅ |

### 工具函数

| 函数 | 签名 | 测试覆盖 |
|------|------|---------|
| formatTime | `(seconds: number) => string` | 14 用例：happy path 10 + edge cases 2 + sad path 2 |
| validateDuration | `(value: number, field: string) => SettingsValidationError \| null` | 17 用例：happy path 4 + edge cases 2 + sad path 6 + field-specific 4 + error shape 1 |

### 通用组件

| 组件 | Props | 测试覆盖 |
|------|-------|---------|
| TitleBar | `onSettingsClick?: () => void` | — |
| ConfirmModal | `message, primaryLabel, secondaryLabel, onPrimary, onSecondary, onDismiss` | 6 用例 |
| Toast | `message, type, duration?, onDismiss?` | 6 用例 |
| ToastContainer | `toasts: ToastItem[], onRemove?` | 5 用例 |

## 自测结果

- **单元测试**：52/52 通过（5 个测试文件）
- **类型检查**：0 错误（T-002 文件范围）
- **工具函数覆盖率**：formatTime + validation > 90%

## 设计决策

1. **类型使用 `type`/`interface` 而非 `enum`**：与 Zustand 序列化兼容，符合 api-contract.yaml 设计
2. **formatTime 防御性编程**：NaN/undefined/负值统一返回 `"00:00"`
3. **validateDuration 严格校验**：NaN、浮点数、非整数均返回错误
4. **ConfirmModal 使用 Portal**：渲染到 `document.body` 避免 z-index 层级问题
5. **Toast 自动消失使用 `useRef` 管理定时器**：组件卸载时清理，防止内存泄漏
6. **DEFAULT_SETTINGS 常量导出**：供 settingsStore 回退使用

## 已知限制

- TitleBar 无单元测试（基础展示组件，交互仅按钮点击）
- 无视觉回归测试（V1 手动验证）
