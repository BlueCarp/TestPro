# 技术设计方案 — 番茄钟计时器客户端

## 1. 方案概述

本方案为番茄钟计时器 V1.0 客户端的技术设计。产品定位为**纯本地桌面应用**，无后端依赖，核心功能为工作/休息计时循环、通知提醒和设置管理。技术选型遵循轻量化、高性能原则：采用 **Tauri v2** 作为桌面壳（相比 Electron 体积小 90%+、内存占用低），**React 19 + TypeScript** 构建 UI 层，**Zustand** 管理客户端状态，**Vite** 作为构建工具。

计时器引擎基于系统时钟（wall clock）而非 `setInterval` 累减，以消除长时间运行的时间漂移。状态管理采用有限状态机模型，明确 7 个 UI 状态及转换规则。V1 不涉及后端 API——所有数据本地持久化，`api-contract.yaml` 仅定义数据模型接口和状态转换规范。

## 2. 技术选型表

| 组件 | 选型 | 版本 | 理由 | 备选方案及否决原因 |
|------|------|------|------|-------------------|
| 桌面框架 | Tauri v2 | 2.x | 基于 Rust，包体积极小（<5MB）、内存占用低（<50MB）、原生系统托盘/通知/快捷键支持、跨平台（Win/macOS/Linux）| Electron — 否决：包体积 150MB+、内存占用 200MB+；对于一个简单计时器过重 |
| 前端框架 | React | 19.x | 组件模型成熟、状态管理生态丰富（Zustand）、Vite 支持完善、团队熟悉度高 | Vue 3 / Svelte 5 — 均可胜任，选 React 因其生态最成熟 |
| 语言 | TypeScript | 5.x | 类型安全、接口可复用至 api-contract、IDE 智能提示 | JavaScript — 否决：缺少类型约束，不利于 api-contract 的数据模型定义 |
| 构建工具 | Vite | 6.x | HMR 极快、Tauri 官方插件集成、ESBuild 打包快 | Turbopack / Webpack — Vite 与 Tauri 集成最成熟 |
| 状态管理 | Zustand | 5.x | 轻量（<1KB）、API 极简、TypeScript 友好、无需 Provider 包裹 | Redux Toolkit — 否决：对 2 页应用过度；Jotai — 可胜任，但 Zustand 的 slice 模式更清晰 |
| 路由 | React Router | 7.x | 仅 2 个页面（/ 和 /settings），标准方案 | TanStack Router — 对 2 页应用过度 |
| 样式方案 | CSS Modules + CSS Custom Properties | — | 零依赖、作用域隔离、主题变量系统、不增加打包体积 | Tailwind CSS — 可胜任，但增加构建步骤；styled-components — 运行时开销不必要 |
| 桌面通知 | @tauri-apps/plugin-notification | 2.x | Tauri 官方插件，直接调用 OS 原生通知 API | Web Notification API — 否决：桌面端支持不完整、无法定制 |
| 系统托盘 | @tauri-apps/plugin-shell + Tauri tray API | 2.x | Tauri 内置 API，支持托盘图标 + 右键菜单 + tooltip 显示剩余时间 | — |
| 本地持久化 | @tauri-apps/plugin-store | 2.x | Tauri 官方 KV 存储，JSON 序列化、跨平台路径自动处理 | localStorage — 否决：Tauri WebView 中可能被清理；SQLite — V1 数据量极小，过度 |
| 音效播放 | Web Audio API | — | 浏览器内置、零依赖、延迟低 | Howler.js — 对单一提示音过度 |
| 单元测试 | Vitest | 3.x | 与 Vite 配置复用、速度快、React Testing Library 集成 | Jest — 否决：需额外配置，与 Vite 不兼容 |
| 代码规范 | ESLint + Prettier | 9.x / 3.x | 标准实践 | Biome — 可替代，但生态成熟度不及 ESLint |

## 3. 模块设计

### 3.1 模块总览

