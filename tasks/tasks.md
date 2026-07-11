# 任务计划 — 番茄钟计时器客户端 V1.0

## 1. 任务总览表

| 编号 | 标题 | 优先级 | 预估工时 | 影响文件数 | 依赖 | 状态 |
|------|------|--------|---------|-----------|------|------|
| T-001 | 项目脚手架搭建 | P0 | 2h | 5+ | — | pending |
| T-002 | 类型定义、工具函数与通用组件 | P0 | 4h | 8 | T-001 | pending |
| T-003 | 状态机与计时引擎 | P0 | 5h | 2 | T-002 | pending |
| T-004 | 状态管理层与通知模块 | P0 | 5h | 3 | T-002, T-003 | pending |
| T-005 | 自定义 Hooks | P0 | 3h | 3 | T-004 | pending |
| T-006 | 计时器主页 UI | P0 | 4h | 7 | T-002, T-005 | pending |
| T-007 | 设置页面与路由 | P1 | 3h | 4 | T-002, T-004 | pending |
| T-008 | 系统托盘集成 | P2 | 2h | 1 | T-005 | pending |

## 2. 执行顺序

```
T-001 → T-002 → T-003 → T-004 → T-005 → T-006
                                           ↘ T-008
                    T-002 → T-004 → T-007
```

**文字描述**：T-001（脚手架）为起点；T-002（类型+工具+通用组件）完成后分两路——一路串行经过 T-003（引擎）、T-004（状态管理）、T-005（Hooks）；另一路 T-007（设置页面）在 T-004 就绪后可启动。T-005 完成后，T-006（主页 UI）和 T-008（托盘）可并行启动。

## 3. 并行组标注

| 并行组 | 任务 | 条件 |
|--------|------|------|
| P1 | T-006, T-007, T-008 | T-005 和 T-004 均已完成 |

> **并行策略**：T-006 需要 T-005（useTimer Hook）和 T-002（common 组件）；T-007 需要 T-004（settingsStore）和 T-002（common 组件）；T-008 仅需要 T-005（useTimer）。T-005 依赖 T-004，因此当 T-005 完成时 T-004 必然已完成——三个任务可同时启动，互不阻塞。

## 4. 功能需求覆盖

| FR | 名称 | 优先级 | 覆盖任务 |
|----|------|--------|---------|
| FR-01 | 工作计时器 | P0 | T-006 (TimerDisplay, TimerPage) |
| FR-02 | 工作→休息自动切换 | P0 | T-003 (stateMachine), T-005 (useTimer) |
| FR-03 | 长休息判定 | P0 | T-003 (stateMachine: guard 逻辑) |
| FR-04 | 暂停/继续 | P0 | T-003 (timerEngine.pause/resume), T-006 (PrimaryButton) |
| FR-05 | 重置计时器 | P1 | T-006 (ResetButton) |
| FR-06 | 跳过当前阶段 | P1 | T-006 (SkipButton + ConfirmModal) |
| FR-07 | 时长设置 | P1 | T-007 (SettingsPage, DurationInput) |
| FR-08 | 通知提醒 | P0 | T-004 (notification.ts), T-005 (useNotification) |
| FR-09 | 番茄钟计数 | P1 | T-006 (PomodoroCounter) |
| FR-10 | 通知开关 | P2 | T-007 (ToggleSwitch) |

---

## 5. 任务卡片

### T-001：项目脚手架搭建

- **优先级**：P0
- **描述**：初始化 Tauri v2 + React 19 + TypeScript 项目，配置 Vite 构建、安装全部依赖，建立目录结构。
  - 使用 `npm create tauri-app@latest` 初始化项目骨架
  - 安装前端依赖：`react`, `react-dom`, `react-router-dom@7`, `zustand`, `@tauri-apps/api`
  - 安装 Tauri 插件：`@tauri-apps/plugin-notification`, `@tauri-apps/plugin-store`, `@tauri-apps/plugin-shell`
  - 安装开发依赖：`typescript@5`, `vite@6`, `vitest@3`, `@testing-library/react`, `eslint@9`, `prettier@3`
  - 创建 `src/` 子目录：`components/timer/`, `components/settings/`, `components/common/`, `components/icons/`, `engine/`, `stores/`, `hooks/`, `types/`, `utils/`, `__tests__/`
  - 配置 Vitest（复用 vite.config.ts）
  - 配置 ESLint + Prettier
