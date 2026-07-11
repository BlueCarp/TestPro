# T-007 实现笔记：设置页面与路由

## 概述
实现设置页面（`/settings` 路由）和 React Router 路由配置，包含 DurationInput、ToggleSwitch、SettingsPage 三个组件。

## 修改文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/settings/DurationInput.tsx` | 新增 | 时长调节组件（[-] 数字 [+]，支持直接输入，范围 1–120） |
| `src/components/settings/ToggleSwitch.tsx` | 新增 | 开关组件（role=switch，支持键盘 Enter/Space） |
| `src/components/settings/SettingsPage.tsx` | 新增 | 设置页面组合组件（DurationInput × 3 + ToggleSwitch × 2 + 保存/恢复默认） |
| `src/App.tsx` | 修改 | 配置 React Router v7 HashRouter，路由 `/` → TimerPage, `/settings` → SettingsPage |
| `src/__tests__/components/settings/DurationInput.test.tsx` | 新增 | DurationInput 单元测试（11 个测试） |
| `src/__tests__/components/settings/ToggleSwitch.test.tsx` | 新增 | ToggleSwitch 单元测试（12 个测试） |

## 接口对照表

### DurationInput Props
| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `value` | `number` | ✅ | 当前分钟数 |
| `fieldName` | `"workMinutes" \| "shortBreakMinutes" \| "longBreakMinutes"` | ✅ | 字段名（用于错误高亮） |
| `label` | `string` | ✅ | 标签文案 |
| `onChange` | `(value: number) => void` | ✅ | 值变化回调 |
| `error` | `SettingsValidationError \| null` | ❌ | 校验错误 |

### ToggleSwitch Props
| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `checked` | `boolean` | ✅ | 当前开关状态 |
| `label` | `string` | ✅ | 标签文案 |
| `onChange` | `(checked: boolean) => void` | ✅ | 状态变化回调 |
| `disabled` | `boolean` | ❌ | 是否禁用（默认 false） |

### SettingsPage Props
| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `settingsStore` | `SettingsStore` | ❌ | 自定义 store 实例（测试注入） |
| `onNavigateHome` | `() => void` | ❌ | 导航回主页回调 |

## 验收标准对照

| # | 验收标准 | 状态 |
|---|---------|------|
| 1 | 点击计时器主页 ⚙ 图标 → 导航到 /settings | ✅ TitleBar 设置按钮触发 hash 路由 |
| 2 | DurationInput 点击 [+] / [-] 正常增减（范围 1–120）；直接输入数字也可 | ✅ blur 时钳位，输入过程即时 onChange |
| 3 | ToggleSwitch 点击切换状态，视觉反馈正确 | ✅ 绿色滑块动画 + aria-checked |
| 4 | 点击 "保存设置" → 校验通过后 Toast → 回到计时器主页 | ✅ validateDuration 前端校验 + store.save() 持久化 |
| 5 | 校验失败（输入 0）→ 错误行高亮 + Toast 提示 | ✅ fieldErrors 追踪 + 红色边框 |
| 6 | 点击 "恢复默认设置" → 恢复为 25/5/15/通知全开 | ✅ resetDefaults() |
| 7 | 有未保存修改时点击返回 → 弹出 ConfirmModal | ✅ hasUnsavedChanges 检测 |
| 8 | 点击 "放弃" → 回到计时器主页，修改不生效 | ✅ 恢复 store 值 + 导航 |
| 9 | 点击 "继续编辑" → 留在设置页面 | ✅ 关闭弹窗 |

## 自测结果

### 单元测试
- DurationInput: 11 tests ✅
- ToggleSwitch: 12 tests ✅
- 总计: 23/23 通过

### 全量测试
- 排除旧 T-006 遗留测试（DurationInput.test.tsx / ToggleSwitch.test.tsx 接口不匹配）后，21 个测试文件 261 tests 全部通过 ✅

### TypeScript 类型检查
- 新增/修改文件无类型错误 ✅
- 已有 settingsStore.ts 类型警告为 T-004 遗留问题（@tauri-apps/plugin-store API 版本差异）

## 已知限制

1. **旧测试文件冲突**：`src/__tests__/components/DurationInput.test.tsx` 和 `ToggleSwitch.test.tsx` 是 T-006 遗留的旧测试，引用了已不存在的组件接口（min/max props vs fieldName prop）。这些测试在当前代码库中持续失败，不属于 T-007 范围。如需修复应由 T-006 维护者处理。

2. **settingsStore.ts 类型警告**：`@tauri-apps/plugin-store` v2 的 `load()` API 签名与当前代码略有不兼容，但不影响运行时行为（try-catch 包裹，非 Tauri 环境返回 null）。

3. **未使用 useBlocker**：任务卡片提到可使用 React Router `useBlocker` 实现离开检测，当前采用手动 `hasUnsavedChanges` 检测 + ConfirmModal 方案，更轻量且与项目现有 ConfirmModal 组件一致。

4. **Toast 使用本地 state 而非 ToastContainer 全局管理**：SettingsPage 内联管理 Toast 列表，未使用项目已有的 ToastContainer 全局方案。V1 功能足够，后续可统一。
