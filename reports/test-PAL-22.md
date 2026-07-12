# PAL-22 测试报告

**测试人**: QA-测试工程师
**测试日期**: 2026-07-12
**关联 Issue**: PAL-25 (f38ba0e4-28b8-4dd8-b2fb-5624f7ec6e5e)
**前置条件**: CR APPROVED, SR PASS
**测试范围**: PAL-22 修复的全量验证

---

## 一、测试摘要

| 指标 | 数值 |
|------|------|
| 测试文件 | 22 |
| 测试总数 | 275 (原版 264 + 新增 11) |
| 通过 | 275 |
| 失败 | 0 |
| 通过率 | **100%** |

---

## 二、PAL-22 修复项验证

### 验证项 1：全量测试通过 ✅

```
Test Files  22 passed (22)
Tests       275 passed (275)
```

### 验证项 2：过时测试文件删除 ✅

| 文件 | 状态 |
|------|------|
| `src/__tests__/components/DurationInput.test.tsx` | 已删除 |
| `src/__tests__/components/ToggleSwitch.test.tsx` | 已删除 |

新测试文件已迁移至 `src/__tests__/components/settings/` 目录。

### 验证项 3：P0-1 TimerDisplay aria-live 修复 ✅

**文件**: `src/components/timer/TimerDisplay.tsx`

| 属性 | 预期 | 实际 | 状态 |
|------|------|------|------|
| `aria-live` | `polite` | `polite` | ✅ |
| `aria-atomic` | `true` | `true` | ✅ |
| `role` | `status` | `status` | ✅ |
| `aria-label` | `剩余时间：MM:SS` | `剩余时间：25:00` | ✅ |
| `key` | `display` (防抖) | `key={display}` | ✅ |

**补充测试**: 新增 5 个无障碍测试用例（CR P2-1 建议）。

### 验证项 4：P1-1 timerStore.reset() running 状态支持 ✅

**文件**: `src/stores/timerStore.ts:122-134`

- 原逻辑: `if (s.status !== "paused") return` — 仅允许 paused 状态 reset
- 新逻辑: `if (s.status === "idle") return` — 允许 idle 外所有状态 reset
- 测试覆盖: `timerStore.test.ts` 中 reset 测试通过，idle/paused/running 三条路径均正常

### 验证项 5：P1-2 SettingsPage setSoundEnabled 直接设置方法 ✅

**文件**: `src/stores/settingsStore.ts`, `src/components/settings/SettingsPage.tsx`

- 新增 `setSoundEnabled(value: boolean)` 和 `setDesktopNotificationEnabled(value: boolean)`
- `handleSave` 中从 `toggleSound()` 改为 `setSoundEnabled(soundEnabled)`
- 值不变时不标记 dirty（`isDirty: state.soundEnabled !== value`）
- 补充测试: 新增 5 个直接设置方法测试用例（CR P2-2 建议）

### 验证项 6：P1-3 useTimer notifyPhaseEnd 去重 ✅

**文件**: `src/hooks/useTimer.ts`

- 新增 `notifiedRef = useRef<Set<string>>(new Set())` 跟踪已通知阶段
- expire 时检查 `notifiedRef.current.has(notifKey)` 防止重复通知
- phase 变更时 `notifiedRef.current.clear()` 允许新阶段通知
- 间接测试: 新增 1 个去重验证用例（CR P2-3 建议）

### 验证项 7：P1-4 TrayProvider Context 共享 store ✅

**文件**: `src/hooks/useTray.ts`, `src/components/timer/TimerPage.tsx`

- 新增 `TimerStoreContext` React Context
- `effectiveStore = propStore ?? contextStore` 优先级设计
- `useTray(effectiveStore)` 订阅业务 store，托盘 tooltip 同步实际状态
- useTray 测试文件通过

---

## 三、新增测试用例清单

| 文件 | 新增用例 | 覆盖点 |
|------|----------|--------|
| TimerDisplay.test.tsx | 5 | aria-live, aria-atomic, role, aria-label 内容及动态更新 |
| settingsStore.test.ts | 5 | setSoundEnabled/setDesktopNotificationEnabled 直接设置 + isDirty |
| useTimer.test.tsx | 1 | notifyPhaseEnd 去重间接验证 |
| **合计** | **11** | |

---

## 四、Bug 清单

未发现 Bug。

| 级别 | 数量 |
|------|------|
| 🔴 Blocker | 0 |
| 🟡 Major | 0 |
| 🔵 Minor | 0 |

---

## 五、回归测试

| 维度 | 结果 |
|------|------|
| 全量测试 | 275/275 通过 |
| 原有测试 | 264/264 无回归 |
| 新增测试 | 11/11 通过 |
| CR 建议 P2-1 (aria 测试) | ✅ 已补充 |
| CR 建议 P2-2 (直接设置测试) | ✅ 已补充 |
| CR 建议 P2-3 (去重测试) | ✅ 已补充 |

---

## 六、风险评估

**风险等级**: 🟢 低

PAL-22 修复的所有 7 个问题（P0-1 ~ P1-4 + Bug #3）均已验证通过，无回归风险。CR 提出的 3 个 P2 测试覆盖建议已全部补充完成。

---

## 七、测试结论

**✅ PASS**

275/275 测试全部通过，PAL-22 修复验证通过，无 Blocker/Major/Minor 级别 Bug。