```
src/
├── main.tsx                    # React 入口
├── App.tsx                     # 路由 + 全局 Provider
├── components/                 # UI 组件层
│   ├── timer/
│   │   ├── TimerPage.tsx       # 计时器主页（/）
│   │   ├── PhaseLabel.tsx      # 阶段标签（🔴工作 / 🟢短休息 / 🔵长休息）
│   │   ├── TimerDisplay.tsx    # 倒计时数字（MM:SS 大字体）
│   │   ├── PrimaryButton.tsx   # 主按钮（开始/暂停/继续）
│   │   ├── SkipButton.tsx      # 跳过按钮
│   │   ├── ResetButton.tsx     # 重置按钮（仅暂停时显示）
│   │   └── PomodoroCounter.tsx # 番茄计数（🍅 × N）
│   ├── settings/
│   │   ├── SettingsPage.tsx    # 设置页面（/settings）
│   │   ├── DurationInput.tsx   # 时长调节组件（+/- 按钮 + 数字输入）
│   │   └── ToggleSwitch.tsx    # 开关组件
│   ├── common/
│   │   ├── TitleBar.tsx        # 标题栏（含返回/设置图标）
│   │   ├── ConfirmModal.tsx    # 确认弹窗
│   │   ├── Toast.tsx           # Toast 提示
│   │   └── ToastContainer.tsx  # Toast 容器（Portal）
│   └── icons/                  # SVG 图标组件
├── engine/                     # 计时器引擎层
│   ├── timerEngine.ts          # 计时器核心逻辑（系统时钟基准）
│   ├── stateMachine.ts         # 状态机定义与转换
│   └── notification.ts         # 通知（桌面弹窗 + 声音）
├── stores/                     # 状态管理层（Zustand）
│   ├── timerStore.ts           # 计时器状态
│   └── settingsStore.ts        # 设置状态 + 持久化
├── hooks/                      # 自定义 Hooks
│   ├── useTimer.ts             # 计时器 Hook（整合 engine + store）
│   ├── useNotification.ts      # 通知 Hook
│   ├── useKeyboard.ts          # 键盘快捷键 Hook
│   └── useTray.ts              # 系统托盘 Hook
├── types/                      # TypeScript 类型定义
│   ├── timer.ts                # TimerState, Phase, Status, TimerAction
│   └── settings.ts             # Settings, DurationConfig, NotificationConfig
├── utils/                      # 工具函数
│   ├── formatTime.ts           # 秒 → MM:SS
│   └── validation.ts           # 设置校验（1–120 分钟）
└── __tests__/                  # 测试
    ├── engine/
    │   ├── timerEngine.test.ts
    │   └── stateMachine.test.ts
    ├── stores/
    │   ├── timerStore.test.ts
    │   └── settingsStore.test.ts
    └── components/
        └── TimerDisplay.test.tsx
```

### 3.2 模块职责与边界

#### timerEngine（计时引擎）
- **职责**：基于系统时钟计算剩余秒数，提供 start/pause/resume/reset/skip 操作；驱动状态机转换
- **边界**：纯逻辑模块，不依赖 UI、不依赖 store；输入为当前状态和系统时间，输出为新的剩余秒数和事件
- **对外接口**：
  - `createTimerEngine(config: DurationConfig): TimerEngine`
  - `engine.getRemainingSeconds(now: number): number`
  - `engine.start(now: number): void`
  - `engine.pause(now: number): void`
  - `engine.resume(now: number): void`
  - `engine.reset(): void`
  - `engine.tick(now: number): TickResult` — 返回 `{ remainingSeconds, expired }`
- **依赖**：无外部依赖（仅依赖 `Date.now()` 通过参数注入，便于测试）

#### stateMachine（状态机）
- **职责**：定义计时器的合法状态和转换规则，校验状态转换合法性，自动判断下一阶段
- **边界**：纯函数模块，不依赖 UI；接受当前状态 + 动作，返回新状态
- **对外接口**：
  - `transition(state: TimerState, action: TimerAction, settings: DurationConfig): TimerState`
  - `getNextPhase(current: TimerState, settings: DurationConfig): { phase, initialSeconds }`
- **依赖**：types 模块

#### timerStore（计时器状态存储）
- **职责**：持有计时器运行时状态，暴露 action 方法，驱动 UI 更新
- **对外接口**：
  ```
  timerStore: {
    phase, status, remainingSeconds, completedPomodoros,
    start(), pause(), resume(), reset(), skip(),
    subscribe(listener)
  }
  ```
- **依赖**：timerEngine、stateMachine

