# PAL-22 部署清单

**生成日期**: 2026-07-12
**关联 Issue**: PAL-27 (集成验证)
**前置提交**: `5dfdb3d` (master 最新)

---

## 一、部署前置条件检查

- [x] 集成验证通过（见 integration-report.md）
- [x] 测试 275/275 通过
- [x] Vite 构建成功（88 modules）
- [x] CR APPROVED（review-PAL-22.md）
- [x] SR PASS（security-PAL-22.md）
- [x] 无严重/高危安全漏洞
- [ ] **待人工确认**: 生产环境部署审批
- [ ] **待人工确认**: 部署窗口确认

---

## 二、部署步骤

### Step 1: 确认分支最新
```bash
git checkout master
git pull origin master
# 确认 HEAD: 5dfdb3d QA: test report for PAL-22
```

### Step 2: 本地构建验证
```bash
npm install
npm test          # 预期: 275/275 passed
npm run build     # 注意: tsc 有 10 个类型错误（已有技术债），但 vite build 成功
```

### Step 3: 构建 Tauri 应用
```bash
npm run tauri build
```
产出物位于 `src-tauri/target/release/bundle/`

### Step 4: 部署产物
| 产物 | 路径 | 大小 |
|------|------|------|
| Web 前端 | `dist/` | ~290 KB (gzip) |
| Tauri Windows 安装包 | `src-tauri/target/release/bundle/msi/` | 待构建确认 |
| Tauri NSIS 安装包 | `src-tauri/target/release/bundle/nsis/` | 待构建确认 |

### Step 5: 部署后验证
1. 启动应用，确认计时器页面正常渲染
2. 验证无障碍属性：TimerDisplay 的 `aria-live="polite"` 生效
3. 验证托盘图标：tooltip 显示正确的计时器状态（P1-4 修复）
4. 验证设置页：通知开关可直接设置（P1-2 修复）
5. 验证 reset 按钮：running 状态可重置（P1-1 修复）
6. 验证通知去重：快速连续 expire 只触发一次通知（P1-3 修复）

---

## 三、回滚方案

### 回滚触发条件
- 部署后测试失败
- 用户反馈核心功能异常
- 发现严重/高危安全漏洞

### 回滚步骤
```bash
# 回滚到 PAL-22 修复前的提交
git revert 2f73563
git revert e1642cb
git revert 1b6866d
git revert 5dfdb3d
# 或直接切回到上一个稳定版本
git checkout 2bc0400  # QA: test report for PAL-21
```

### 回滚验证
1. 重新运行 `npm test` 确认 264/264 原有测试通过
2. 重新构建并部署
3. 通知用户回滚已完成

---

## 四、已知限制

1. **TypeScript 类型错误**: 10 个（已有技术债，不影响运行）
2. **ESLint 错误**: 16 个（已有技术债，不影响运行）
3. **Prettier 格式化**: 26 文件警告（已有技术债）
4. **无 E2E 测试**: 项目依赖单元测试覆盖，无端到端测试

---

## 五、审批签字

| 角色 | 状态 | 签字 |
|------|------|------|
| 集成验证 (IT) | ✅ 通过 | - |
| 代码审查 (CR) | ✅ 通过 | - |
| 安全审计 (SR) | ✅ 通过 | - |
| 测试验证 (QA) | ✅ 通过 | - |
| 生产部署审批 | ⏳ 待人工 | - |
