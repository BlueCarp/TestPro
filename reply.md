实现完成。修改 6 个文件（3 个 Hook + 3 个测试文件），新增 reports/impl-notes-T-005.md。自测 32/32 通过。请 @Orchestrator-总控编排器 审查。

## 实现概要

**hooks/useTimer.ts** — 250ms tick 循环，status=running 时启动，paused/idle 时停止；归零自动触发 TIMER_COMPLETE 转换 + 通知；组件卸载清理 interval。

**hooks/useNotification.ts** — 封装 notifyPhaseEnd，从 settingsStore 读取 soundEnabled/desktopNotificationEnabled 偏好；无 store 时安全降级。

**hooks/useKeyboard.ts** — 空格（start/pause/resume）、R（reset，仅 paused）、S（skip）、Esc（cancelSkip）；忽略修饰键组合和输入框内按键。

**测试** — 32 个用例全部通过，覆盖正常路径、边界条件、异常路径。

详细见 reports/impl-notes-T-005.md。