#### settingsStore（设置存储）
- **职责**：持有用户设置，提供读写方法，通过 Tauri Store 插件持久化
- **对外接口**：
  ```
  settingsStore: {
    workMinutes, shortBreakMinutes, longBreakMinutes,
    soundEnabled, desktopNotificationEnabled,
    isDirty,
    updateWorkMinutes(v), updateShortBreakMinutes(v), updateLongBreakMinutes(v),
    toggleSound(), toggleDesktopNotification(),
    save(), resetDefaults(),
    load() // 初始化时从持久化存储加载
  }
  ```
- **依赖**：@tauri-apps/plugin-store

#### notification（通知模块）
- **职责**：封装桌面通知和声音播放，根据设置开关决定是否触发
- **边界**：适配层，隔离 Tauri/Web API 调用
- **对外接口**：
  - `notifyPhaseEnd(phase: Phase, settings: NotificationConfig): Promise<void>`
  - `playSound(): void`
- **依赖**：@tauri-apps/plugin-notification、Web Audio API

### 3.3 模块依赖图

```
┌─────────────────────────────────────────────┐
│                  UI Layer                     │
│  TimerPage / SettingsPage / Components       │
│       ↓ useTimer / useNotification           │
├─────────────────────────────────────────────┤
│               Store Layer                     │
│  timerStore ←→ settingsStore                 │
│       ↓              ↓                       │
├─────────────────────────────────────────────┤
│              Engine Layer                     │
│  timerEngine  stateMachine  notification     │
│       ↓                                       │
├─────────────────────────────────────────────┤
│              Platform Layer                   │
│  Tauri Notification / Tray / Store Plugin    │
│  Web Audio API                               │
└─────────────────────────────────────────────┘
```

依赖方向：UI → Store → Engine → Platform。上层可引用下层，下层不可引用上层。

## 4. 数据模型设计

### 4.1 计时器状态（TimerState）

```typescript
// 阶段枚举
type Phase = "work" | "short_break" | "long_break";

// 运行状态枚举
type Status = "idle" | "running" | "paused";

// 计时器完整状态
interface TimerState {
  phase: Phase;
  status: Status;
  remainingSeconds: number;       // 当前阶段剩余秒数
  completedPomodoros: number;     // 当前循环已完成番茄钟数 (0–4)
  startedAt: number | null;       // 本轮开始时间戳 (epoch ms)，running 时有值
  pausedAt: number | null;        // 暂停时间戳 (epoch ms)，paused 时有值
}
```

**约束**：
- `status === "idle"` 仅当 `phase === "work"`
- `completedPomodoros` ∈ [0, 4]
- `remainingSeconds` ∈ [0, 7200]（最大 120 分钟）
- `startedAt` 和 `pausedAt` 互斥（不会同时非 null）

### 4.2 用户设置（Settings）

```typescript
interface DurationConfig {
  workMinutes: number;           // 工作时长，1–120，默认 25
  shortBreakMinutes: number;     // 短休息时长，1–120，默认 5
  longBreakMinutes: number;      // 长休息时长，1–120，默认 15
}

interface NotificationConfig {
  soundEnabled: boolean;          // 默认 true
  desktopNotificationEnabled: boolean; // 默认 true
}

interface Settings extends DurationConfig, NotificationConfig {
  // 组合接口
}
```

### 4.3 计时器动作（TimerAction）

```typescript
type TimerAction =
  | { type: "START" }             // idle → running
  | { type: "PAUSE" }             // running → paused
  | { type: "RESUME" }            // paused → running
  | { type: "RESET" }             // paused → idle（回到初始时长）
  | { type: "SKIP" }              // running/paused → 下一阶段
  | { type: "TIMER_COMPLETE" };   // 倒计时归零 → 自动切换
```

### 4.4 持久化存储结构

Tauri Store 插件以 JSON 文件形式存储，路径：`$APPDATA/<app>/settings.json`

```json
{
  "workMinutes": 25,
  "shortBreakMinutes": 5,
  "longBreakMinutes": 15,
  "soundEnabled": true,
  "desktopNotificationEnabled": true
}
```

计时器运行时状态**不持久化**——应用重启后统一回到 `idle` 状态（符合 PRD 约定）。

## 5. 接口定义

