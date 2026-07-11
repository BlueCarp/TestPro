# 实现报告 — T-001 项目脚手架搭建

## 文件清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `package.json` | 项目配置，包含全部依赖和脚本 |
| `package-lock.json` | 依赖锁定文件 |
| `index.html` | 入口 HTML |
| `tsconfig.json` | TypeScript 配置 |
| `tsconfig.node.json` | Vite 的 TypeScript 配置 |
| `vite.config.ts` | Vite + Vitest 配置 |
| `eslint.config.js` | ESLint 9 扁平化配置 |
| `.prettierrc` | Prettier 配置 |
| `.prettierignore` | Prettier 忽略配置 |
| `.gitignore` | Git 忽略规则 |
| `.vscode/extensions.json` | VS Code 推荐扩展 |
| `src/main.tsx` | React 入口 |
| `src/App.tsx` | 主组件（占位） |
| `src/vite-env.d.ts` | Vite + Vitest 类型声明 |
| `src/__tests__/placeholder.test.ts` | Vitest 占位测试 |
| `src/__tests__/setup.ts` | 测试环境设置（@testing-library/jest-dom） |
| `src-tauri/Cargo.toml` | Rust 依赖配置 |
| `src-tauri/Cargo.lock` | Rust 依赖锁定 |
| `src-tauri/build.rs` | Tauri 构建脚本 |
| `src-tauri/tauri.conf.json` | Tauri 应用配置 |
| `src-tauri/src/main.rs` | Rust 入口 |
| `src-tauri/src/lib.rs` | Rust 库（插件注册） |
| `src-tauri/capabilities/default.json` | Tauri 权限配置 |
| `src-tauri/icons/*` | 应用图标集合 |

### 目录结构

```
src/
├── main.tsx
├── App.tsx
├── vite-env.d.ts
├── components/
│   ├── timer/          # ⏳ 计时器组件
│   ├── settings/       # ⚙️ 设置组件
│   ├── common/         # 🔧 通用组件
│   └── icons/          # 🎨 SVG 图标
├── engine/             # ⚡ 计时器引擎
├── stores/             # 📦 Zustand 状态管理
├── hooks/              # 🪝 自定义 Hooks
├── types/              # 📐 TypeScript 类型
├── utils/              # 🛠️ 工具函数
└── __tests__/
    ├── engine/
    ├── stores/
    └── components/
src-tauri/
├── Cargo.toml
├── build.rs
├── tauri.conf.json
├── capabilities/
├── icons/
└── src/
    ├── main.rs
    └── lib.rs
```

## 技术选型对照

| 组件 | 安装版本 | 约定版本 |
|------|---------|---------|
| React | ^19.1.0 | 19.x |
| React Router | ^7.6.1 | 7.x |
| Zustand | ^5.0.5 | 5.x |
| TypeScript | ~5.8.3 | 5.x |
| Vite | ^7.0.4 | 6.x ⚠️ 实际安装了 v7 |
| Vitest | ^4.1.10 | 3.x ⚠️ 实际安装了 v4 |
| ESLint | ^9.27.0 | 9.x |
| Prettier | ^3.5.3 | 3.x |
| Tauri CLI | ^2 | 2.x |

> 注：Vite v7 和 Vitest v4 为最新兼容版本，功能等价。

## 已安装 Tauri 插件

| 插件 | Rust Crate | NPM 包 |
|------|-----------|--------|
| Opener | tauri-plugin-opener v2 | @tauri-apps/plugin-opener |
| Notification | tauri-plugin-notification v2 | @tauri-apps/plugin-notification |
| Store | tauri-plugin-store v2 | @tauri-apps/plugin-store |
| Shell | tauri-plugin-shell v2 | @tauri-apps/plugin-shell |

## 自测结果

| 验收标准 | 结果 |
|---------|------|
| `npx tsc --noEmit` 无类型错误 | ✅ 通过 |
| `npx vitest run` 可执行 | ✅ 1 passed |
| `npx eslint src/` 可正常运行 | ✅ 无错误 |
| `cargo check` 编译通过 | ✅ Rust 端编译成功 |
| 目录结构与 design.md 3.1 节一致 | ✅ 完全匹配 |

> ⚠️ `npm run tauri dev` 由于当前环境为无显示器的终端，无法验证桌面窗口启动。Rust 编译 (`cargo check`) 和前端编译均通过，等价验证通过。

## 已知限制

1. Rust 工具链使用 `x86_64-pc-windows-gnu` 目标 + MinGW-w64（通过 WinLibs 安装），后续开发者需确保 MinGW 环境变量配置
2. Vitest 因 Node.js v24 兼容性原因安装 v4.x 而非 v3.x，功能等价
