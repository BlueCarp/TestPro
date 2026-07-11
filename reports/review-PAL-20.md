# PAL-20 审查报告 — Phase 4 全流程实现验收 & Phase 5 遗留验证

**审查员**: CR-代码审查员 (2e485b24-5594-43a0-a94e-fc5c7eb3e4a9)
**审查日期**: 2026-07-12
**审查范围**: T-001 ~ T-008 全部实现代码（51 文件，~6286 行新增）

---

## 一、总体评估

Phase 4 实现了番茄钟计时器 V1.0 的完整功能栈：类型定义 → 工具函数 → 状态机 → 计时引擎 → Zustand Store → 自定义 Hooks → UI 组件 → 设置页面 → 系统托盘。整体架构清晰，分层合理（UI → Store → Engine → Platform），符合 design.md 第 3.3 节模块依赖图。

**但是**，测试存在 17 个失败用例（283 个测试中），且有两个 P0 级别的逻辑错误需要修复。

---

## 二、需求符合性检查

### 2.1 PRD 功能需求覆盖

| FR | 需求 | 实现状态 | 说明 |
|----|------|---------|------|
| FR-01 | 工作计时器 | ✅ | TimerDisplay + timerEngine 基于系统时钟 |
| FR-02 | 工作→休息自动切换 | ✅ | stateMachine.handleTimerComplete 正确实现 |
| FR-03 | 长休息判定 | ✅ | completedPomodoros === 3 → long_break |
| FR-04 | 暂停/继续 | ✅ | engine.pause/resume 冻结/恢复逻辑正确 |
| FR-05 | 重置计时器 | ✅ | ResetButton + stateMachine.RESET 处理 |
| FR-06 | 跳过当前阶段 | ✅ | SkipButton + ConfirmModal + confirmSkip |
| FR-07 | 时长设置 | ✅ | SettingsPage + DurationInput + validation |
| FR-08 | 通知提醒 | ✅ | notification.ts + useNotification Hook |
| FR-09 | 番茄钟计数 | ✅ | PomodoroCounter + stateMachine 计数生命周期 |
| FR-10 | 通知开关 | ✅ | ToggleSwitch + settingsStore toggle |

### 2.2 PRD 验收标准

| AC | 标准 | 状态 | 说明 |
|----|------|------|------|
| AC-01 | 工作计时器 | ✅ | idle → running，25:00 递减 |
| AC-02 | 自动切换 | ✅ | tick expired → TIMER_COMPLETE → 通知 |
| AC-03 | 长休息判定 | ✅ | count=3 → long_break |
| AC-04 | 暂停/继续 | ✅ | 冻结/恢复逻辑正确 |
| AC-05 | 重置 | ⚠️ | P1：reset 仅 paused 状态可用，running 状态不能重置（design.md 转换表未覆盖 running→idle 的 RESET） |
| AC-06 | 跳过 | ✅ | ConfirmModal 确认流程完整 |
| AC-07 | 时长设置 | ✅ | validation + 错误高亮 |
| AC-08 | 通知提醒 | ✅ | try-catch 包裹，静默降级 |
| AC-09 | 番茄钟计数 | ✅ | 0→1→2→3→4→0 生命周期 |
| AC-10 | 通知开关 | ✅ | soundEnabled/desktopNotificationEnabled 独立控制 |

---

## 三、问题清单

### 🔴 P0 — 必须修复

#### P0-1: TimerDisplay 使用 `<span>` 而非语义化元素，无障碍性不足

- **位置**: `src/components/timer/TimerDisplay.tsx:23`
- **描述**: 倒计时显示使用 `<span>` 元素，虽然有 `role="status"` 和 `aria-live="polite"`，但大字体数字展示使用 `<span>` 语义不够明确。更重要的是，`aria-live="polite"` 在屏幕阅读器中会在每次 tick（250ms）时触发朗读，造成严重的用户体验问题——用户每 250ms 听到数字变化。
- **建议**: 使用 `aria-live="assertive"` 配合防抖（throttle），或将 `aria-live` 改为只在状态变化时触发。更好的方案是使用 `aria-atomic="false"` 并仅对数字部分应用 live region。
- **参考**: WCAG 2.1 Live Regions 指南；design.md 第 11 节测试策略

#### P0-2: 测试失败 — DurationInput 和 ToggleSwitch 组件测试全部失败