V1 为纯本地应用，无后端 API。前端状态管理接口、计时器引擎接口、通知接口等已在第 3、4 节定义。完整的数据模型和状态转换定义见 `specs/api-contract.yaml`。

### 5.1 组件 Props 接口

| 组件 | Props | 说明 |
|------|-------|------|
| TimerDisplay | `remainingSeconds: number` | 显示 MM:SS |
| PhaseLabel | `phase: Phase` | 显示阶段名 + 色点 |
| PrimaryButton | `status: Status; onClick: () => void` | idle→"开始", running→"暂停", paused→"继续" |
| PomodoroCounter | `count: number` | 显示 🍅 × N |
| DurationInput | `label: string; value: number; min: number; max: number; onChange: (v: number) => void` | 时长调节 |
| ToggleSwitch | `label: string; enabled: boolean; onToggle: () => void` | 开关 |
| ConfirmModal | `message: string; primaryLabel: string; secondaryLabel: string; onPrimary: () => void; onSecondary: () => void; onDismiss: () => void` | 确认弹窗 |
| Toast | `message: string; type: "success" \| "error"; duration: number` | 提示 |

## 6. 数据流

### 6.1 计时器核心循环（时序描述）

```
用户点击「开始」
  │
  ▼
timerStore.start()
  │
  ├─→ stateMachine.transition({ status: "idle" }, { type: "START" })
  │   └─→ 返回新状态 { phase: "work", status: "running", remainingSeconds: 1500 }
  │
  ├─→ timerEngine.start(Date.now())
  │   └─→ 记录 startedAt = now
  │
  └─→ useTimer Hook 启动 tick 循环 (requestAnimationFrame 或 setInterval 250ms)
      │
      ▼ (每 250ms)
  timerEngine.tick(Date.now())
      │
      ├─→ getRemainingSeconds(now)
      │   └─→ remainingSeconds = totalDuration - (now - startedAt) / 1000
      │
      ├─→ 更新 timerStore.remainingSeconds → React 重渲染 TimerDisplay
      │
      └─→ 若 remainingSeconds ≤ 0:
          │
          ├─→ stateMachine.transition(state, { type: "TIMER_COMPLETE" })
          │   ├─→ 若 phase === "work": completedPomodoros++
          │   ├─→ 判断下一阶段:
          │   │   ├─ completedPomodoros === 4 → long_break
          │   │   └─ completedPomodoros < 4  → short_break
          │   └─→ 返回新状态 + 初始时长
          │
          ├─→ timerStore 更新为新状态
          │
          └─→ notification.notifyPhaseEnd(phase, settings)
              ├─→ 若 soundEnabled → playSound()
              └─→ 若 desktopNotificationEnabled → 发送桌面通知
```

### 6.2 暂停/继续流

```
用户点击「暂停」
  │
  ▼
timerStore.pause()
  │
  ├─→ stateMachine.transition(state, { type: "PAUSE" })
  │   └─→ 状态: running → paused
  │
  └─→ timerEngine.pause(Date.now())
      ├─→ 记录 pausedAt = now
      ├─→ 冻结 remainingSeconds = totalDuration - (pausedAt - startedAt) / 1000
      └─→ 停止 tick 循环

用户点击「继续」
  │
  ▼
timerStore.resume()
  │
  ├─→ stateMachine.transition(state, { type: "RESUME" })
  │
  └─→ timerEngine.resume(Date.now())
      ├─→ startedAt = now - (pausedAt - startedAt)  // 调整基准，使剩余时间不变
      ├─→ pausedAt = null
      └─→ 重启 tick 循环
```

### 6.3 设置保存流

```
用户调整时长/通知开关 → settingsStore 更新内存中的值 (isDirty = true)

用户点击「保存设置」
  │
  ▼
settingsStore.save()
  │
  ├─→ validation.validate(settings)
  │   ├─→ 通过 → 写入 @tauri-apps/plugin-store
  │   │         → isDirty = false
  │   │         → 显示 Toast「✅ 设置已保存」
  │   │
  │   └─→ 失败 → 错误字段高亮
  │             → 显示 Toast「⚠ 请输入有效的时长（1-120 分钟）」
  │             → 不写入存储
```

### 6.4 长休息结束后循环重置

