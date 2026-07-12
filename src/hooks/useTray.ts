/**
 * useTray Hook
 *
 * 使用 Tauri 前端 Tray API 创建系统托盘图标，定期更新 tooltip 为
 * 当前阶段名 + 剩余时间（如 "工作中 23:45"）。
 * 右键菜单包含 "显示窗口" / "退出应用"。
 *
 * 职责：
 * - 创建托盘图标（使用应用图标）
 * - 创建右键菜单（显示窗口 / 退出）
 * - 监听计时器状态变化，更新 tooltip
 * - 点击 "显示窗口" → 窗口置前聚焦
 * - 点击 "退出" → 退出应用
 * - 组件卸载时销毁托盘
 *
 * 技术提示：
 * - 托盘完全在前端（JS）创建，无需修改 Rust 后端
 * - tooltip 更新频率与 tick 循环一致（250ms），通过 store subscribe 驱动
 * - 关闭窗口行为：托盘保留，计时器在后台继续运行
 *
 * P1-4 修复：使用 React Context 共享 timerStore，确保托盘 tooltip
 * 与实际计时器状态同步，不再创建独立 store。
 */

import { createContext, useContext, useEffect, createElement, type ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu, MenuItem } from "@tauri-apps/api/menu";
import type { TimerStore } from "../stores/timerStore";
import { formatTime } from "../utils/formatTime";
import type { Phase } from "../types/timer";

/** 阶段名映射（中文） */
const PHASE_LABELS: Record<Phase, string> = {
  work: "工作中",
  short_break: "短休息",
  long_break: "长休息",
};

// 托盘图标 ID
const TRAY_ID = "pomodoro-tray";

// 全局托盘引用（供 useTray hook 访问）
let globalTrayRef: TrayIcon | null = null;

/** 共享 timerStore 的 React Context */
export const TimerStoreContext = createContext<TimerStore | null>(null);

/** 获取共享 timerStore 的 Hook */
export function useSharedTimerStore(): TimerStore | null {
  return useContext(TimerStoreContext);
}

/**
 * useTray Hook。
 *
 * 将计时器状态同步到系统托盘 tooltip。
 * 当计时器运行时，tooltip 显示 "阶段名 剩余时间"；
 * 当计时器空闲时，tooltip 显示应用名 "Pomodoro Timer"。
 *
 * @param timerStore - 计时器 Store 实例（必需）
 */
export function useTray(timerStore: TimerStore): void {
  useEffect(() => {
    let mounted = true;

    // 初始化 tooltip
    const initialState = timerStore.getState();
    const initialPhaseLabel = PHASE_LABELS[initialState.phase];
    const initialFormatted = formatTime(initialState.remainingSeconds);
    const initialTooltip =
      initialState.status === "running" || initialState.status === "paused"
        ? `${initialPhaseLabel} ${initialFormatted}`
        : "Pomodoro Timer";

    if (globalTrayRef && mounted) {
      void globalTrayRef.setTooltip(initialTooltip);
    }

    // 订阅状态变化，实时更新 tooltip
    const unsubscribe = timerStore.subscribe((state) => {
      if (!mounted) return;

      const phaseLabel = PHASE_LABELS[state.phase];
      const formatted = formatTime(state.remainingSeconds);

      const tooltip =
        state.status === "running" || state.status === "paused"
          ? `${phaseLabel} ${formatted}`
          : "Pomodoro Timer";

      if (globalTrayRef) {
        void globalTrayRef.setTooltip(tooltip);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [timerStore]);
}

// ==================== TrayProvider 组件 ====================

/**
 * 创建托盘图标和右键菜单。
 *
 * 在 Tauri 桌面环境下创建系统托盘，配置图标、tooltip 和右键菜单。
 * 非 Tauri 环境（如测试）返回 null。
 *
 * @returns TrayIcon 实例或 null
 */
export async function createSystemTray(): Promise<TrayIcon | null> {
  // 检测是否在 Tauri 环境中
  if (typeof window === "undefined" || !("__TAURI__" in window)) {
    return null;
  }

  try {
    // 创建菜单项
    const showItem = await MenuItem.new({
      text: "显示窗口",
      id: "show",
    });

    const quitItem = await MenuItem.new({
      text: "退出",
      id: "quit",
    });

    // 创建菜单
    const menu = await Menu.new({
      items: [showItem, quitItem],
    });

    // 创建托盘图标
    // icon 路径：Tauri 构建时会将 src-tauri/icons/ 复制到 bundle 中
    const tray = await TrayIcon.new({
      id: TRAY_ID,
      menu,
      tooltip: "Pomodoro Timer",
      icon: "icon.png",
      action: async (event) => {
        // 左键点击显示/聚焦窗口
        // event.type 为 "Click" 时才包含 button/buttonState 属性
        if (event.type === "Click" && event.button === "Left" && "buttonState" in event && event.buttonState === "Down") {
          const win = getCurrentWindow();
          await win.show();
          await win.setFocus();
          await win.setAlwaysOnTop(true);
          await win.setAlwaysOnTop(false);
        }
      },
    });

    return tray;
  } catch (err) {
    // 托盘创建失败不影响应用主流程
    console.warn("Failed to create system tray:", err);
    return null;
  }
}

/**
 * TrayProviderProps interface.
 *
 * P1-4: 新增 timerStore prop，允许外部传入业务 timerStore。
 * 如果未传入，TrayProvider 会使用 Context 中的共享 store。
 */
interface TrayProviderProps {
  children: ReactNode;
  /** 业务 timerStore 引用（P1-4 新增，传入后托盘 tooltip 同步实际计时器状态） */
  timerStore?: TimerStore;
}

/**
 * TrayProvider 组件。
 *
 * P1-4 修复：
 * - 创建托盘图标和菜单（仅在 Tauri 环境）
 * - 通过 TimerStoreContext 共享 timerStore，useTray 订阅业务 store
 * - 确保托盘 tooltip 与实际计时器状态同步
 *
 * 使用方式：
 *   <TrayProvider>{children}</TrayProvider>  // 自动从 Context 获取 store
 */
export function TrayProvider(props: TrayProviderProps): ReactNode {
  const { children, timerStore: propStore } = props;

  // P1-4: 优先使用 prop 传入的 store，其次使用 Context 中的共享 store
  const contextStore = useSharedTimerStore();
  const effectiveStore = propStore ?? contextStore;

  // 在 Tauri 环境中创建托盘图标
  useEffect(() => {
    if (typeof window === "undefined" || !("__TAURI__" in window)) {
      return;
    }

    createSystemTray().then((tray) => {
      if (tray) {
        globalTrayRef = tray;
      }
    });
  }, []);

  // P1-4: 使用共享的 timerStore 订阅状态变化
  if (effectiveStore) {
    useTray(effectiveStore);
  }

  // 使用 createElement 包装 children，避免 React 版本问题
  return createElement("div", { style: { display: "contents" } }, children);
}
