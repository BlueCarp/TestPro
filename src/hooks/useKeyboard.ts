/**
 * useKeyboard Hook
 *
 * 监听全局键盘事件，将快捷键映射到计时器操作：
 * - 空格键 → start / pause / resume
 * - R 键 → reset（仅 paused 状态）
 * - S 键 → skip
 * - Esc 键 → cancelSkip（关闭确认弹窗）
 *
 * 使用 window.addEventListener('keydown')，V1 不需要 Tauri 全局快捷键 API。
 */

import { useEffect, useRef } from "react";
import { type TimerStore } from "../stores/timerStore";
import type { Status } from "../types/timer";

/**
 * useKeyboard Hook。
 *
 * 绑定全局键盘事件监听器，将按键事件转发到 timerStore 的 action 方法。
 * 组件卸载时自动移除监听器。
 *
 * @param timerStore - 计时器 Store（必需）
 */
export function useKeyboard(timerStore: TimerStore): void {
  const storeRef = useRef<TimerStore>(timerStore);
  storeRef.current = timerStore;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const store = storeRef.current;
      const state = store.getState();
      const status: Status = state.status;
      const key = event.key;

      // 忽略修饰键组合（Ctrl/Command + 其他键），除非是纯 Ctrl 本身
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      // 输入框中不拦截快捷键
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      switch (key) {
        case " ": {
          // 空格键：start / pause / resume
          event.preventDefault();
          if (status === "idle") {
            state.start();
          } else if (status === "running") {
            state.pause();
          } else if (status === "paused") {
            state.resume();
          }
          break;
        }

        case "r":
        case "R": {
          // R 键：reset（仅 paused 状态）
          if (status === "paused") {
            event.preventDefault();
            state.reset();
          }
          break;
        }

        case "s":
        case "S": {
          // S 键：skip
          if (status === "running" || status === "paused") {
            event.preventDefault();
            state.skip();
          }
          break;
        }

        case "Escape": {
          // Esc 键：关闭确认弹窗
          event.preventDefault();
          state.cancelSkip();
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [timerStore]);
}