```
长休息倒计时 → 00:00
  │
  ▼
stateMachine.transition(state, { type: "TIMER_COMPLETE" })
  │   phase === "long_break" && completedPomodoros === 4
  ├─→ completedPomodoros = 0
  ├─→ phase = "work"
  ├─→ status = "idle"
  └─→ remainingSeconds = workMinutes * 60

timerStore 更新 → 界面回到 idle 状态，显示 25:00，「开始」按钮
```

## 7. 状态转换设计

### 7.1 状态机图

```
                    ┌─────────────────────────────────┐
                    │                                 │
                    ▼                                 │
              ┌──────────┐                            │
     START──→ │   idle   │ ←──────── RESET            │
              │  (work)  │                            │
              └────┬─────┘                            │
                   │                                  │
                   │ (START 或 RESUME 从暂停恢复——     │
                   │  不适用，idle 无暂停态)             │
                   ▼                                  │
         ┌──────────────────────┐                     │
         │      running         │                     │
         │  work / short_break  │──── PAUSE ──────┐   │
         │  / long_break        │                 │   │
         └──┬────────┬──────────┘                 │   │
            │        │                            ▼   │
            │        │              ┌──────────────────┤
  TIMER_COMPLETE    SKIP           │     paused       │
            │        │             │ work / short_break│
            ▼        ▼             │ / long_break     │
      ┌──────────────────┐        └──┬───────┬───────┘
      │   判断下一阶段      │          │       │
      │   + pomodoro 更新  │    RESUME│       │ RESET
      └────────┬─────────┘          │       │
               │                    ▼       ▼
               │               running    idle
               │
               ▼
         ┌──────────────────────────────┐
         │ work 完成 → short/long break │
         │ short_break 完成 → work      │
         │ long_break 完成 → idle(work) │
         │   + 番茄钟计数重置=0          │
         └──────────────────────────────┘
```

### 7.2 完整状态转换表

| 当前状态 | 动作 | 新状态 | 番茄钟计数变化 | 备注 |
|---------|------|--------|--------------|------|
| idle(work) | START | running(work) | 不变(0) | 开始新循环 |
| running(work) | PAUSE | paused(work) | 不变 | 冻结倒计时 |
| running(work) | SKIP | running(short_break) 或 running(long_break) | +1 | 跳过确认后生效；count=4→长休息 |
| running(work) | TIMER_COMPLETE | running(short_break) 或 running(long_break) | +1 | count=4→长休息 |
| paused(work) | RESUME | running(work) | 不变 | 恢复倒计时 |
| paused(work) | RESET | idle(work) | 不变 | 回到初始时长 |
| paused(work) | SKIP | running(short_break) 或 running(long_break) | +1 | 同 RUNNING+SKIP |
| running(short_break) | PAUSE | paused(short_break) | 不变 | |
| running(short_break) | SKIP | running(work) | 不变 | 跳过休息进入工作 |
| running(short_break) | TIMER_COMPLETE | running(work) | 不变 | 休息结束 |
| paused(short_break) | RESUME | running(short_break) | 不变 | |
| paused(short_break) | RESET | idle(work) | 不变 | 回到工作初始，计数保留 |
| paused(short_break) | SKIP | running(work) | 不变 | |
| running(long_break) | PAUSE | paused(long_break) | 不变 | |
| running(long_break) | SKIP | idle(work) | **重置为 0** | 跳过长休息→循环结束 |
| running(long_break) | TIMER_COMPLETE | idle(work) | **重置为 0** | 长休息结束→循环结束 |
| paused(long_break) | RESUME | running(long_break) | 不变 | |
| paused(long_break) | RESET | idle(work) | **重置为 0** | |
| paused(long_break) | SKIP | idle(work) | **重置为 0** | |

### 7.3 番茄钟计数生命周期

```
count=0  ──[work完成]──→ count=1 ──[work完成]──→ count=2
                           │                        │
                     [短休息结束]              [短休息结束]
                      → 进入work               → 进入work
                           │                        │
                           ▼                        ▼
                        count=1  ──[work完成]──→ count=3
                                                     │
                                               [短休息结束]
                                                → 进入work
                                                     │
                                                     ▼
                        count=0  ←──[长休息结束]── count=4
                         ↑                ←──[work完成]
                         └──[SKIP long_break]──┘
```