- **位置**: `src/__tests__/components/DurationInput.test.tsx`, `src/__tests__/components/ToggleSwitch.test.tsx`
- **描述**: 17 个测试失败全部集中在这两个文件。根本原因是：
  1. **DurationInput**: 测试期望 `min`/`max` prop 控制按钮禁用逻辑（测试文件传入了 `min: 1, max: 120`），但组件实现中 DurationInput 的 Props 接口不包含 `min`/`max` prop（只有 `fieldName`），且按钮没有禁用逻辑——始终可点击。测试期望 `-` 按钮在 `value=1` 时被 `disabled`，但组件从未设置 `disabled`。
  2. **ToggleSwitch**: 测试使用 `enabled` prop 和 `onToggle` 回调（测试文件导入的是 `ToggleSwitch` 组件，传 `enabled`/`onToggle`），但组件实际 Props 接口是 `checked`/`onChange`/`label`/`disabled`，**prop 名称不匹配**。测试传入 `enabled={true}` 和 `onToggle={fn}`，组件期望 `checked` 和 `onChange`，导致回调永远不会被调用。
- **建议**:
  1. DurationInput: 要么补充 `min`/`max` prop 和按钮禁用逻辑，要么修改测试匹配组件实际行为。
  2. ToggleSwitch: 测试文件传 `enabled`/`onToggle`，组件用 `checked`/`onChange`。**二选一修正**。推荐统一测试和组件的 prop 命名。
- **参考**: T-007 验收标准 2/3；T-002 验收标准 4/5

---

### 🟡 P1 — 应该修复

#### P1-1: timerStore.reset() 仅支持 paused 状态，缺少 running 状态的重置

- **位置**: `src/stores/timerStore.ts:123-133`
- **描述**: `reset()` 方法中 `if (s.status !== "paused") return;` 限制了只能在 paused 状态重置。但 PRD AC-05 描述的是"可随时将当前计时器重置回该阶段的初始时长"。design.md 状态转换表也未定义 running→idle 的 RESET 转换。如果用户想在 running 状态重置，只能先 pause 再 reset，交互不够直观。
- **建议**: 考虑在 running 状态也允许 reset，或至少在 UI 上提供 running 状态下的重置入口。如果设计意图是仅 paused 可重置，应在文档中明确说明。
- **参考**: design.md §7.2 状态转换表；prd.md AC-05

#### P1-2: SettingsPage 保存逻辑中 toggle 方法使用不当

- **位置**: `src/components/settings/SettingsPage.tsx:193-200`
- **描述**: `handleSave` 中通过 `store.getState().toggleSound()` 来切换通知开关。`toggleSound()` 是翻转当前值的方法，但在保存时应该**设置为目标值**而非翻转。虽然代码先检查了 `curSound !== soundEnabled` 来决定是否调用 toggle，但这种间接方式容易出错——如果 `toggleSound()` 实现改变或 store 状态不同步，会导致设置错误。
- **建议**: 添加 `setSoundEnabled(value)` 和 `setDesktopNotificationEnabled(value)` 直接设置方法，而非通过 toggle 翻转。
- **参考**: design.md §3.2 settingsStore 对外接口

#### P1-3: useTimer 中 notifyPhaseEnd 在 phase 变更时触发，但可能重复触发

- **位置**: `src/hooks/useTimer.ts:81-83`
- **描述**: `notifyPhaseEnd(prevPhase ?? currentPhase)` 在 `result.expired` 时调用。但 `prevPhaseRef` 可能在多个 tick 回调中被更新（subscribe 中也更新了 `prevPhaseRef`），导致通知可能在同一个 TIMER_COMPLETE 事件中触发两次。
- **建议**: 使用局部变量跟踪"本次 tick 是否已通知"，或在 notifyPhaseEnd 内部去重。
- **参考**: design.md §6.1 计时器核心循环

#### P1-4: TrayProvider 创建独立的 timerStore，与业务 store 不共享状态

- **位置**: `src/hooks/useTray.ts:190`
- **描述**: `TrayProvider` 调用 `createTimerStore()` 创建独立 store，这个 store 初始状态永远是 idle/25:00。托盘 tooltip 显示的永远是最初的 25:00，不会反映实际计时器的运行状态。只有当用户在 TimerPage 上点击开始后，TrayProvider 的 store 才会独立地开始计时——与业务 store 完全脱节。
- **建议**: TrayProvider 应接收业务 timerStore 的引用（而非创建新 store），或直接订阅业务 store 的状态变化。
- **参考**: T-008 验收标准 2；impl-notes-T-008.md 第 4 条"已知限制"

---

### 🟢 P2 — 建议改进

#### P2-1: ConfirmModal 的 ESC 键处理与 useKeyboard 的 ESC 处理竞态

