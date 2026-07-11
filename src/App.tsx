/**
 * App 组件
 *
 * 根组件，配置 React Router v7 路由：
 * - "/" → TimerPage（计时器主页）
 * - "/settings" → SettingsPage（设置页面）
 *
 * 使用 hash 路由模式，兼容 Tauri 桌面应用的 SPA 导航。
 */

import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { TimerPage } from "./components/timer/TimerPage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { TrayProvider } from "./hooks/useTray";

/**
 * 路由配置组件（在 HashRouter 内部，可访问路由）。
 */
function RouterRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TimerPage />} />
      <Route
        path="/settings"
        element={
          <SettingsPage
            onNavigateHome={() => {
              // 导航回主页
              window.location.hash = "";
            }}
          />
        }
      />
      {/* 未知路由重定向到主页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * App 根组件。
 *
 * 外层包裹 HashRouter，内部渲染路由表。
 */
function App() {
  return (
    <HashRouter>
      <TrayProvider>
        <RouterRoutes />
      </TrayProvider>
    </HashRouter>
  );
}

export default App;