## 8. 错误处理策略

| 异常场景 | 状态码/级别 | 处理方式 | 用户感知 |
|---------|------------|---------|---------|
| 设置校验失败（0 或负数） | validation_error | 阻止保存，错误字段高亮，Toast 提示 | 「请输入有效的时长（1–120 分钟）」 |
| 通知权限未授权 | silent | try-catch 包裹通知调用，失败不抛异常 | 通知静默失败，计时器正常切换 |
| 音频播放失败 | silent | try-catch 包裹 AudioContext，失败不阻塞 | 无声音，计时器正常切换 |
| 持久化存储写入失败 | error (console) | catch 后 Toast 提示，内存中设置仍生效（当次会话） | 「设置保存失败，请重试」 |
| 持久化存储读取失败 | warn (console) | 回退到默认设置，不阻塞启动 | 使用默认值（25/5/15/通知开） |
| 计时器线程异常 | error | catch 后重置状态为 idle，Toast 提示 | 「计时器异常，已重置」 |
| 时间跳跃（系统时间被修改） | warn | 若 remainingSeconds 突变 > 2s，重新校准 remainingSeconds | 用户无感知，自动修正 |
| 窗口最小化/隐藏 | — | 计时器基于系统时钟，自动同步 | 恢复窗口时显示正确剩余时间 |

## 9. ADR（架构决策记录）

### ADR-001：选择 Tauri v2 而非 Electron

- **决策**：使用 Tauri v2 作为桌面框架
- **理由**：
  1. 包体积：Tauri <5MB vs Electron 150MB+，对简单计时器意义重大
  2. 内存占用：Tauri 运行时 ~30-50MB vs Electron ~200MB+，符合「后台 CPU <1%」的非功能需求
  3. 原生能力：Tauri 提供系统托盘、原生通知、全局快捷键 API，无需额外插件
  4. 安全模型：Tauri 默认最小权限，前端不直接访问系统 API
- **备选方案**：
  - Electron：否决——资源占用过高，对计时器类应用过度
  - Neutralino.js：否决——生态不成熟、社区小
  - 纯原生（Swift/Kotlin）：否决——无跨平台，开发成本高
- **后果**：
  - 需 Rust 工具链（团队成员需学习基本 Rust 配置）
  - Tauri 插件生态不如 Electron 丰富，但 V1 所需插件均已成熟
  - macOS 打包需 Apple Developer 账号（签名），V1 可先跳过公证

### ADR-002：计时器引擎基于系统时钟而非 setInterval 累减

- **决策**：使用 `Date.now()` 计算时间差，而非 `setInterval(() => { seconds-- })`
- **理由**：
  1. `setInterval` 存在漂移——浏览器/WebView 在后台时会节流（最低 1000ms），累积误差可达数十秒/小时
  2. PRD 要求「计时精度 ±1 秒/小时」，基于系统时钟可轻松满足
  3. 应用切换到后台再回来时，基于时钟的方案自动同步正确时间
  4. 测试友好——`Date.now()` 通过参数注入，可 mock
- **备选方案**：
  - `setInterval(1000)` 累减：否决——精度不达标
  - Web Worker 中 setInterval：否决——Tauri WebView 同样节流后台 Worker
  - requestAnimationFrame 循环：否决——后台完全停止，回来后需重新同步
- **后果**：
  - 需处理系统时间被用户手动修改的边界情况（检测突变 >2s 时重新校准）
  - 需参数注入时间戳以支持单元测试

### ADR-003：状态管理用 Zustand 而非 Context + useReducer

- **决策**：使用 Zustand 管理全局计时器状态和设置
- **理由**：
  1. 包体积极小（<1KB），API 简洁
  2. 无需 Provider 包裹，减少组件树层级
  3. 内置 subscribe + selector 模式，精准重渲染
  4. Slice 模式可清晰分离 timer 和 settings 两个领域
  5. 与 Tauri Store 持久化结合自然——初始化时 load，保存时 persist
- **备选方案**：
  - React Context + useReducer：否决——需手动优化 selector、Provider 嵌套
  - Redux Toolkit：否决——对 7 个状态 + 6 个 action 过度
  - Jotai：可胜任，但 Zustand 的 slice 模式更清晰