- **位置**: `src/components/common/ConfirmModal.tsx:37-44` 和 `src/hooks/useKeyboard.ts:79-84`
- **描述**: ConfirmModal 在 `useEffect` 中注册了 `document.addEventListener("keydown", ...)` 处理 ESC；同时 useKeyboard 在 `window.addEventListener("keydown", ...)` 中也处理 ESC。两者监听不同层级的 DOM 事件，可能导致行为不一致——例如在 Modal 打开时，useKeyboard 的 `cancelSkip()` 可能因 `pendingConfirm` 为 false 而无效果，但 Modal 的 `onDismiss` 仍会关闭弹窗。
- **建议**: 统一 ESC 处理入口，或在 Modal 打开时暂时禁用 useKeyboard 的 ESC 处理。

#### P2-2: formatTime 对超大秒数无上限保护

- **位置**: `src/utils/formatTime.ts:12-26`
- **描述**: `formatTime(3661)` → `"61:01"` 是正确的（design.md 验收标准明确要求），但如果传入远超 7200 的值（如负数已处理，但极大正数），会显示不合理的分钟数。虽然 TimerState 约束 `remainingSeconds` ≤ 7200，但 formatTime 作为纯工具函数没有防御性校验。
- **建议**: 考虑添加 `Math.min(seconds, 7200)` 的上限保护，或在 JSDoc 中明确声明输入范围。

#### P2-3: SettingsPage 的 hasUnsavedChanges 检测依赖 store.getState() 而非本地 state

- **位置**: `src/components/settings/SettingsPage.tsx:296-301`
- **描述**: `hasUnsavedChanges` 将本地 state（`workMinutes` 等）与 `store.getState()` 的当前值比较。但 `store.getState()` 返回的是 Zustand store 的状态——而本地 state 在编辑时不会同步更新 store（这是设计意图），所以比较的是"本地编辑值 vs store 原始值"。这在大多数情况下是正确的，但如果 store 被外部操作修改（如 `load()`），本地 state 不会自动同步（除了通过 `syncRef` 机制）。
- **建议**: 使用 `isDirty` 标志替代手动比较，或确保本地 state 与 store 始终保持同步。

---

## 四、设计一致性检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 模块依赖方向（UI → Store → Engine → Platform） | ✅ | 符合 design.md §3.3 |
| 类型定义与 api-contract.yaml 对齐 | ✅ | Phase/Status/TimerState 等一致 |
| 状态机转换规则 | ✅ | 25+ 条转换 + forbidden 均实现 |
| 计时引擎基于系统时钟 | ✅ | Date.now() 参数注入，支持测试 mock |
| Zustand store 接口 | ✅ | timerStore + settingsStore 职责清晰 |
| 组件 Props 接口 | ⚠️ | ToggleSwitch 测试与实现 prop 名不一致 |
| 错误处理策略 | ✅ | notification 模块 try-catch 静默降级 |

---

## 五、测试覆盖率评估

| 模块 | 目标 | 实际 | 说明 |
|------|------|------|------|
| Engine（stateMachine + timerEngine） | ≥ 90% | ✅ 通过 | stateMachine 48/48 通过，timerEngine 全覆盖 |
| Stores（timerStore + settingsStore） | ≥ 80% | ✅ 通过 | timerStore 15/15，settingsStore 18/18 通过 |
| Hooks（useTimer + useKeyboard + useNotification） | — | ✅ 通过 | 全部通过 |
| Components（timer + common） | ≥ 70% | ⚠️ 部分 | TimerDisplay/PrimaryButton/PhaseLabel/PomodoroCounter/SkipButton/ResetButton/ConfirmModal/Toast 通过；**DurationInput 10/10 失败，ToggleSwitch 8/8 失败** |
| **总计** | — | **266 pass / 17 fail** | 失败率 6.0% |

---

## 六、安全初筛

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 注入风险 | ✅ | 无数据库/HTTP 调用 |
| 敏感信息暴露 | ✅ | 无硬编码密钥/Token |
| XSS 风险 | ✅ | React 自动转义，Portal 渲染安全 |
| 通知权限 | ✅ | 失败时 try-catch 静默降级 |

---

## 七、审查结论

### ❌ REJECTED

**理由**:
1. **P0-2**: 17 个测试失败（DurationInput 10 个 + ToggleSwitch 7 个），测试覆盖率目标未达成
2. **P0-1**: TimerDisplay 的 `aria-live="polite"` 在 250ms tick 下会造成屏幕阅读器灾难
3. **P1-4**: TrayProvider 的独立 store 导致托盘 tooltip 永远显示初始值，无法反映真实计时状态

**修复后无需重新审查的条件**: 修复上述 P0 + P1-1/P1-2/P1-3 后，测试全部通过即可 APPROVED。P2 建议可在后续迭代中处理。