- **参考文档**：design.md 第 2 节（技术选型表）、第 3.1 节（模块总览目录结构）
- **输入**：无
- **影响文件**：`package.json`, `tsconfig.json`, `vite.config.ts`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src/main.tsx`, `.eslintrc.cjs`, `.prettierrc`
- **输出**：可启动的空应用（`npm run tauri dev` 显示空白窗口）
- **验收标准**：
  1. [ ] `npm run tauri dev` 可启动桌面窗口
  2. [ ] `npx tsc --noEmit` 无类型错误
  3. [ ] `npx vitest run` 可执行（0 个测试通过也算成功）
  4. [ ] ESLint 可正常运行
  5. [ ] 目录结构与 design.md 3.1 节一致
- **技术提示**：Tauri v2 使用 `@tauri-apps/cli` v2.x；Windows 上需确保 Rust 工具链（`rustup`）已安装；Vite 配置需设置 `server.strictPort = true` 避免与 Tauri 端口冲突。

---

### T-002：类型定义、工具函数与通用组件

- **优先级**：P0
- **描述**：根据 api-contract.yaml 定义全部 TypeScript 类型，实现纯工具函数，构建 4 个通用 UI 组件。
  - **types/timer.ts**：`Phase`、`Status`、`TimerState`、`TimerAction` 类型（与 api-contract.yaml 的 schemas 严格对齐）
  - **types/settings.ts**：`DurationConfig`、`NotificationConfig`、`Settings`、`SettingsValidationError` 接口
  - **utils/formatTime.ts**：`formatTime(seconds: number): string` —— 秒数转 `MM:SS` 格式
  - **utils/validation.ts**：`validateDuration(value: number, field: string): SettingsValidationError | null` —— 校验 [1,120] 范围
  - **components/common/TitleBar.tsx**：标题栏（应用名 + 设置图标按钮）
  - **components/common/ConfirmModal.tsx**：通用确认弹窗（message + 主/次按钮 + 遮罩点击关闭）
  - **components/common/Toast.tsx**：单条 Toast 提示（支持 success/error 类型 + 自动消失）
  - **components/common/ToastContainer.tsx**：Toast 容器（Portal 渲染，管理多条 Toast）
- **参考文档**：
  - api-contract.yaml：Phase, Status, TimerState, TimerAction, DurationConfig, NotificationConfig, Settings 定义
  - design.md 第 4.1–4.3 节（数据模型）、5.1 节（组件 Props 接口表）
  - wireframes.md 第 6 节（ConfirmModal / Toast 样式）
- **输入**：T-001（项目骨架）
- **影响文件**：`src/types/timer.ts`, `src/types/settings.ts`, `src/utils/formatTime.ts`, `src/utils/validation.ts`, `src/components/common/TitleBar.tsx`, `src/components/common/ConfirmModal.tsx`, `src/components/common/Toast.tsx`, `src/components/common/ToastContainer.tsx`
- **输出**：类型定义文件 + 2 个工具函数及单元测试 + 4 个可复用的通用 UI 组件
- **验收标准**：
  1. [ ] `TimerState`、`TimerAction` 等类型与 api-contract.yaml 中 `components.schemas` 定义一致
  2. [ ] `formatTime(90)` → `"01:30"`，`formatTime(0)` → `"00:00"`，`formatTime(3661)` → `"61:01"`
  3. [ ] `validateDuration(25, "workMinutes")` → `null`；`validateDuration(0, "shortBreakMinutes")` → `{ field, message }`
  4. [ ] ConfirmModal 的 onPrimary / onSecondary / onDismiss 回调正确触发
  5. [ ] Toast 在指定 duration 后自动消失；ToastContainer 支持同时显示多条
  6. [ ] 单元测试覆盖 formatTime 和 validation（≥ 90%）
- **技术提示**：ConfirmModal 用 `createPortal` 渲染到 `document.body`；Toast 用 `useEffect` + `setTimeout` 实现自动消失；类型定义使用 `type` 和 `interface` 而非 `enum`（与项目中 Zustand 的序列化兼容）。

---

### T-003：状态机与计时引擎

- **优先级**：P0
- **描述**：实现核心纯逻辑——有限状态机和基于系统时钟的计时引擎。此任务输出不依赖 UI，可独立测试。
  - **engine/stateMachine.ts**：`transition(state, action, settings)` 函数，完整实现 api-contract.yaml 中 `x-state-machine.transitions` 全部 ~25 条转换规则；拒绝非法转换时抛出 `StateTransitionError`
  - **engine/timerEngine.ts**：`createTimerEngine(config)` 工厂函数，返回 `{ start, pause, resume, reset, tick, getRemainingSeconds }` 方法；基于系统时钟（`Date.now()` 参数注入）计算剩余秒数，非 `setInterval` 累减
  - **单元测试**：覆盖所有合法转换 + 非法转换拒绝 + 番茄钟计数边界 + 长休息后循环重置；计时引擎精度 / 暂停恢复 / 归零检测 / 时间跳跃校准
- **参考文档**：
  - api-contract.yaml：x-state-machine 全部 transitions + forbidden_transitions
  - design.md 第 3.2 节（timerEngine/stateMachine 对外接口）、第 7.2 节（完整状态转换表）、第 11 节（测试策略 + 关键测试用例）
  - prd.md 第 4 节 AC-02/AC-03（工作→休息切换 / 长休息判定验收标准）
- **输入**：T-002（types/timer.ts 类型定义）
- **影响文件**：`src/engine/stateMachine.ts`, `src/engine/timerEngine.ts`, `src/__tests__/engine/stateMachine.test.ts`, `src/__tests__/engine/timerEngine.test.ts`
- **输出**：状态机 + 计时引擎核心逻辑 + 单元测试（覆盖率 ≥ 90%）
- **验收标准**：
  1. [ ] 所有 ~25 条合法状态转换正确实现（对照 api-contract.yaml 逐一验证）
  2. [ ] 所有 forbidden_transitions 均抛出错误
  3. [ ] 番茄钟计数生命周期：0→1→2→3→4→0（长休息后重置）
  4. [ ] 计时引擎基于 `Date.now()` 参数注入实现——测试中可 mock 时间
  5. [ ] `tick(now)` 当 `remainingSeconds ≤ 0` 时返回 `{ remainingSeconds: 0, expired: true }`
  6. [ ] 暂停 + 恢复后剩余秒数不变（模拟暂停 5 秒后恢复）
  7. [ ] 时间跳跃 > 2 秒时自动校准（recalibrate）
  8. [ ] `vitest run` 全部通过
- **技术提示**：状态机中 `SKIP` 和 `TIMER_COMPLETE` 在 running/paused + 不同 Phase 下有大量分支——建议用表格驱动测试；guard 条件 `completedPomodoros < 3` vs `=== 3` 区分短/长休息；timerEngine 中 `startedAt` 调整为 `now - elapsedBeforePause` 以支持暂停恢复。

---

### T-004：状态管理层与通知模块

- **优先级**：P0
- **描述**：创建两个 Zustand Store（timerStore、settingsStore）和通知适配模块。timerStore 整合引擎与状态机，作为 UI 层的唯一数据源；settingsStore 通过 @tauri-apps/plugin-store 实现持久化。notification 模块封装桌面通知与声音。
  - **stores/timerStore.ts**：持有 `phase`, `status`, `remainingSeconds`, `completedPomodoros`；暴露 `start()`, `pause()`, `resume()`, `reset()`, `skip()` action；内部调用 stateMachine.transition + timerEngine 方法；通过 `subscribe` 支持 React 重渲染
  - **stores/settingsStore.ts**：持有 `workMinutes`, `shortBreakMinutes`, `longBreakMinutes`, `soundEnabled`, `desktopNotificationEnabled` + `isDirty`；提供 `update*()` / `toggle*()` / `save()` / `resetDefaults()` / `load()`；save 时先过 validation → 写入 Tauri Store
  - **engine/notification.ts**：`notifyPhaseEnd(phase, settings)` 函数——根据 settings 开关决定是否播放声音（Web Audio API）和弹出桌面通知（@tauri-apps/plugin-notification）；try-catch 包裹，失败不抛异常
  - **Store 单元测试**
- **参考文档**：
  - design.md 第 3.2 节（timerStore/settingsStore/notification 对外接口）、第 6 节（数据流）、第 8 节（错误处理策略）
  - api-contract.yaml：Settings schema + 持久化路径说明
  - prd.md：AC-07（设置校验）、AC-08（通知）、AC-10（通知开关）
- **输入**：T-002（types）、T-003（stateMachine + timerEngine）
- **影响文件**：`src/stores/timerStore.ts`, `src/stores/settingsStore.ts`, `src/engine/notification.ts`, `src/__tests__/stores/timerStore.test.ts`, `src/__tests__/stores/settingsStore.test.ts`
- **输出**：两个 Zustand Store + 通知模块 + Store 单元测试
- **验收标准**：
  1. [ ] timerStore.start() 触发 stateMachine.transition + timerEngine.start()，状态变更为 running(work)
  2. [ ] timerStore.pause() / resume() / reset() / skip() 正确调用引擎并更新状态
  3. [ ] timerStore.skip() 触发 ConfirmModal 所需的状态（或返回确认需求）
  4. [ ] settingsStore.save() 校验通过后写入 Tauri Store；校验失败返回错误且不写入
  5. [ ] settingsStore.load() 从 Tauri Store 读取；读取失败时回退到默认值（25/5/15/true/true）
  6. [ ] settingsStore 离开设置页时有 isDirty 标记
  7. [ ] notifyPhaseEnd() 在 soundEnabled=true 时播放提示音，desktopNotificationEnabled=true 时弹出桌面通知
  8. [ ] 通知权限被拒/播放失败时不抛异常，计时器正常切换
  9. [ ] Store 单元测试通过
- **技术提示**：settingsStore 使用 Zustand 的 `persist` 中间件结合 Tauri Store 的 `get/set` API；timerStore 中 skip action 需先设置 "pendingConfirm" 中间态，等 ConfirmModal 回调后再执行实际转换；Web Audio API 的 AudioContext 需在用户首次交互后初始化（避免浏览器自动播放策略阻止）。

---

### T-005：自定义 Hooks

- **优先级**：P0
- **描述**：创建 3 个自定义 Hook，桥接 Store 层和 UI 层，封装计时器 tick 循环、通知触发和键盘快捷键逻辑。
  - **hooks/useTimer.ts**：调用 timerStore + timerEngine，管理 tick 循环（`setInterval` 250ms 或 `requestAnimationFrame`）；在 `remainingSeconds ≤ 0` 时触发 `TIMER_COMPLETE` 并调用 notification；在组件卸载时清理 interval
  - **hooks/useNotification.ts**：封装 `notifyPhaseEnd` 调用，从 settingsStore 读取通知偏好；监听 phase 变化以触发通知
  - **hooks/useKeyboard.ts**：监听全局键盘事件；空格键 → start/pause/resume；R → reset（仅 paused 状态）；S → skip；Esc → 关闭弹窗
- **参考文档**：
  - design.md 第 6.1 节（计时器核心循环时序）、第 3.2 节（useTimer/useNotification/useKeyboard 职责）
  - wireframes.md 第 5.7 节（键盘快捷键定义）
  - prd.md：AC-04（暂停/继续）、AC-08（通知）
- **输入**：T-004（timerStore + settingsStore + notification）
- **影响文件**：`src/hooks/useTimer.ts`, `src/hooks/useNotification.ts`, `src/hooks/useKeyboard.ts`
- **输出**：3 个可用 Hook，导出给组件层使用
- **验收标准**：
  1. [ ] useTimer 在 start 后每 250ms 更新 remainingSeconds，UI 可观察到递减
  2. [ ] useTimer 在 remainingSeconds 归零时自动触发 TIMER_COMPLETE 转换并调 notification
  3. [ ] useTimer 在组件卸载时清理 interval（无内存泄漏）
  4. [ ] 应用窗口从后台恢复时，useTimer 基于系统时钟自动同步正确时间
  5. [ ] useKeyboard：空格键在 idle→START / running→PAUSE / paused→RESUME
  6. [ ] useKeyboard：R 键仅在 paused 状态触发 reset；idle 或 running 时忽略
  7. [ ] useNotification 在 soundEnabled=false 时不播放声音但桌面通知正常（若开启）
- **技术提示**：tick 间隔选 250ms 而非 1000ms 以避免 WebView 后台节流导致的显示跳跃；`Date.now()` 在 tick 回调中实时获取（非闭包缓存）；useKeyboard 中使用 Tauri 的全局快捷键 API（若需应用失焦时仍生效）——V1 可先用 `window.addEventListener('keydown')`。

---

### T-006：计时器主页 UI

- **优先级**：P0
- **描述**：构建计时器主页（`/` 路由）的全部组件，实现 wireframes.md 中定义的 7 个 UI 状态。此任务组装通用组件 + 自定义 Hooks 为完整的计时器交互界面。
  - **components/timer/PhaseLabel.tsx**：根据 phase 显示阶段名 + 色点（🔴工作 / 🟢短休息 / 🔵长休息）
  - **components/timer/TimerDisplay.tsx**：大字体 MM:SS 倒计时显示
  - **components/timer/PrimaryButton.tsx**：根据 status 显示 "开始" / "暂停" / "继续"
  - **components/timer/SkipButton.tsx**：次要操作按钮，点击触发 ConfirmModal
  - **components/timer/ResetButton.tsx**：仅 paused 状态显示，点击回到初始时长
  - **components/timer/PomodoroCounter.tsx**：显示 "🍅 × N"
  - **components/timer/TimerPage.tsx**：组合以上组件 + TitleBar，使用 useTimer/useKeyboard Hook
  - **组件测试**（TimerDisplay, PrimaryButton 交互）
- **参考文档**：
  - wireframes.md 第 4.1 节（7 个状态的完整线框图 + 元素清单 + 交互描述）
  - design.md 第 5.1 节（组件 Props 接口表）
  - prd.md：AC-01（工作计时器）、AC-04（暂停/继续）、AC-05（重置）、AC-06（跳过）、AC-09（番茄钟计数）
- **输入**：T-002（通用组件 TitleBar / ConfirmModal / Toast）、T-005（useTimer / useKeyboard Hook）
- **影响文件**：`src/components/timer/TimerPage.tsx`, `src/components/timer/PhaseLabel.tsx`, `src/components/timer/TimerDisplay.tsx`, `src/components/timer/PrimaryButton.tsx`, `src/components/timer/SkipButton.tsx`, `src/components/timer/ResetButton.tsx`, `src/components/timer/PomodoroCounter.tsx`, `src/__tests__/components/TimerDisplay.test.tsx`
- **输出**：完整的计时器主页（7 个 UI 状态均可正确渲染和交互）
- **验收标准**：
  1. [ ] idle 状态：显示 "开始" 按钮、25:00、🍅×0；暂停/重置/跳过按钮不可见
  2. [ ] running 状态：显示 "暂停" + "跳过"；倒计时实时递减
  3. [ ] paused 状态：显示 "继续" + "重置" + "跳过"；倒计时冻结
  4. [ ] 短休息/长休息状态：PhaseLabel 正确变化；番茄钟计数正确更新
  5. [ ] 长休息结束后回到 idle 状态、计数归零、显示 25:00
  6. [ ] 点击 "跳过" 弹出 ConfirmModal → 确认后进入下一阶段；取消后继续当前状态
  7. [ ] 空格键可控制开始/暂停/继续
  8. [ ] 组件测试通过（≥ 70%）
- **技术提示**：按钮可见性由 status + phase 决定——“重置”仅在 paused 状态显示；"跳过"在 idle 状态隐藏；PrimaryButton 文案由 status 决定（idle→"开始", running→"暂停", paused→"继续"）。TimerPage 使用 `useTimer()` Hook 获取所有状态，向下传递 Props。

---

### T-007：设置页面与路由

- **优先级**：P1
- **描述**：构建设置页面（`/settings` 路由）和 React Router 路由配置。实现 wireframes 中定义的时长调节、通知开关、保存/恢复默认设置、未保存离开提示。
  - **components/settings/DurationInput.tsx**：时长调节组件（[-] 数字 [+] 分钟），支持点击 ±1 和直接输入
  - **components/settings/ToggleSwitch.tsx**：开关组件
  - **components/settings/SettingsPage.tsx**：组合 DurationInput × 3、ToggleSwitch × 2、保存/恢复默认按钮；isDirty 时离开提示
  - **App.tsx / main.tsx**：配置 React Router（`/` → TimerPage, `/settings` → SettingsPage）
  - "未保存修改"离开确认：使用 React Router `useBlocker` 或在 SettingsPage 的返回按钮中检测 isDirty
- **参考文档**：
  - wireframes.md 第 4.2 节（设置页面线框图 + 3 个状态）
  - wireframes.md 第 5.6 节（修改设置流程）、第 6 节（确认弹窗 / Toast）
  - design.md 第 6.3 节（设置保存流）、ADR-005（离开检测）
  - prd.md：AC-07（时长设置）、AC-10（通知开关）
- **输入**：T-002（通用组件标题栏 + Toast）、T-004（settingsStore）
- **影响文件**：`src/components/settings/SettingsPage.tsx`, `src/components/settings/DurationInput.tsx`, `src/components/settings/ToggleSwitch.tsx`, `src/App.tsx`, `src/main.tsx`
- **输出**：完整的设置页面 + 路由导航
- **验收标准**：
  1. [ ] 点击计时器主页 ⚙ 图标 → 导航到 /settings
  2. [ ] DurationInput 点击 [+]/[-] 正常增减（范围 1–120）；直接输入数字也可
  3. [ ] ToggleSwitch 点击切换状态，视觉反馈正确
  4. [ ] 点击 "保存设置" → 校验通过后 Toast "✅ 设置已保存" → 回到计时器主页，新设置生效
  5. [ ] 校验失败（输入 0）→ 错误行高亮 + Toast 提示 "请输入有效的时长（1–120 分钟）"
  6. [ ] 点击 "恢复默认设置" → 恢复为 25/5/15/通知全开
  7. [ ] 有未保存修改时点击返回 → 弹出 ConfirmModal "有未保存的修改，确定离开吗？"
  8. [ ] 点击 "放弃" → 回到计时器主页，修改不生效
  9. [ ] 点击 "继续编辑" → 留在设置页面
- **技术提示**：DurationInput 需要使用 `useState` 管理本地编辑状态（避免每次 +/- 都触发 settingsStore 更新），仅在保存时将本地状态写入 store；离开检测用 React Router v7 的 `useBlocker` 或在返回按钮 onClick 中手动检查 `isDirty`。

---

### T-008：系统托盘集成

- **优先级**：P2
- **描述**：实现系统托盘功能——应用图标显示在系统托盘区，tooltip 显示剩余时间，右键菜单提供快捷操作。
  - **hooks/useTray.ts**：使用 Tauri `tray` API 创建托盘图标；定期更新 tooltip 为当前剩余时间（MM:SS 格式）；右键菜单包含 "显示窗口" / "退出应用"；应用关闭时销毁托盘
  - 在 App.tsx 或 main.tsx 中初始化 useTray
  - 托盘图标使用应用图标（`src-tauri/icons/` 中的 .ico/.png）
- **参考文档**：
  - design.md 第 3.2 节（useTray Hook 职责）
  - prd.md：US-09（用户故事：系统托盘显示剩余时间）、第 7 节待确认问题 2
  - Tauri v2 文档：`tray::TrayIconBuilder` API
- **输入**：T-005（useTimer Hook 提供 remainingSeconds + status）
- **影响文件**：`src/hooks/useTray.ts`
- **输出**：系统托盘图标 + tooltip + 右键菜单
- **验收标准**：
  1. [ ] 应用启动后系统托盘区显示应用图标
  2. [ ] 托盘 tooltip 实时显示当前阶段和剩余时间（如 "工作中 23:45"）
  3. [ ] 右键托盘图标弹出菜单：「显示窗口」「退出」
  4. [ ] 点击「显示窗口」→ 应用窗口置前并聚焦
  5. [ ] 点击「退出」→ 应用完全退出（包括托盘图标）
  6. [ ] 关闭应用窗口时，托盘图标仍存在（计时器继续后台运行）[待确认]
- **技术提示**：Tauri v2 的 tray 功能在 Rust 端配置（`src-tauri/src/main.rs` 或 `lib.rs` 中 `tray::TrayIconBuilder`）；前端通过 `@tauri-apps/api` 的事件系统与托盘通信；tooltip 更新频率可与 tick 循环一致（250ms）；关闭窗口行为需在 `tauri.conf.json` 中配置 `"closeBehavior": "minimize"` 或通过 `on_window_close` 事件处理。