- **后果**：
  - 轻微学习成本（团队需了解 Zustand 的 selector 模式）
  - 状态变更追踪依赖 DevTools（zustand/react-devtools）

### ADR-004：V1 不持久化计时器运行时状态

- **决策**：应用重启后计时器统一回到 idle 状态，不恢复上次进度
- **理由**：
  1. PRD 明确 AC-04：「应用意外退出后重新打开时计时器回到该阶段的初始状态」
  2. 持久化计时状态引入复杂性：需处理「关机期间时间流逝」「恢复时计时器本应已结束」等边界
  3. 番茄工作法的核心是**当前专注**——重新打开应用意味着用户准备开始新的番茄钟
- **备选方案**：
  - 持久化运行时状态——否决：增加复杂度，与 PRD 约定冲突
- **后果**：
  - 用户意外关闭窗口会丢失当前进度（符合 PRD 设计预期）
  - V2 可考虑引入「自动恢复」选项

### ADR-005：设置页面离开时检测未保存修改

- **决策**：离开 /settings 时若 `isDirty === true`，弹出确认弹窗
- **理由**：
  1. Wireframes 明确设计了此交互（第 5.6 节步骤 5）
  2. 防止用户误操作丢失修改
  3. 实现简单——settingsStore 维护 `isDirty` 标志，设置页面 `useEffect` 清理或路由守卫拦截
- **备选方案**：
  - 自动保存——否决：与 Wireframe 交互设计冲突，且用户可能想放弃修改
- **后果**：
  - 需 React Router 的 `useBlocker` 或手动 `beforeunload` 事件

## 10. 技术风险清单

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| Tauri v2 API 不稳定（仍在 RC/早期阶段） | 中 | 中 | 锁定具体次版本号；关注 Tauri Release Notes；核心功能（WebView + 通知 + Store）已稳定 |
| Web Audio API 在 Windows 上自动播放被阻止 | 低 | 中 | 在用户首次交互（点击开始）后初始化 AudioContext；提供 fallback 静默模式 |
| macOS 打包签名/公证问题 | 低 | 中 | V1 手动安装方式；文档说明如何绕过 Gatekeeper；CI 后续接入 |
| 系统时间被用户大幅修改导致计时器异常 | 低 | 低 | 检测 remainingSeconds 突变 >2s；超过阈值时重置为初始时长 |
| Tauri Store 插件跨平台路径行为差异 | 低 | 低 | 使用插件提供的跨平台路径 API；V1 三平台测试覆盖 |
| Rust 工具链在 Windows 上安装/编译问题 | 中 | 中 | 提供开发环境脚手架脚本；CI 用 GitHub Actions 三平台矩阵构建 |
| 组件与 PRD 线框图一致性问题 | 低 | 中 | 设计文档引用 Wireframe 状态名作为组件状态枚举值；视觉还原由实现阶段评审 |

## 11. 测试策略

| 层级 | 工具 | 范围 | 目标覆盖率 |
|------|------|------|-----------|
| 单元测试 | Vitest | timerEngine、stateMachine、validation、formatTime 纯函数 | ≥ 90% |
| Store 测试 | Vitest + Zustand mock | timerStore、settingsStore 状态变更逻辑 | ≥ 80% |
| 组件测试 | Vitest + React Testing Library | 关键交互：开始/暂停/跳过/设置保存 | ≥ 70% |
| E2E | Playwright（后续 CI） | 完整用户旅程（V1 手动验证） | V2 引入 |

### 关键测试用例

**状态机**：
- 所有合法转换（转换表中每一行）
- 非法转换被拒绝（如 idle 状态下不能 PAUSE）
- 番茄钟计数边界（0→1→2→3→4→0）
- 跳过工作 vs 跳过休息 的计数差异
- 长休息结束后循环重置

**计时引擎**：
- 初始剩余秒数计算正确
- 1 秒后剩余秒数正确（模拟时间快进）
- 暂停恢复后秒数不变
- 归零检测（<0 时返回 0 并 expired=true）
- 时间跳跃校准

**设置**：
- 合法值保存成功
- 边界值（1、120）保存成功
- 0 被拒绝
- 负数被拒绝
- 非整数被拒绝
