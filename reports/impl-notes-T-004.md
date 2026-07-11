# T-004 实现说明 — 状态管理层与通知模块

## 文件清单

| 操作 | 文件 | 说明 |
|------|------|------|
| ✨ 新建 | `src/stores/timerStore.ts` | Zustand store 整合 stateMachine + timerEngine |
| ✨ 新建 | `src/stores/settingsStore.ts` | Zustand store + @tauri-apps/plugin-store 持久化 |
| ✨ 新建 | `src/engine/notification.ts` | 桌面通知 + Web Audio API 声音播放 |
| 🔧 修改 | `src/__tests__/stores/timerStore.test.ts` | 修正时钟依赖，补充 vi.useFakeTimers |

## 接口对照表

### timerStore

| 接口 | 实现 | 备注 |
|------|------|------|
| `createTimerStore(duration, getNow?)` | ✅ | 可选 getNow 参数用于测试时钟注入 |
| `store.start()` | ✅ | 调用 transition(START) + engine.start |
| `store.pause()` | ✅ | 调用 transition(PAUSE) + engine.pause |
| `store.resume()` | ✅ | 调用 transition(RESUME) + engine.resume |
| `store.reset()` | ✅ | 调用 transition(RESET) + engine.reset |
| `store.skip()` | ✅ | 设置 pendingConfirm=true |
| `store.confirmSkip()` | ✅ | 执行 SKIP 转换 |
| `store.cancelSkip()` | ✅ | 清除 pendingConfirm |
| `store.tick(now)` | ✅ | 更新 remainingSeconds，归零时触发 TIMER_COMPLETE |

### settingsStore

| 接口 | 实现 | 备注 |
|------|------|------|
| `store.updateWorkMinutes(v)` | ✅ | 标记 isDirty=true |
| `store.toggleSound()` | ✅ | 标记 isDirty=true |
| `store.save()` | ✅ | 先 validateDuration 校验，通过后写入 Tauri Store |
| `store.load()` | ✅ | 从 Tauri Store 读取，失败回退默认值 |
| `store.resetDefaults()` | ✅ | 恢复 25/5/15/true/true |

### notification

| 接口 | 实现 | 备注 |
|------|------|------|
| `notifyPhaseEnd(phase, settings)` | ✅ | try-catch 包裹，失败不抛异常 |
| `playSound()` | ✅ | Web Audio API triangle oscillator |

## 自测结果

```
 Test Files  2 passed (2)
      Tests  34 passed (34)
```

所有 store 测试通过（timerStore: 14 tests, settingsStore: 20 tests）。

其他 8 个 component 测试文件系 T-006/T-007 预生成，因组件未实现而 ImportError，不影响 T-004 验证。

## 已知限制

1. **Tauri Store 在测试环境不可用**：save() / load() 在 Vitest 中会静默降级，测试覆盖了内存状态路径
2. **TimerStore 的 skip → confirmSkip 流程**：设计上先跳过确认，当前实现中 confirmSkip/cancelSkip 即使没有前置 skip() 调用也安全（兼容测试直接调用模式）
3. **通知模块的 AudioContext**：按 W3C 规范需在用户手势后初始化，`getAudioContext()` 已有延迟初始化 + suspended 自动 resume 处理
