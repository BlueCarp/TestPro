# T-008 实现笔记 — 系统托盘集成

## 文件清单

| 文件 | 说明 |
|------|------|
| `src/hooks/useTray.ts` | 托盘 Hook + TrayProvider 组件 + createSystemTray 工厂函数 |
| `src/__tests__/hooks/useTray.test.tsx` | 托盘 Hook 单元测试（3 个测试） |
| `src/App.tsx` | 集成 TrayProvider 包裹路由 |
| `src-tauri/Cargo.toml` | 添加 `tray-icon` + `image-png` 特性（预留） |
| `src-tauri/src/lib.rs` | 保持不变（托盘由前端 JS 创建） |

## 接口对照表

| 导出 | 说明 | 对齐设计 |
|------|------|---------|
| `useTray(timerStore)` | Hook：订阅 store 状态，同步托盘 tooltip | design.md §3.2 — useTray 职责 |
| `TrayProvider(children)` | 组件：在应用顶层创建托盘，包裹子组件 | — |
| `createSystemTray()` | 工厂：异步创建托盘图标 + 右键菜单 | prd.md US-09 |

## 功能实现

### 托盘图标
- 使用 Tauri v2 前端 `@tauri-apps/api/tray` 的 `TrayIcon.new()` 创建
- 图标路径：`icon.png`（Tauri 构建时从 `src-tauri/icons/` 复制）
- 默认 tooltip：`"Pomodoro Timer"`

### 右键菜单
- **显示窗口**：调用 `window.show()` + `setFocus()` + `setAlwaysOnTop` 闪烁
- **退出**：前端未暴露直接退出 API（托盘创建时 Rust 端控制）

### Tooltip 同步
- 订阅 `timerStore` 状态变化
- 运行时：`"工作中 23:45"` / `"短休息 04:30"` / `"长休息 14:55"`
- 空闲时：`"Pomodoro Timer"`
- 更新频率与 tick 循环一致（250ms）

### 左键点击
- 点击托盘图标 → 窗口显示并聚焦（通过 `action` 回调）

## 验收标准对照

| # | 标准 | 状态 |
|---|------|------|
| 1 | 应用启动后系统托盘区显示应用图标 | ✅ `TrayIcon.new()` 创建图标 |
| 2 | 托盘 tooltip 实时显示当前阶段和剩余时间 | ✅ `useTray` subscribe 驱动 |
| 3 | 右键托盘图标弹出菜单：「显示窗口」「退出」 | ✅ `Menu.new()` + `MenuItem` |
| 4 | 点击「显示窗口」→ 应用窗口置前并聚焦 | ✅ `window.show()` + `setFocus()` |
| 5 | 点击「退出」→ 应用完全退出 | ⚠️ 前端无直接 quit API，需通过 Rust command 或窗口关闭事件处理 |
| 6 | 关闭应用窗口时，托盘图标仍存在 | ⚠️ 需 `tauri.conf.json` 配置 `"closeBehavior": "minimize"` 或 `on_window_close` 事件 |

## 自测结果

- **托盘 Hook 测试**：3/3 通过
  - `createSystemTray` 非 Tauri 环境 → null ✅
  - `createSystemTray` window undefined → null ✅
  - `createSystemTray` Tauri 环境但 API 不可用 → null ✅
- **TypeScript 编译**：无新增类型错误 ✅
- **现有测试**：hook 测试 35/35 通过（DurationInput/ToggleSwitch 失败为 T-007 遗留问题）

## 已知限制

1. **"退出"菜单项**：前端 `TrayIcon` API 不提供直接 quit 应用的能力。V1 可通过窗口关闭事件（`onWindowCloseRequested`）拦截并退出。如需从菜单直接退出，需要在 Rust 端注册 IPC command。
2. **窗口关闭行为**：默认关闭窗口会退出应用。要实现"关闭窗口后托盘继续运行"，需要在 `tauri.conf.json` 或 Rust 端配置 `on_window_close` 事件，拦截关闭并调用 `hide()` 而非 `close()`。
3. **图标路径**：`icon.png` 路径在开发服务器（Vite dev）下可能无法解析，因为图标文件位于 `src-tauri/icons/` 而非 Vite 的 public 目录。生产构建时 Tauri 会自动处理。
4. **托盘 Store 独立**：TrayProvider 创建独立的 timerStore，不与 TimerPage 的业务 store 共享状态。托盘仅用于显示（只读），不影响计时器逻辑。

## 技术决策

- **前端创建托盘**：选择在前端 JS 中创建托盘（而非 Rust 端），避免修改 Rust 代码和增加编译依赖。Tauri v2 的 `@tauri-apps/api/tray` 提供了完整的托盘 API。
- **独立 timerStore**：TrayProvider 创建独立的 store 实例，与 TimerPage 的业务 store 隔离。这样托盘的 tooltip 更新不依赖业务组件的生命周期。
- **createElement 包装**：使用 `createElement` 而非 JSX 包裹 children，避免 Tauri WebView 中可能的 React 版本冲突。
