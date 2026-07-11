# T-005 实现笔记：自定义 Hooks

## 修改文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/hooks/useTimer.ts` | 新增 + 修复 | tick 循环管理（250ms 间隔），自动 TIMER_COMPLETE + 通知触发；修复缺失的 `TimerStore` 类型导入 |
| `src/hooks/useNotification.ts` | 新增 + 修复 | 封装 notifyPhaseEnd，从 settingsStore 读取通知偏好；修复缺失的 `SettingsStore` 类型导入 |
| `src/hooks/useKeyboard.ts` | 新增 + 修复 | 空格/R/S/Esc 快捷键映射到 timerStore action；修复缺失的 `TimerStore` 类型导入 |
| `src/__tests__/hooks/useTimer.test.tsx` | 新增 | 11 个测试用例，覆盖 tick 循环、归零切换、清理、phase 变更 |
| `src/__tests__/hooks/useNotification.test.tsx` | 新增 | 7 个测试用例，覆盖通知触发、soundEnabled 切换、无 settingsStore |
| `src/__tests__/hooks/useKeyboard.test.tsx` | 新增 | 14 个测试用例，覆盖空格/R/S/Esc、修饰键、输入框过滤、清理 |

## 接口对照

### useTimer
- 入参：`UseTimerDeps { timerStore, onPhaseChange? }`
- 返回：`TimerStore`
- 职责：tick 循环 + 归零检测 + phase 变更回调

### useNotification
- 入参：`settingsStore?`（可选，防御性设计）
- 返回：`{ notifyPhaseEnd: (phase: Phase) => Promise<void> }`
- 职责：读取通知偏好 → 调用 engine/notification.notifyPhaseEnd

### useKeyboard
- 入参：`timerStore: TimerStore`
- 返回：`void`
- 快捷键映射：
  - 空格 → start/pause/resume
  - R → reset（仅 paused）
  - S → skip
  - Esc → cancelSkip
  - 忽略修饰键组合（Ctrl/Alt/Meta + 其他）
  - 忽略输入框内的按键

## 自测结果

- `npx vitest run src/__tests__/hooks/` — **32/32 通过**
- `npx tsc --noEmit --skipLibCheck` — **hooks 相关文件 0 类型错误**
- 空格键在 idle/running/paused 三种状态分别触发对应 action ✅
- R 键在 idle/running 状态被忽略，仅 paused 触发 reset ✅
- S 键在 idle 状态被忽略，running/paused 触发 skip ✅
- Esc 键始终调用 cancelSkip ✅
- 修饰键组合（Ctrl+Space、Alt+S、Cmd+R）被正确忽略 ✅
- 输入框内按键不拦截 ✅
- 组件卸载时清理 interval 和事件监听器 ✅
- soundEnabled=false 时不播放声音但桌面通知仍可工作 ✅
- 无 settingsStore 时不抛异常 ✅

## 已知限制

1. useKeyboard 使用 `window.addEventListener`，应用失焦时可能收不到事件（V1 可接受，后续 T-008 托盘集成时可用 Tauri 全局快捷键补充）
2. useTimer 的 `onPhaseChange` 回调在测试环境中无法直接断言（因为 tick 循环在 fake timers 下行为受限），但核心 tick 逻辑已通过集成测试验证
3. notification 模块在 jsdom 环境中 Web Audio API 和 Tauri 插件均被 try-catch 包裹，不会报错
