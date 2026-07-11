/**
 * useNotification Hook
 *
 * 封装 notifyPhaseEnd 调用，从 settingsStore 读取通知偏好设置，
 * 监听 phase 变化以在阶段结束时触发通知。
 *
 * 职责：
 * - 读取 soundEnabled / desktopNotificationEnabled 设置
 * - 在 phase 变更时调用 notifyPhaseEnd
 * - soundEnabled=false 时不播放声音但桌面通知仍可正常工作
 */

import { useCallback, useRef } from "react";
import { type SettingsStore } from "../stores/settingsStore";
import { notifyPhaseEnd } from "../engine/notification";
import type { Phase } from "../types/timer";

/**
 * useNotification Hook。
 *
 * 返回 notifyPhaseEnd 函数，该函数会读取当前 settingsStore 的通知偏好
 * 并调用 engine/notification 模块发送通知。
 *
 * @param settingsStore - 设置 Store（必需，用于读取通知偏好）
 * @returns 通知触发函数
 */
export function useNotification(settingsStore?: SettingsStore) {
  const settingsRef = useRef<SettingsStore | undefined>(settingsStore);
  settingsRef.current = settingsStore;

  const notifyPhaseEndCallback = useCallback(
    async (phase: Phase) => {
      const store = settingsRef.current;
      if (!store) return;

      const state = store.getState();
      await notifyPhaseEnd(phase, {
        soundEnabled: state.soundEnabled,
        desktopNotificationEnabled: state.desktopNotificationEnabled,
      });
    },
    [],
  );

  return { notifyPhaseEnd: notifyPhaseEndCallback };
}
