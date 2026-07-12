# T-006 实现笔记 — 计时器主页 UI

## 文件清单

| 文件 | 说明 |
|------|------|
| `src/components/timer/PhaseLabel.tsx` | 阶段标签组件：根据 phase 显示色点+名称 |
| `src/components/timer/TimerDisplay.tsx` | 倒计时显示组件：大字体 MM:SS |
| `src/components/timer/PrimaryButton.tsx` | 主操作按钮：idle→开始, running→暂停, paused→继续 |
| `src/components/timer/SkipButton.tsx` | 跳过按钮：触发 onSkip 回调 |
| `src/components/timer/ResetButton.tsx` | 重置按钮：仅 paused 状态显示 |
| `src/components/timer/PomodoroCounter.tsx` | 番茄钟计数：🍅 × N |
| `src/components/timer/TimerPage.tsx` | 主页组合组件：组装以上 6 个组件 + TitleBar + useTimer/useKeyboard |

## 接口对照表

| 组件 | Props 接口 | 对齐设计 |
|------|-----------|---------|
| PhaseLabel | `{ phase: Phase }` | wireframes.md §4.1 — 色点+名称 |
| TimerDisplay | `{ remainingSeconds: number }` | wireframes.md §4.1 — 72px 大字体 |
| PrimaryButton | `{ status: Status, onClick: () => void }` | wireframes.md §4.1 — 品牌色主按钮 |
| SkipButton | `{ onSkip: () => void \| undefined, disabled?: boolean }` | wireframes.md §4.1 — 次要边框按钮 |
| ResetButton | `{ onReset: () => void \| undefined, disabled?: boolean }` | wireframes.md §4.1 — 灰色边框按钮 |
| PomodoroCounter | `{ count: number }` | wireframes.md §4.1 — 🍅 × N |
| TimerPage | `{ timerStore?: TimerStore }` | wireframes.md §4.1 — 完整页面组合 |

## 自测结果

- **组件测试**：44/44 通过（7 个测试文件）
  - TimerDisplay.test.tsx: 7/7 ✅
  - PrimaryButton.test.tsx: 10/10 ✅
  - PhaseLabel.test.tsx: 4/4 ✅
  - SkipButton.test.tsx: 5/5 ✅
  - ResetButton.test.tsx: 4/4 ✅
  - PomodoroCounter.test.tsx: 6/6 ✅
  - ConfirmModal.test.tsx: 7/7 ✅
- **TypeScript**: `tsc --noEmit` 在 timer/ 目录下零错误 ✅
- **功能覆盖**:
  - FR-01 工作计时器: TimerDisplay + TimerPage ✅
  - FR-04 暂停/继续: PrimaryButton 三种状态 ✅
  - FR-05 重置计时器: ResetButton ✅
  - FR-06 跳过当前阶段: SkipButton + ConfirmModal（TimerPage 层管理弹窗） ✅
  - FR-09 番茄钟计数: PomodoroCounter ✅
  - 键盘快捷键: useKeyboard Hook 已集成 ✅

## 已知限制

- TimerPage 的路由跳转使用 `window.location.hash = "settings"`（V1 简化方案），需要 T-007 的 React Router 配置才能真正导航到设置页
- SkipButton 的 ConfirmModal 在 TimerPage 层统一管理（而非 SkipButton 内部），以保持组件职责分离和测试独立性
- 未修改 `src/__tests__/components/DurationInput.test.tsx` 和 `ToggleSwitch.test.tsx`（属于 T-007 范围）
